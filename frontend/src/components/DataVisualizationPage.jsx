import React, { useEffect, useState } from 'react';
import { fetchSamData } from '../api/samGovApi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DataVisualizationPage = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetchSamData({
          limit: 10,
          dateRange: '1month'
        });
        console.log('API Response:', response);
        
        if (!response) {
          throw new Error('Invalid data format received');
        }

        const opportunities = response.opportunities || [];
        const types = opportunities.map(opportunity => opportunity.type);
        const counts = opportunities.map(opportunity => opportunity.count);
        
        const processedData = {
          labels: types,
          datasets: [
            {
              label: 'Contract Opportunities by Type',
              data: counts,
              backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
              ],
              borderWidth: 1,
            },
          ],
        };
        
        setChartData(processedData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'SAM.gov Contract Opportunities Distribution',
      },
    },
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Contract Opportunities Analysis</h2>
        <div className="bg-white p-4 rounded-lg shadow-lg" style={{ height: '400px' }}>
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default DataVisualizationPage;
