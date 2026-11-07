import axios from 'axios';

// Create pre-configured Axios instance for all API calls
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT authentication token from localStorage to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartpark_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Centralized response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('smartpark_token');
        localStorage.removeItem('smartpark_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
