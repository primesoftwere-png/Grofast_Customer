"use client";

import apiClient from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';

/**
 * User API Service
 * Handles all user profile-related API calls
 */
export const userAPI = {
  /**
   * Get current user profile
   * @returns {Promise} User profile data
   */
  getProfile: async () => {
    return await apiClient.get(API_ENDPOINTS.USER.PROFILE);
  },

  /**
   * Update user profile
   * @param {Object} data - Profile data to update (name, email, phone, etc.)
   * @returns {Promise} Updated user profile
   */
  updateProfile: async (data) => {
    const response = await apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, data);
    
    // Update user in localStorage
    if (response.success && response.data && typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response;
  },

  /**
   * Upload profile avatar/image
   * @param {File} file - Image file to upload
   * @returns {Promise} Upload response with image URL
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return await apiClient.post(API_ENDPOINTS.USER.UPLOAD_AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Change user password
   * @param {Object} data - Password data (oldPassword, newPassword)
   * @returns {Promise} Password change response
   */
  changePassword: async (data) => {
    return await apiClient.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, data);
  }
};
