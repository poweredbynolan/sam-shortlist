import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { config } from 'dotenv';
import Redis from 'ioredis';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

// Initialize server
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const SAM_API_URL = 'https://api.sam.gov/opportunities/v2/search';

// Initialize Redis client if configured
let redis;
try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL);
    console.log('Redis connected successfully');
  } else {
    console.log('Redis URL not configured, running without cache');
  }
} catch (error) {
  console.warn('Redis connection failed, continuing without caching:', error.message);
}

// Cache configuration
const CACHE_TTL = 3600; // 1 hour in seconds
const CACHE_KEY_PREFIX = 'sam:opportunities:';

// Helper function to generate cache key
const generateCacheKey = (params) => {
  return `${CACHE_KEY_PREFIX}${JSON.stringify(params)}`;
};

// Log server initialization
console.log('Initializing server:', {
  timestamp: new Date().toISOString(),
  port: PORT,
  samApiUrl: SAM_API_URL,
  environment: process.env.NODE_ENV,
  apiKeyExists: !!process.env.VITE_SAM_API_KEY
});

// Add detailed request logging middleware
app.use((req, res, next) => {
  const requestStart = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  // Log request details
  console.log('Incoming request:', {
    id: requestId,
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? '[REDACTED]' : undefined
    },
    ip: req.ip
  });

  // Add response logging
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - requestStart;
    
    // Log response details
    console.log('Outgoing response:', {
      id: requestId,
      timestamp: new Date().toISOString(),
      duration: `${responseTime}ms`,
      status: res.statusCode,
      headers: res.getHeaders(),
      size: Buffer.byteLength(data),
      path: req.path
    });

    originalSend.call(this, data);
  };

  next();
});

app.get('/api/sam/opportunities', async (req, res) => {
  const requestStart = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    const API_KEY = process.env.VITE_SAM_API_KEY;
    if (!API_KEY) {
      throw new Error('API key not found in environment variables');
    }

    console.log('Processing SAM.gov API request:', {
      id: requestId,
      timestamp: new Date().toISOString(),
      endpoint: SAM_API_URL
    });

    // Format dates in MM/dd/yyyy format as required by SAM.gov API
    const formatDate = (date) => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    // SAM.gov API parameters
    const params = {
      postedFrom: formatDate(oneMonthAgo),
      postedTo: formatDate(today),
      limit: 10,
      offset: 0,
      api_key: API_KEY
    };

    // Generate cache key
    const cacheKey = generateCacheKey(params);

    // Try to get data from cache first if Redis is available
    let cachedData;
    if (redis) {
      try {
        cachedData = await redis.get(cacheKey);
      } catch (error) {
        console.warn('Redis get failed:', error.message);
      }
    }

    if (cachedData) {
      console.log('Cache hit:', {
        id: requestId,
        timestamp: new Date().toISOString(),
        cacheKey,
        duration: `${Date.now() - requestStart}ms`
      });
      
      const parsedData = JSON.parse(cachedData);
      return res.json({
        success: true,
        data: parsedData,
        fromCache: true
      });
    }

    console.log('Cache miss:', {
      id: requestId,
      timestamp: new Date().toISOString(),
      cacheKey
    });

    console.log('SAM.gov API request parameters:', {
      id: requestId,
      timestamp: new Date().toISOString(),
      params: {
        ...params,
        api_key: '[REDACTED]'
      }
    });

    const response = await axios({
      method: 'GET',
      url: SAM_API_URL,
      params: params,
      headers: {
        'accept': 'application/json'
      }
    });

    const responseTime = Date.now() - requestStart;
    console.log('SAM.gov API response received:', {
      id: requestId,
      timestamp: new Date().toISOString(),
      duration: `${responseTime}ms`,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      dataSize: JSON.stringify(response.data).length,
      recordCount: response.data?.opportunitiesData?.length || 0
    });
    
    if (!response.data) {
      throw new Error('No data received from SAM.gov API');
    }

    // Transform the response data
    const opportunities = (response.data.opportunitiesData || []).map(opp => ({
      title: opp.title || 'Untitled Opportunity',
      solicitationNumber: opp.solicitationNumber,
      type: opp.type || opp.noticeType || 'Unknown',
      postedDate: opp.postedDate,
      responseDeadline: opp.responseDeadline,
      description: opp.description,
      department: opp.department,
      subtier: opp.subtier,
      office: opp.office,
      location: opp.placeOfPerformance,
      naicsCode: opp.naicsCode,
      value: 1  // For visualization counting
    }));

    // Group opportunities by type for visualization
    const opportunitiesByType = opportunities.reduce((acc, opp) => {
      acc[opp.type] = (acc[opp.type] || 0) + 1;
      return acc;
    }, {});

    const transformedData = {
      opportunities,
      opportunitiesByType,
      totalRecords: response.data.totalRecords || 0,
      metadata: {
        types: Object.keys(opportunitiesByType),
        counts: Object.values(opportunitiesByType)
      }
    };

    // Cache the successful response if Redis is available
    if (redis) {
      try {
        await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(transformedData));
        console.log('Data cached:', {
          id: requestId,
          timestamp: new Date().toISOString(),
          cacheKey,
          ttl: CACHE_TTL,
          dataSize: JSON.stringify(transformedData).length
        });
      } catch (error) {
        console.warn('Redis set failed:', error.message);
      }
    }

    res.json({
      success: true,
      data: transformedData,
      fromCache: false
    });
  } catch (error) {
    const errorDetails = {
      id: requestId,
      timestamp: new Date().toISOString(),
      duration: `${Date.now() - requestStart}ms`,
      name: error.name,
      message: error.message,
      stack: error.stack,
      response: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      }
    };

    console.error('SAM.gov API request failed:', errorDetails);

    res.status(error.response?.status || 500).json({
      success: false,
      error: {
        message: error.message,
        details: error.response?.data
      }
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', {
    timestamp: new Date().toISOString(),
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    },
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      headers: req.headers
    }
  });

  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('Server started:', {
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV,
    url: `http://localhost:${PORT}`
  });
});
