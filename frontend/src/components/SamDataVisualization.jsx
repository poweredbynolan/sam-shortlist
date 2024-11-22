import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function SamDataVisualization({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4 bg-white rounded-lg shadow">
        <p className="font-medium">No SAM.gov data available</p>
        <p className="text-sm mt-2">This could be due to:</p>
        <ul className="text-sm list-disc list-inside mt-1">
          <li>API key configuration issues</li>
          <li>Network connectivity problems</li>
          <li>SAM.gov service availability</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Business Types Distribution</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="label" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="value" 
              fill="#4F46E5" 
              name="Number of Entities" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
