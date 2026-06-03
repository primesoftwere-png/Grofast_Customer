"use client";

import apiClient from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';

/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */
export const authAPI = {
  /**
   * Register a new user
   * @param {Object} data - Registration data (email, password, name, etc.)
   * @returns {Promise} Registration response
   */
  register: async (data) => {
    return await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
  },

  /**
   * Login user
   * @param {Object} data - Login credentials (email, password)
   * @returns {Promise} Login response with token and user data
   */
  login: async (data) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
    
    // Store token and user data in localStorage
    if (response.success && response.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Dispatch custom event to notify cart to refresh
        window.dispatchEvent(new Event('cartRefresh'));
        console.log('Login successful - cart refresh event dispatched');
      }
    }
    
    return response;
  },

  /**
   * Google login user
   * @param {Object} data - Google login data (token, email, etc.)
   * @returns {Promise} Login response with token and user data
   */
  googleLogin: async (data) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, data);
    
    // Store token and user data in localStorage
    if (response.success && response.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Dispatch custom event to notify cart to refresh
        window.dispatchEvent(new Event('cartRefresh'));
        console.log('Google login successful - cart refresh event dispatched');
      }
    }
    
    return response;
  },

  /**
   * Send OTP to user
   * @param {Object} data - Data containing phone/email
   * @returns {Promise} OTP send response
   */
  sendOTP: async (data) => {
    return await apiClient.post(API_ENDPOINTS.AUTH.SEND_OTP, data);
  },

  /**
   * Verify OTP
   * @param {Object} data - OTP verification data
   * @returns {Promise} Verification response
   */
  verifyOTP: async (data) => {
    return await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, data);
  },

  /**
   * Request password reset
   * @param {Object} data - Email/phone for password reset
   * @returns {Promise} Password reset request response
   */
  forgotPassword: async (data) => {
    return await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  },

  /**
   * Reset password with token
   * @param {Object} data - New password and reset token
   * @returns {Promise} Password reset response
   */
  resetPassword: async (data) => {
    return await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },

  /**
   * Logout current user
   * @returns {Promise} Logout response
   */
  logout: async () => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    return response;
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null} Current user object or null
   */
  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has valid token
   */
  isAuthenticated: () => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  }
};
