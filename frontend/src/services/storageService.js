import { setCookie, getCookie, COOKIE_KEYS } from '../utils/cookieManager';
import localforage from 'localforage';

// Initialize localforage instances for different storage purposes
const opportunityCache = localforage.createInstance({
  name: 'samGov',
  storeName: 'opportunities'
});

const searchCache = localforage.createInstance({
  name: 'samGov',
  storeName: 'searches'
});

const metadataCache = localforage.createInstance({
  name: 'samGov',
  storeName: 'metadata'
});

// Cache configuration
const CACHE_CONFIG = {
  OPPORTUNITY_TTL: 24 * 60 * 60 * 1000, // 24 hours
  SEARCH_TTL: 12 * 60 * 60 * 1000,      // 12 hours
  METADATA_TTL: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Storage keys
export const STORAGE_KEYS = {
  FREQUENTLY_VIEWED: 'frequently_viewed',
  SEARCH_PATTERNS: 'search_patterns',
  CATEGORY_STATS: 'category_stats',
  PERFORMANCE_METRICS: 'performance_metrics',
  API_ERROR_LOG: 'api_error_log',
  DOWNLOAD_QUEUE: 'download_queue',
  OFFLINE_DATA: 'offline_data',
  USER_ACTIVITY: 'user_activity',
  DATA_VERSION: 'data_version'
};

class StorageService {
  constructor() {
    this.initializeStorageMetrics();
  }

  /**
   * Initialize storage metrics tracking
   */
  async initializeStorageMetrics() {
    try {
      // Track storage usage
      const estimate = await navigator.storage.estimate();
      console.log('Storage metrics:', {
        timestamp: new Date().toISOString(),
        quota: estimate.quota,
        usage: estimate.usage,
        percentageUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2) + '%'
      });
    } catch (error) {
      console.error('Failed to get storage metrics:', error);
    }
  }

  /**
   * Store opportunity data with metadata
   */
  async storeOpportunity(id, data) {
    try {
      const storageItem = {
        data,
        timestamp: Date.now(),
        metadata: {
          lastAccessed: Date.now(),
          accessCount: 1,
          size: JSON.stringify(data).length
        }
      };
      await opportunityCache.setItem(id, storageItem);
      await this.updateStorageMetrics('opportunity', storageItem.metadata.size);
    } catch (error) {
      console.error('Failed to store opportunity:', error);
    }
  }

  /**
   * Retrieve opportunity data with access tracking
   */
  async getOpportunity(id) {
    try {
      const item = await opportunityCache.getItem(id);
      if (!item) return null;

      // Check if data is still valid
      if (Date.now() - item.timestamp > CACHE_CONFIG.OPPORTUNITY_TTL) {
        await opportunityCache.removeItem(id);
        return null;
      }

      // Update access metrics
      item.metadata.lastAccessed = Date.now();
      item.metadata.accessCount++;
      await opportunityCache.setItem(id, item);

      // Track frequently viewed items
      await this.updateFrequentlyViewed(id);

      return item.data;
    } catch (error) {
      console.error('Failed to retrieve opportunity:', error);
      return null;
    }
  }

  /**
   * Store search results with pattern analysis
   */
  async storeSearchResults(query, results) {
    try {
      const searchItem = {
        query,
        results,
        timestamp: Date.now(),
        metadata: {
          resultCount: results.length,
          executionTime: results.executionTime || 0
        }
      };
      await searchCache.setItem(query, searchItem);
      await this.updateSearchPatterns(query);
    } catch (error) {
      console.error('Failed to store search results:', error);
    }
  }

  /**
   * Track and analyze search patterns
   */
  async updateSearchPatterns(query) {
    try {
      const patterns = await metadataCache.getItem(STORAGE_KEYS.SEARCH_PATTERNS) || {
        queries: {},
        categories: {},
        timeDistribution: {}
      };

      // Update query frequency
      patterns.queries[query] = (patterns.queries[query] || 0) + 1;

      // Update time distribution
      const hour = new Date().getHours();
      patterns.timeDistribution[hour] = (patterns.timeDistribution[hour] || 0) + 1;

      await metadataCache.setItem(STORAGE_KEYS.SEARCH_PATTERNS, patterns);
    } catch (error) {
      console.error('Failed to update search patterns:', error);
    }
  }

  /**
   * Track frequently viewed opportunities
   */
  async updateFrequentlyViewed(id) {
    try {
      const frequentlyViewed = await metadataCache.getItem(STORAGE_KEYS.FREQUENTLY_VIEWED) || {};
      frequentlyViewed[id] = (frequentlyViewed[id] || 0) + 1;
      await metadataCache.setItem(STORAGE_KEYS.FREQUENTLY_VIEWED, frequentlyViewed);
    } catch (error) {
      console.error('Failed to update frequently viewed:', error);
    }
  }

  /**
   * Store performance metrics
   */
  async storePerformanceMetrics(metrics) {
    try {
      const currentMetrics = await metadataCache.getItem(STORAGE_KEYS.PERFORMANCE_METRICS) || [];
      currentMetrics.push({
        ...metrics,
        timestamp: Date.now()
      });

      // Keep last 100 metrics
      if (currentMetrics.length > 100) {
        currentMetrics.shift();
      }

      await metadataCache.setItem(STORAGE_KEYS.PERFORMANCE_METRICS, currentMetrics);
    } catch (error) {
      console.error('Failed to store performance metrics:', error);
    }
  }

  /**
   * Store API errors for analysis
   */
  async logApiError(error) {
    try {
      const errorLog = await metadataCache.getItem(STORAGE_KEYS.API_ERROR_LOG) || [];
      errorLog.push({
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack
        },
        timestamp: Date.now()
      });

      // Keep last 50 errors
      if (errorLog.length > 50) {
        errorLog.shift();
      }

      await metadataCache.setItem(STORAGE_KEYS.API_ERROR_LOG, errorLog);
    } catch (error) {
      console.error('Failed to log API error:', error);
    }
  }

  /**
   * Queue data for offline access
   */
  async queueForOffline(data) {
    try {
      const offlineQueue = await metadataCache.getItem(STORAGE_KEYS.OFFLINE_DATA) || [];
      offlineQueue.push({
        data,
        timestamp: Date.now()
      });

      await metadataCache.setItem(STORAGE_KEYS.OFFLINE_DATA, offlineQueue);
    } catch (error) {
      console.error('Failed to queue offline data:', error);
    }
  }

  /**
   * Track user activity patterns
   */
  async trackUserActivity(activity) {
    try {
      const userActivity = await metadataCache.getItem(STORAGE_KEYS.USER_ACTIVITY) || {
        sessions: [],
        patterns: {}
      };

      userActivity.sessions.push({
        ...activity,
        timestamp: Date.now()
      });

      // Keep last 50 sessions
      if (userActivity.sessions.length > 50) {
        userActivity.sessions.shift();
      }

      // Update activity patterns
      const hour = new Date().getHours();
      userActivity.patterns[hour] = (userActivity.patterns[hour] || 0) + 1;

      await metadataCache.setItem(STORAGE_KEYS.USER_ACTIVITY, userActivity);
    } catch (error) {
      console.error('Failed to track user activity:', error);
    }
  }

  /**
   * Update storage metrics
   */
  async updateStorageMetrics(type, size) {
    try {
      const metrics = await metadataCache.getItem('storage_metrics') || {
        types: {},
        totalSize: 0
      };

      metrics.types[type] = (metrics.types[type] || 0) + size;
      metrics.totalSize += size;
      metrics.lastUpdated = Date.now();

      await metadataCache.setItem('storage_metrics', metrics);
    } catch (error) {
      console.error('Failed to update storage metrics:', error);
    }
  }

  /**
   * Clean up expired data
   */
  async cleanupExpiredData() {
    try {
      const now = Date.now();

      // Clean up opportunities
      const opportunities = await opportunityCache.keys();
      for (const key of opportunities) {
        const item = await opportunityCache.getItem(key);
        if (now - item.timestamp > CACHE_CONFIG.OPPORTUNITY_TTL) {
          await opportunityCache.removeItem(key);
        }
      }

      // Clean up searches
      const searches = await searchCache.keys();
      for (const key of searches) {
        const item = await searchCache.getItem(key);
        if (now - item.timestamp > CACHE_CONFIG.SEARCH_TTL) {
          await searchCache.removeItem(key);
        }
      }

      console.log('Storage cleanup completed:', {
        timestamp: new Date().toISOString(),
        opportunitiesChecked: opportunities.length,
        searchesChecked: searches.length
      });
    } catch (error) {
      console.error('Failed to cleanup expired data:', error);
    }
  }
}

export const storageService = new StorageService();
