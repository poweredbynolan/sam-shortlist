import axios from 'axios';

const API_KEY = import.meta.env.VITE_SAM_API_KEY;
const PROXY_URL = 'http://localhost:3001/api/sam/opportunities';

export const fetchSamData = async () => {
  try {
    console.log('Fetching SAM.gov opportunities with API key:', API_KEY ? 'Present' : 'Missing');
    
    if (!API_KEY) {
      throw new Error('SAM.gov API key is missing. Please check your environment variables.');
    }

    const response = await axios.get(PROXY_URL);
    console.log('SAM.gov API Response:', {
      success: response.data.success,
      total: response.data.total,
      dataLength: response.data.data?.length
    });
    
    if (!response.data.success || !response.data.data) {
      throw new Error('Failed to fetch opportunities data');
    }

    // Process the opportunities data for visualization
    const opportunities = response.data.data;
    
    // Group opportunities by type
    const typeGroups = opportunities.reduce((acc, opp) => {
      const type = opp.type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Convert to array format for visualization
    const chartData = Object.entries(typeGroups)
      .map(([type, count]) => ({
        label: getNoticeTypeLabel(type),
        value: count,
        description: getNoticeTypeDescription(type)
      }))
      .sort((a, b) => b.value - a.value);

    console.log('Processed data for visualization:', chartData);
    return chartData;

  } catch (error) {
    console.error('Error fetching SAM.gov data:', {
      message: error.message,
      response: error.response?.data
    });
    
    let errorMessage = 'Failed to fetch SAM.gov data: ';
    if (error.response?.data?.error?.message) {
      errorMessage += error.response.data.error.message;
    } else {
      errorMessage += error.message;
    }
    
    throw new Error(errorMessage);
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
