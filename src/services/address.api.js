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
   * @param {string} userId - User ID
   * @returns {Promise} List of user addresses
   */
  getUserAddresses: async (userId) => {
    return await apiClient.get(API_ENDPOINTS.ADDRESS.GET_USER_ADDRESSES(userId));
  },

  /**
   * Get default address for a user
   * @param {string} userId - User ID
   * @returns {Promise} Default address
   */
  getDefaultAddress: async (userId) => {
    return await apiClient.get(API_ENDPOINTS.ADDRESS.GET_DEFAULT(userId));
  },

  /**
   * Get a single address by ID
   * @param {string} addressId - Address ID
   * @returns {Promise} Address details
   */
  getAddressById: async (addressId) => {
    return await apiClient.get(API_ENDPOINTS.ADDRESS.GET_BY_ID(addressId));
  },

  /**
   * Add a new address (Customer Router)
   * @param {Object} data - Address data
   * @returns {Promise} Created address
   */
  addAddress: async (data) => {
    return await apiClient.post(API_ENDPOINTS.ADDRESS.CREATE, data);
  },

  /**
   * Update an existing address
   * @param {string} addressId - Address ID
   * @param {Object} data - Updated address data
   * @returns {Promise} Updated address
   */
  updateAddress: async (addressId, data) => {
    return await apiClient.put(API_ENDPOINTS.ADDRESS.UPDATE(addressId), data);
  },

  /**
   * Update address (legacy/user route)
   * @param {Object} data - Updated address data
   * @returns {Promise} Updated address
   */
  userUpdateAddress: async (data) => {
    return await apiClient.put(API_ENDPOINTS.ADDRESS.USER_UPDATE, data);
  },

  /**
   * Delete an address
   * @param {string} addressId - Address ID
   * @returns {Promise} Deletion response
   */
  deleteAddress: async (addressId) => {
    return await apiClient.delete(API_ENDPOINTS.ADDRESS.DELETE(addressId));
  },

  /**
   * Set an address as default
   * @param {string} addressId - Address ID
   * @returns {Promise} Updated address
   */
  setDefaultAddress: async (addressId) => {
    return await apiClient.patch(API_ENDPOINTS.ADDRESS.SET_DEFAULT(addressId));
  },

  // Legacy mappings to prevent breaking existing code
  getAll: async () => {
    // Note: requires userId now, this is a fallback that might fail without it
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user._id || user.id) {
      return await apiClient.get(API_ENDPOINTS.ADDRESS.GET_USER_ADDRESSES(user._id || user.id));
    }
    return await apiClient.get(API_ENDPOINTS.ADDRESS.LIST);
  },
  
  addCustomerAddress: async (data) => {
    return await apiClient.post(API_ENDPOINTS.ADDRESS.CREATE, data);
  },

  update: async (addressId, data) => {
    return await apiClient.put(API_ENDPOINTS.ADDRESS.UPDATE(addressId), data);
  },

  delete: async (addressId) => {
    return await apiClient.delete(API_ENDPOINTS.ADDRESS.DELETE(addressId));
  },
  
  setDefault: async (addressId) => {
    return await apiClient.patch(API_ENDPOINTS.ADDRESS.SET_DEFAULT(addressId));
  }
};
