import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config();

// Initialize server
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const SAM_API_URL = 'https://api.sam.gov/opportunities/v2/search';

// Initialize Redis client
const redis = new Redis();

// Cache configuration
const CACHE_TTL = 3600; // 1 hour in seconds
const CACHE_KEY_PREFIX = 'sam:opportunities:';

// Helper function to generate cache key
const generateCacheKey = (params) => {
  const key = `${CACHE_KEY_PREFIX}${params.postedFrom}:${params.postedTo}:${params.limit}:${params.offset}`;
  return key;
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

    // Try to get data from cache first
    const cachedData = await redis.get(cacheKey);
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
        data: parsedData.opportunities,
        total: parsedData.totalRecords,
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
    const opportunities = response.data.opportunitiesData || [];
    
    console.log('Processing complete:', {
      id: requestId,
      timestamp: new Date().toISOString(),
      duration: `${Date.now() - requestStart}ms`,
      opportunitiesCount: opportunities.length,
      dataTypes: [...new Set(opportunities.map(opp => opp.type))]
    });

    // Cache the successful response
    const cacheData = {
      opportunities,
      totalRecords: response.data.totalRecords || 0
    };
    
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(cacheData));
    
    console.log('Data cached:', {
      id: requestId,
      timestamp: new Date().toISOString(),
      cacheKey,
      ttl: CACHE_TTL,
      dataSize: JSON.stringify(cacheData).length
    });

    res.json({
      success: true,
      data: opportunities,
      total: response.data.totalRecords || 0
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
