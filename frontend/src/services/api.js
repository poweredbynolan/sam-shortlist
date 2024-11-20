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
