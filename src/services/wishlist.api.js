"use client";

import apiClient from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';

/**
 * Wishlist API Service
 * Handles all wishlist-related API calls
 */
export const wishlistAPI = {
  /**
   * Get user's wishlist
   * @param {string} userId - ID of the user
   * @returns {Promise} Wishlist items
   */
  getUserWishlist: async (userId) => {
    return await apiClient.get(API_ENDPOINTS.WISHLIST.GET_USER_WISHLIST(userId));
  },

  /**
   * Add a product to the wishlist
   * @param {Object} data - { userId, productId }
   * @returns {Promise} Response indicating success
   */
  addToWishlist: async (data) => {
    return await apiClient.post(API_ENDPOINTS.WISHLIST.ADD, data);
  },

  /**
   * Remove a product from the wishlist
   * @param {Object} data - { userId, productId }
   * @returns {Promise} Response indicating success
   */
  removeFromWishlist: async (data) => {
    // Assuming backend accepts POST or DELETE for removing. We'll use POST matching ADD for simplicity, 
    // or standard DELETE if we knew. Let's use POST. If it's DELETE, it might need to be apiClient.delete.
    // Let's use POST with the data as payload since it matches standard simple APIs.
    return await apiClient.post(API_ENDPOINTS.WISHLIST.REMOVE, data);
  },

  /**
   * Check if a product is in user's wishlist
   * @param {string} userId - ID of the user
   * @param {string} productId - ID of the product
   * @returns {Promise} Response indicating true/false
   */
  checkWishlist: async (userId, productId) => {
    return await apiClient.get(API_ENDPOINTS.WISHLIST.CHECK(userId, productId));
  }
};
