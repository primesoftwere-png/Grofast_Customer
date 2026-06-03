"use client";

import apiClient from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';

/**
 * Order API Service
 * Handles all order-related API calls
 */
export const orderAPI = {
  /**
   * Create a new order
   * @param {Object} data - Order data (items, address, payment, etc.)
   * @returns {Promise} Created order
   */
  create: async (data) => {
    return await apiClient.post(API_ENDPOINTS.ORDERS.CREATE, data);
  },

  /**
   * Get all orders for current user
   * @param {Object} params - Query parameters (page, limit, status, etc.)
   * @returns {Promise} List of orders
   */
  getAll: async (params = {}) => {
    return await apiClient.get(API_ENDPOINTS.ORDERS.LIST, { params });
  },

  /**
   * Get single order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise} Order details
   */
  getById: async (orderId) => {
    return await apiClient.get(API_ENDPOINTS.ORDERS.DETAIL(orderId));
  },

  /**
   * Get recent order for user
   * @param {string} userId - User ID
   * @returns {Promise} Recent order details
   */
  getRecent: async (userId) => {
    return await apiClient.get(API_ENDPOINTS.ORDERS.RECENT(userId));
  },

  /**
   * Get categorized orders (recent & history) for a user
   * @param {string} userId - User ID
   * @returns {Promise} Categorized orders { recent, history }
   */
  getCategorized: async (userId) => {
    return await apiClient.get(API_ENDPOINTS.ORDERS.CATEGORIZED(userId));
  },

  /**
   * Cancel an order
   * @param {string} orderId - Order ID
   * @param {Object} data - Cancellation reason, etc.
   * @returns {Promise} Cancellation response
   */
  cancel: async (orderId, data) => {
    return await apiClient.post(API_ENDPOINTS.ORDERS.CANCEL(orderId), data);
  },

  /**
   * Track order status
   * @param {string} orderId - Order ID
   * @returns {Promise} Order tracking information
   */
  track: async (orderId) => {
    return await apiClient.get(API_ENDPOINTS.ORDERS.TRACK(orderId));
  },

  /**
   * Reorder a previous order
   * @param {string} orderId - Order ID to reorder
   * @returns {Promise} New order created from previous order
   */
  reorder: async (orderId) => {
    return await apiClient.post(API_ENDPOINTS.ORDERS.REORDER(orderId));
  },

  /**
   * Convert cart to order
   * @param {Object} data - Order data (userId, deliveryAddressId, paymentMethod)
   * @returns {Promise} Created order from cart
   */
  convertCartToOrder: async (data) => {
    return await apiClient.post(API_ENDPOINTS.ORDERS.CONVERT_CART_TO_ORDER, data);
  }
};
