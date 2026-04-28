"use client";

import apiClient from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';

/**
 * Category API Service
 * Handles all category-related API calls
 */
export const categoryAPI = {
  /**
   * Get all categories
   * @returns {Promise} List of all categories
   */
  getAll: async () => {
    return await apiClient.get(API_ENDPOINTS.CATEGORIES.LIST);
  },

  /**
   * Get single category by ID
   * @param {string} categoryId - Category ID
   * @returns {Promise} Category details
   */
  getById: async (categoryId) => {
    return await apiClient.get(API_ENDPOINTS.CATEGORIES.DETAIL(categoryId));
  },

  /**
   * Get products by category ID
   * @param {string} categoryId - Category ID
   * @param {Object} params - Query parameters (page, limit, etc.)
   * @returns {Promise} Products in the category
   */
  getProducts: async (categoryId, params = {}) => {
    return await apiClient.get(API_ENDPOINTS.CATEGORIES.PRODUCTS(categoryId), { params });
  }
};
