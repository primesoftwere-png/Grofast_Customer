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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
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
