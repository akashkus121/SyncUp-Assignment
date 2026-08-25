import axios from 'axios';
import { FeedItem, ApiResponse } from '../types/feed';

const getBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'https://syncup-assignment-63jq.onrender.com/api';
  const trimmed = envUrl.replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
});

/**
 * Fetch all feeds
 */
export const getFeeds = async (): Promise<ApiResponse<FeedItem[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<FeedItem[]>>('/feed');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching feeds:', error.message);
    throw error;
  }
};

/**
 * Fetch a single feed by ID
 */
export const getFeedById = async (id: string): Promise<ApiResponse<FeedItem>> => {
  try {
    const response = await apiClient.get<ApiResponse<FeedItem>>(`/feed/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching feed:', error.message);
    throw error;
  }
};

/**
 * Create a new feed
 */
export const createFeed = async (feedData: Partial<FeedItem>): Promise<ApiResponse<FeedItem>> => {
  try {
    const response = await apiClient.post<ApiResponse<FeedItem>>('/feed', feedData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating feed:', error.message);
    throw error;
  }
};

/**
 * Update an existing feed
 */
export const updateFeed = async (id: string, feedData: Partial<FeedItem>): Promise<ApiResponse<FeedItem>> => {
  try {
    const response = await apiClient.put<ApiResponse<FeedItem>>(`/feed/${id}`, feedData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating feed:', error.message);
    throw error;
  }
};

/**
 * Like a feed post (increments likes count)
 */
export const likeFeed = async (id: string): Promise<ApiResponse<FeedItem>> => {
  try {
    const response = await apiClient.patch<ApiResponse<FeedItem>>(`/feed/${id}/like`);
    return response.data;
  } catch (error: any) {
    console.error('Error liking feed:', error.message);
    throw error;
  }
};

/**
 * Delete a feed
 */
export const deleteFeed = async (id: string): Promise<ApiResponse<FeedItem>> => {
  try {
    const response = await apiClient.delete<ApiResponse<FeedItem>>(`/feed/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting feed:', error.message);
    throw error;
  }
};

export default apiClient;
