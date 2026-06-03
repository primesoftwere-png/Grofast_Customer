"use client";

import axios from 'axios';
import { API_CONFIG } from '@/config/api.config';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
});

// Flag to prevent multiple simultaneous redirects
let isRedirecting = false;

// Request interceptor - Add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (only in browser)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Log request for debugging (remove in production)
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`API Response: ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    
    // Return the data directly for easier consumption
    return response.data;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data, config } = error.response;
      
      console.error('API Error Response:', {
        status,
        url: config?.url,
        method: config?.method,
        data
      });
      
      // Handle 401 Unauthorized - redirect to login
      if (status === 401) {
        if (typeof window !== 'undefined' && !isRedirecting) {
          const currentPath = window.location.pathname;
          // Only clear storage and redirect if not already on auth-related pages
          const authPages = ['/auth', '/login', '/register', '/forgot-password', '/otp-verification'];
          const isOnAuthPage = authPages.some(page => currentPath.includes(page));
          
          if (!isOnAuthPage) {
            console.log('🔒 Unauthorized - redirecting to login');
            isRedirecting = true;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Use setTimeout to avoid redirect loops
            setTimeout(() => {
              window.location.href = '/auth';
            }, 100);
          } else {
            // If already on auth page, just clear storage without redirect
            console.log('🔒 Unauthorized on auth page - clearing storage only');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      }
      
      // Handle 403 Forbidden
      if (status === 403) {
        console.error('Access forbidden:', data);
      }
      
      // Handle 404 Not Found
      if (status === 404) {
        console.error('Resource not found:', config?.url);
      }
      
      // Handle 500 Server Error
      if (status >= 500) {
        console.error('Server error:', data);
      }
      
      // Return structured error
      return Promise.reject({
        status,
        url: config?.url,
        message: data?.message || data?.error?.message || 'An error occurred',
        error: data?.error || data,
        data: data
      });
      
    } else if (error.request) {
      // Request was made but no response received (network error)
      console.error('Network Error - No response received:', error.request);
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your internet connection.',
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to reach the server'
        }
      });
      
    } else {
      // Something else happened
      console.error('Request Setup Error:', error.message);
      return Promise.reject({
        status: 0,
        message: error.message || 'An unexpected error occurred',
        error: {
          code: 'UNKNOWN_ERROR',
          message: error.message
        }
      });
    }
  }
);

// Export the configured axios instance
export default apiClient;
