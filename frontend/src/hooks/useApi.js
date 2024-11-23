import { useState, useEffect } from 'react';

/**
 * Custom hook for managing API calls with loading, error, and pagination states.
 * @param {Function} apiCall - The API call function to execute.
 * @param {Array} dependencies - Dependencies array for useEffect.
 * @returns {Object} - { data, loading, error, setPage, total }
 */
export function useApi(apiCall, dependencies = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await apiCall(page);
        setData(result.data);
        setTotal(result.total);
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiCall, page, ...dependencies]);

  return { data, loading, error, setPage, total };
}

/**
 * Utility function for making API requests.
 * @param {string} url - The API endpoint URL.
 * @param {Object} options - Fetch options.
 * @returns {Promise<Object>} - The response data.
 */
export async function fetchApi(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const message = `An error has occurred: ${response.status}`;
    throw new Error(message);
  }
  return response.json();
}
