import axios from 'axios';
import { userPreferences } from '../services/userPreferences';
import { setCookie, getCookie, COOKIE_KEYS } from '../utils/cookieManager';
import { storageService } from '../services/storageService';

const API_KEY = import.meta.env.VITE_SAM_API_KEY;
const PROXY_URL = 'http://localhost:3001/api/sam/opportunities';

// Log initialization status
console.log('Initializing SAM.gov API client:', {
  proxyUrl: PROXY_URL,
  apiKeyPresent: !!API_KEY,
  environment: import.meta.env.MODE
});

// Cache configuration
const CACHE_TTL = 3600 * 1000; // 1 hour in milliseconds
const CACHE_KEY_PREFIX = 'sam:client:';

// In-memory cache
const cache = new Map();

// Helper function to generate cache key
const generateCacheKey = (params) => {
  return `${CACHE_KEY_PREFIX}${JSON.stringify(params)}`;
};

// Helper function to check if cache entry is still valid
const isCacheValid = (entry) => {
  return entry && Date.now() - entry.timestamp < CACHE_TTL;
};

// Track recent searches in cookie
const updateRecentSearches = async (params) => {
  const recentSearches = await getCookie(COOKIE_KEYS.RECENT_SEARCHES) || [];
  const newSearch = {
    params,
    timestamp: new Date().toISOString()
  };
  
  // Add to beginning, limit to 10 recent searches
  recentSearches.unshift(newSearch);
  if (recentSearches.length > 10) recentSearches.pop();
  
  await setCookie(COOKIE_KEYS.RECENT_SEARCHES, recentSearches);
};

// Update last visit timestamp
const updateLastVisit = async () => {
  await setCookie(COOKIE_KEYS.LAST_VISIT, new Date().toISOString());
};

/**
 * Fetches data from SAM.gov API with enhanced caching and analytics
 */
export const fetchSamData = async (params = {}) => {
  const startTime = performance.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    // Apply user preferences to params
    const userPrefs = await userPreferences.getAll();
    const enrichedParams = {
      ...params,
      limit: params.limit || userPrefs.resultsPerPage,
      dateRange: params.dateRange || userPrefs.dateRange
    };

    // Start tracking performance
    const perfMetrics = {
      requestId,
      startTime,
      params: enrichedParams,
      userPreferences: userPrefs
    };

    console.log('Initiating SAM.gov API request:', {
      id: requestId,
      timestamp: new Date().toISOString(),
      params: enrichedParams,
      userPreferences: userPrefs
    });

    // Check storage cache first
    const cacheKey = generateCacheKey(enrichedParams);
    const cachedData = await storageService.getOpportunity(cacheKey);

    if (cachedData) {
      const duration = performance.now() - startTime;
      console.log('Storage cache hit:', {
        id: requestId,
        timestamp: new Date().toISOString(),
        duration: `${duration.toFixed(2)}ms`,
        cacheKey
      });

      // Update performance metrics
      perfMetrics.duration = duration;
      perfMetrics.cacheHit = true;
      await storageService.storePerformanceMetrics(perfMetrics);

      // Track user activity
      await storageService.trackUserActivity({
        type: 'search',
        source: 'cache',
        params: enrichedParams,
        duration
      });

      return cachedData;
    }

    // Track the search in recent searches and update last visit
    await updateRecentSearches(enrichedParams);
    await updateLastVisit();

    console.log('Storage cache miss:', {
      id: requestId,
      timestamp: new Date().toISOString(),
      cacheKey
    });

    // Make API request
    const response = await axios.get('/api/sam/opportunities', { params: enrichedParams });
    const duration = performance.now() - startTime;

    // Update performance metrics
    perfMetrics.duration = duration;
    perfMetrics.cacheHit = false;
    perfMetrics.apiStatus = response.status;
    await storageService.storePerformanceMetrics(perfMetrics);

    // Store successful response
    if (response.data.success) {
      await storageService.storeOpportunity(cacheKey, response.data);

      // Queue important data for offline access
      if (response.data.opportunities?.some(opp => opp.importance === 'high')) {
        await storageService.queueForOffline(response.data);
      }
    }

    // Track user activity
    await storageService.trackUserActivity({
      type: 'search',
      source: 'api',
      params: enrichedParams,
      duration,
      resultCount: response.data.opportunities?.length || 0
    });

    return {
      ...response.data,
      userPreferences: userPrefs,
      recentSearches: await getCookie(COOKIE_KEYS.RECENT_SEARCHES) || [],
      metrics: {
        duration: `${duration.toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
        cached: false
      }
    };

  } catch (error) {
    const duration = performance.now() - startTime;
    const errorDetails = {
      timestamp: new Date().toISOString(),
      duration: `${duration.toFixed(2)}ms`,
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
      response: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      }
    };

    // Log error for analysis
    await storageService.logApiError(errorDetails);

    console.error('SAM.gov API request failed:', errorDetails);
    throw error;
  }
};

// Helper function to get a user-friendly label for notice types
function getNoticeTypeLabel(type) {
  const labels = {
    'o': 'Opportunity',
    'p': 'Pre-solicitation',
    'k': 'Combined Synopsis',
    'r': 'Sources Sought',
    'g': 'Surplus Property',
    'a': 'Award Notice',
    's': 'Special Notice',
    'i': 'Intent to Bundle'
  };
  return labels[type.toLowerCase()] || type;
}

// Helper function to get detailed descriptions for notice types
function getNoticeTypeDescription(type) {
  const descriptions = {
    'o': 'Active contract opportunity open for bidding',
    'p': 'Advance notice of a future contract opportunity',
    'k': 'Combined synopsis and solicitation for commercial items',
    'r': 'Market research to identify potential contractors',
    'g': 'Notice of sale of government surplus property',
    'a': 'Announcement of contract award',
    's': 'Special announcement or supplemental information',
    'i': 'Notice of intent to bundle contract requirements'
  };
  return descriptions[type.toLowerCase()] || type;
}
