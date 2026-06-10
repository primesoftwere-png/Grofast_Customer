/**
 * API Services Index
 * Central export point for all API service modules
 * 
 * Usage:
 * import { productAPI, authAPI, cartAPI } from '@/services';
 */

// Authentication Services
export { authAPI } from './auth.api';

// Product Services
export { productAPI } from './product.api';
export { categoryAPI } from './category.api';

// Cart & Order Services
export { cartAPI } from './cart.api';
export { orderAPI } from './order.api';

// User Services
export { userAPI } from './user.api';
export { addressAPI } from './address.api';
export { wishlistAPI } from './wishlist.api';

// Export API client and config for advanced usage
export { default as apiClient } from './api.service';
export { API_ENDPOINTS, API_CONFIG } from '@/config/api.config';
