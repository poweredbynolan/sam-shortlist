import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const SAM_API_URL = 'https://api.sam.gov/opportunities/v2/search';

// Add detailed request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.body,
    headers: req.headers
  });
  next();
});

app.get('/api/sam/opportunities', async (req, res) => {
  try {
    const API_KEY = process.env.VITE_SAM_API_KEY;
    if (!API_KEY) {
      throw new Error('API key not found in environment variables');
    }

    console.log('Proxying request to SAM.gov Opportunities API');

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

    console.log('Request parameters:', {
      ...params,
      api_key: '[REDACTED]'
    });
    console.log('Request URL:', SAM_API_URL);

    const response = await axios({
      method: 'GET',
      url: SAM_API_URL,
      params: params,
      headers: {
        'accept': 'application/json'
      }
    });

    console.log('SAM.gov API response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    
    if (!response.data) {
      throw new Error('No data received from SAM.gov API');
    }

    // Transform the response data
    const opportunities = response.data.opportunitiesData || [];
    console.log(`Retrieved ${opportunities.length} opportunities`);

    res.json({
      success: true,
      data: opportunities,
      total: response.data.totalRecords || 0
    });

  } catch (error) {
    console.error('Proxy server error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      stack: error.stack
    });

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

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log('Environment variables loaded:', {
    API_KEY_EXISTS: !!process.env.VITE_SAM_API_KEY
  });
});
