import axios from 'axios';

// Base API URL - Update this with your actual API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        // Only redirect if not already on auth page
        if (!currentPath.includes('/auth')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth';
        } else {
          // If already on auth page, just clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
    // Sanitize error before rejecting
    if (error.response) {
      const { status, data } = error.response;
      let safeMessage = 'An unexpected issue occurred. Please try again later.';
      const rawMessage = data?.message || data?.error?.message || data?.error;

      if (typeof rawMessage === 'string' && (rawMessage.includes('<html') || rawMessage.includes('<!DOCTYPE') || rawMessage.length > 150)) {
        safeMessage = 'We are currently experiencing technical difficulties. Please try again later.';
      } else if (rawMessage) {
        safeMessage = rawMessage;
      }

      if (status >= 500) {
        safeMessage = 'We are currently experiencing technical difficulties. Please try again later.';
      }

      // Ensure error.message is safe
      error.message = safeMessage;
      if (error.response.data) {
        if (typeof error.response.data === 'object') {
          error.response.data.message = safeMessage;
        }
      }
    } else if (error.request) {
      error.message = 'We are unable to reach the server. Please check your internet connection and try again.';
    } else {
      error.message = 'An unexpected issue occurred while processing your request. Please try again.';
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/user/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/user/register', {
      fullname: userData.fullname,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      role: userData.role || 'user', // Default to 'user' role
      roleDetails: userData.roleDetails || {},
    });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/user/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post(`/user/reset-password/${token}`, { password });
    return response.data;
  },

  logout: async () => {
    try {
      await api.get('/user/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage even if API fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// User Profile APIs
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateAddress: async (address) => {
    const response = await api.put('/user/update-address', { address });
    return response.data;
  },

  getProfileById: async (userId) => {
    const response = await api.get(`/customer/get-profile/${userId}`);
    return response.data;
  },
};

// Product APIs
export const productAPI = {
  getAllProducts: async (params = {}) => {
    const { page = 1, limit = 10, search = '' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    const response = await api.get(`/customer/get-products?${queryParams}`);
    return response.data;
  },

  getProductById: async (productId) => {
    const response = await api.get(`/customer/get-products/${productId}`);
    return response.data;
  },
};

export default api;
