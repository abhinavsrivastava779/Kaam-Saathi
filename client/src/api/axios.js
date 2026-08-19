import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const API = axios.create({
  baseURL: API_URL
    ? `${API_URL.replace(/\/$/, '')}/api`
    : '/api',

  timeout: 15000,

  headers: {
    'Content-Type': 'application/json'
  }
});


// =====================================================
// AUTH TOKEN INTERCEPTOR
// =====================================================

API.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem('kaam_saathi_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

API.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {

    // Server/API error
    if (error.response) {
      console.error(
        'API Error:',
        error.response.status,
        error.response.data
      );
    }

    // Network/server unavailable
    else if (error.request) {
      console.error(
        'Network Error: Backend server unreachable.'
      );
    }

    else {
      console.error(
        'Request Error:',
        error.message
      );
    }

    return Promise.reject(error);
  }
);

export default API;
