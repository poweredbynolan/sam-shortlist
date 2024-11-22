import axios from 'axios';
import { mockOrganizations, mockSetAsides } from '../data/mockFilters';
import { getPaginatedOpportunities } from '../data/mockOpportunities';

const api = axios.create({
  baseURL: 'http://localhost:8001/api',
});

export const searchOpportunities = async (params) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return getPaginatedOpportunities(params.page || 1, params.pageSize || 10);
};

export const getOrganizations = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockOrganizations;
};

export const getSetAsides = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockSetAsides;
};

export const getOpportunity = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For now, return mock data
  return {
    id,
    title: "Sample Contract Opportunity",
    agency: "Department of Defense",
    description: "This is a detailed description of the contract opportunity...",
    estimatedValue: 1000000,
    dueDate: "2024-02-01",
    setAsideType: "Small Business",
    placeOfPerformance: "Washington, DC",
    solicitation: "DOD-2024-001",
    naicsCode: "541330",
    postedDate: "2024-01-01",
    documents: [
      {
        id: 1,
        name: "Statement of Work",
        url: "#"
      },
      {
        id: 2,
        name: "Technical Requirements",
        url: "#"
      }
    ]
  };
};
