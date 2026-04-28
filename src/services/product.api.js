"use client";

import apiClient from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';

/**
 * Product API Service
 * Handles all product-related API calls
 */
export const productAPI = {
  /**
   * Get all products with optional filters
   * @param {Object} params - Query parameters (page, limit, category, search, etc.)
   * @returns {Promise} Product list response
   */
  getAll: async (params = {}) => {
    return await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, { params });
  },

  /**
   * Get single product by ID
   * @param {string} productId - Product ID
   * @returns {Promise} Product details
   */
  getById: async (productId) => {
    return await apiClient.get(API_ENDPOINTS.PRODUCTS.DETAIL(productId));
  },

  /**
   * Get bestseller products
   * @param {Object} params - Query parameters (limit, page, etc.)
   * @returns {Promise} Bestseller products
   */
  getBestsellers: async (params = {}) => {
    return await apiClient.get(API_ENDPOINTS.PRODUCTS.BESTSELLERS, { params });
  },

  /**
   * Get related products for a specific product
   * @param {string} productId - Product ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Related products
   */
  getRelated: async (productId, params = {}) => {
    return await apiClient.get(API_ENDPOINTS.PRODUCTS.RELATED(productId), { params });
  },

  /**
   * Get product reviews
   * @param {string} productId - Product ID
   * @param {Object} params - Query parameters (page, limit, etc.)
   * @returns {Promise} Product reviews
   */
  getReviews: async (productId, params = {}) => {
    return await apiClient.get(API_ENDPOINTS.PRODUCTS.REVIEWS(productId), { params });
  },

  /**
   * Add a review for a product
   * @param {string} productId - Product ID
   * @param {Object} data - Review data (rating, comment, etc.)
   * @returns {Promise} Created review
   */
  addReview: async (productId, data) => {
    return await apiClient.post(API_ENDPOINTS.PRODUCTS.ADD_REVIEW(productId), data);
  },

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Search results
   */
  search: async (query, params = {}) => {
    return await apiClient.get(API_ENDPOINTS.SEARCH.PRODUCTS, {
      params: { q: query, ...params }
    });
  },

  /**
   * Get search suggestions
   * @param {string} query - Search query
   * @returns {Promise} Search suggestions
   */
  getSuggestions: async (query) => {
    return await apiClient.get(API_ENDPOINTS.SEARCH.SUGGESTIONS, {
      params: { q: query }
    });
  }
};
