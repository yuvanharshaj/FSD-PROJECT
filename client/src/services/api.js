import axios from 'axios';
import toast from 'react-hot-toast';

// Configure Axios instance with environment-aware API base URL (Vercel or local proxy)
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Bearer token to outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartpark_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor handling 401 token expiration and session cleanup
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid redirect loops on the login page itself
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('smartpark_token');
        localStorage.removeItem('smartpark_user');
        toast.error('Your session expired, please log in again.');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
