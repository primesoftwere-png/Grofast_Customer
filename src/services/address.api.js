"use client";

import apiClient from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';

/**
 * Address API Service
 * Handles all user address-related API calls
 */
export const addressAPI = {
  /**
   * Get all addresses for current user
   * @returns {Promise} List of user addresses
   */
  getAll: async () => {
    return await apiClient.get(API_ENDPOINTS.ADDRESS.LIST);
  },

  /**
   * Add a new address
   * @param {Object} data - Address data (street, city, state, zip, etc.)
   * @returns {Promise} Created address
   */
  add: async (data) => {
    return await apiClient.post(API_ENDPOINTS.ADDRESS.ADD, data);
  },

  /**
   * Add/Update customer address (for cart/checkout)
   * @param {Object} data - Address data with userId
   * @returns {Promise} Address response
   */
  addCustomerAddress: async (data) => {
    return await apiClient.post(API_ENDPOINTS.ADDRESS.CUSTOMER_ADDRESSES, data);
  },

  /**
   * Update an existing address
   * @param {string} addressId - Address ID
   * @param {Object} data - Updated address data
   * @returns {Promise} Updated address
   */
  update: async (addressId, data) => {
    return await apiClient.put(API_ENDPOINTS.ADDRESS.UPDATE(addressId), data);
  },

  /**
   * Delete an address
   * @param {string} addressId - Address ID
   * @returns {Promise} Deletion response
   */
  delete: async (addressId) => {
    return await apiClient.delete(API_ENDPOINTS.ADDRESS.DELETE(addressId));
  },

  /**
   * Set an address as default
   * @param {string} addressId - Address ID
   * @returns {Promise} Updated address
   */
  setDefault: async (addressId) => {
    return await apiClient.post(API_ENDPOINTS.ADDRESS.SET_DEFAULT(addressId));
  }
};
