// API Configuration
export const API_CONFIG = {
  // Base URL from environment or default
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// API Endpoints - Centralized endpoint management
export const API_ENDPOINTS = {
  // Auth Endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    LOGOUT: '/auth/logout'
  },
  
  // Product Endpoints
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id) => `/products/${id}`,
    BESTSELLERS: '/products/bestsellers',
    RELATED: (id) => `/products/${id}/related`,
    REVIEWS: (id) => `/products/${id}/reviews`,
    ADD_REVIEW: (id) => `/products/${id}/reviews`
  },
  
  // Category Endpoints
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id) => `/categories/${id}`,
    PRODUCTS: (id) => `/categories/${id}/products`
  },
  
  // Cart Endpoints
  CART: {
    CREATE: '/cart/create-cart',
    GET: '/cart/get-cart',
    GET_BY_USER: (userId) => `/cart/user/${userId}`,
    GET_PRODUCTS: (userId) => `/cart/products/${userId}`,
    ADD_ITEM: '/cart/add-item',
    ADD_MULTIPLE_ITEMS: '/cart/add-multiple-items',
    REMOVE_ITEM: '/cart/remove-item',
    APPLY_COUPON: '/cart/coupon'
  },
  
  // Order Endpoints
  ORDERS: {
    CREATE: '/orders',
    LIST: '/orders',
    DETAIL: (id) => `/orders/${id}`,
    CANCEL: (id) => `/orders/${id}/cancel`,
    TRACK: (id) => `/orders/${id}/tracking`,
    REORDER: (id) => `/orders/${id}/reorder`
  },
  
  // User Endpoints
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    UPLOAD_AVATAR: '/user/profile/avatar',
    CHANGE_PASSWORD: '/user/change-password'
  },
  
  // Address Endpoints
  ADDRESS: {
    LIST: '/user/addresses',
    ADD: '/user/addresses',
    UPDATE: (id) => `/user/addresses/${id}`,
    DELETE: (id) => `/user/addresses/${id}`,
    SET_DEFAULT: (id) => `/user/addresses/${id}/set-default`,
    CUSTOMER_ADDRESSES: '/customer/addresses'
  },
  
  // Offer Endpoints
  OFFERS: {
    LIST: '/offers',
    VALIDATE_COUPON: '/coupons/validate'
  },
  
  // Search Endpoints
  SEARCH: {
    PRODUCTS: '/search',
    SUGGESTIONS: '/search/suggestions'
  },
  
  // Notification Endpoints
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all'
  },
  
  // Shop Endpoints
  SHOPS: {
    NEARBY: '/shops/nearby',
    DETAIL: (id) => `/shops/${id}`
  },
  
  // Chat Endpoints
  CHAT: {
    MESSAGES: '/chat/messages',
    SEND: '/chat/messages'
  },
  
  // Feedback Endpoints
  FEEDBACK: {
    SUBMIT: '/feedback'
  },
  
  // Payment Endpoints
  PAYMENT: {
    METHODS: '/payment/methods',
    ADD_METHOD: '/payment/methods',
    PROCESS: '/payment/process'
  }
};
