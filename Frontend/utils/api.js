import axios from 'axios';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const trimmedApiUrl = rawApiUrl.replace(/\/$/, '');
const API_BASE_URL = trimmedApiUrl.endsWith('/api')
  ? trimmedApiUrl
  : `${trimmedApiUrl}/api`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

/**
 * Fetch all feeds
 */
export const getFeeds = async () => {
  try {
    const response = await apiClient.get('/feed');
    return response.data;
  } catch (error) {
    console.error('Error fetching feeds:', error.message);
    throw error;
  }
};

/**
 * Fetch a single feed by ID
 */
export const getFeedById = async (id) => {
  try {
    const response = await apiClient.get(`/feed/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching feed:', error.message);
    throw error;
  }
};

/**
 * Create a new feed
 */
export const createFeed = async (feedData) => {
  try {
    const response = await apiClient.post('/feed', feedData);
    return response.data;
  } catch (error) {
    console.error('Error creating feed:', error.message);
    throw error;
  }
};

/**
 * Update an existing feed
 */
export const updateFeed = async (id, feedData) => {
  try {
    const response = await apiClient.put(`/feed/${id}`, feedData);
    return response.data;
  } catch (error) {
    console.error('Error updating feed:', error.message);
    throw error;
  }
};

/**
 * Delete a feed
 */
export const deleteFeed = async (id) => {
  try {
    const response = await apiClient.delete(`/feed/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting feed:', error.message);
    throw error;
  }
};

export default apiClient;
