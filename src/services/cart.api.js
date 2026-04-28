"use client";

import apiClient from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';

/**
 * Cart API Service
 * Handles all cart-related API calls
 */
export const cartAPI = {
  /**
   * Create cart (checkout)
   * @param {Object} data - Cart data for checkout
   * @returns {Promise} Cart creation response
   */
  createCart: async (data) => {
    return await apiClient.post(API_ENDPOINTS.CART.CREATE, data);
  },

  /**
   * Get cart by user ID (query parameter)
   * @param {string} userId - User ID
   * @returns {Promise} Cart data
   */
  getCart: async (userId) => {
    return await apiClient.get(API_ENDPOINTS.CART.GET, {
      params: { userId }
    });
  },

  /**
   * Get cart by user ID (path parameter)
   * @param {string} userId - User ID
   * @returns {Promise} Cart data
   */
  getCartByUser: async (userId) => {
    return await apiClient.get(API_ENDPOINTS.CART.GET_BY_USER(userId));
  },

  /**
   * Get cart products (just IDs and quantities)
   * @param {string} userId - User ID
   * @returns {Promise} Array of {productId, quantity}
   */
  getCartProducts: async (userId) => {
    return await apiClient.get(API_ENDPOINTS.CART.GET_PRODUCTS(userId));
  },

  /**
   * Add item to cart
   * @param {Object} data - Item data (productId, quantity, etc.)
   * @returns {Promise} Updated cart
   */
  addItem: async (data) => {
    return await apiClient.post(API_ENDPOINTS.CART.ADD_ITEM, data);
  },

  /**
   * Add multiple items to cart at once
   * @param {Object} data - Data with userId and products array
   * @returns {Promise} Updated cart
   */
  addMultipleItems: async (data) => {
    return await apiClient.post(API_ENDPOINTS.CART.ADD_MULTIPLE_ITEMS, data);
  },

  /**
   * Remove item from cart
   * @param {Object} data - Item data (productId, etc.)
   * @returns {Promise} Updated cart
   */
  removeItem: async (data) => {
    return await apiClient.post(API_ENDPOINTS.CART.REMOVE_ITEM, data);
  },

  /**
   * Apply coupon to cart
   * @param {Object} data - Coupon data (code, etc.)
   * @returns {Promise} Updated cart with discount
   */
  applyCoupon: async (data) => {
    return await apiClient.post(API_ENDPOINTS.CART.APPLY_COUPON, data);
  }
};
