import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const webflowApi = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for logging
webflowApi.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
webflowApi.interceptors.response.use(
  (response) => {
    console.log(`Response received:`, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const api = {
  // Health check
  healthCheck: () => webflowApi.get('/health'),
  
  // Collections
  getCollections: (siteId) => webflowApi.get(`/collections/site/${siteId}`),
  getCollection: (collectionId) => webflowApi.get(`/collections/${collectionId}`),
  getCollectionFields: (collectionId) => webflowApi.get(`/collections/${collectionId}/fields`),
  
  // Items
  getItems: (collectionId) => webflowApi.get(`/collections/${collectionId}/items`),
  createItem: (collectionId, data) => webflowApi.post(`/collections/${collectionId}/items`, data),
  updateItem: (collectionId, itemId, data) => webflowApi.put(`/collections/${collectionId}/items/${itemId}`, data),
  deleteItem: (collectionId, itemId) => webflowApi.delete(`/collections/${collectionId}/items/${itemId}`),
};
