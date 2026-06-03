"use client";

import apiClient from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';

/**
 * Category API Service
 * Handles all category-related API calls
 */
export const categoryAPI = {
  /**
   * Create a new category
   * @param {FormData} categoryData - Category data (multipart/form-data required for image)
   * @returns {Promise} Created category details
   */
  create: async (categoryData) => {
    return await apiClient.post(API_ENDPOINTS.CATEGORIES.CREATE, categoryData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get all categories
   * @param {Object} params - Query parameters (search, status, parentOnly, page, limit, sortBy, sortOrder)
   * @returns {Promise} List of all categories
   */
  getAll: async (params = {}) => {
    return await apiClient.get(API_ENDPOINTS.CATEGORIES.LIST, { params });
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
   * Update a category
   * @param {string} categoryId - Category ID
   * @param {FormData} categoryData - Updated data
   * @returns {Promise} Updated category details
   */
  update: async (categoryId, categoryData) => {
    return await apiClient.put(API_ENDPOINTS.CATEGORIES.UPDATE(categoryId), categoryData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Delete a category
   * @param {string} categoryId - Category ID
   * @returns {Promise} Deletion result
   */
  delete: async (categoryId) => {
    return await apiClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(categoryId));
  },

  /**
   * Get products by category ID
   * @param {string} categoryId - Category ID
   * @param {Object} params - Query parameters (page, limit, etc.)
   * @returns {Promise} Products in the category
   */
  getProducts: async (categoryId, params = {}) => {
    return await apiClient.get(API_ENDPOINTS.CATEGORIES.PRODUCTS(categoryId), { params });
  },

  /**
   * Get structured categories (parents and children separated)
   * @returns {Promise} Structured categories
   */
  getStructured: async () => {
    return await apiClient.get(API_ENDPOINTS.CATEGORIES.STRUCTURED);
  }
};
