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
    SEND_OTP: '/user/send-otp',
    VERIFY_OTP: '/user/verify-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    LOGOUT: '/auth/logout',
    GOOGLE_LOGIN: '/user/google-login'
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
    CREATE: '/admin/add-category',
    LIST: '/categories/structured',
    DETAIL: (id) => `/admin/get-category/${id}`,
    UPDATE: (id) => `/admin/update-category/${id}`,
    DELETE: (id) => `/admin/delete-category/${id}`,
    PRODUCTS: (id) => `/categories/${id}/products`,
    STRUCTURED: '/categories/structured'
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
    RECENT: (userId) => `/order/recent/${userId}`,
    CATEGORIZED: (userId) => `/order/categorized/${userId}`,
    COMPLETED: (userId) => `/order/completed/${userId}`,
    CANCEL: (id) => `/orders/${id}/cancel`,
    TRACK: (id) => `/orders/${id}/tracking`,
    REORDER: (id) => `/orders/${id}/reorder`,
    CONVERT_CART_TO_ORDER: '/order/convert-cart-to-order'
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
    // Customer Router APIs
    CREATE: '/customer/addresses',
    GET_USER_ADDRESSES: (userId) => `/customer/addresses/user/${userId}`,
    GET_DEFAULT: (userId) => `/customer/addresses/default/${userId}`,
    GET_BY_ID: (addressId) => `/customer/addresses/${addressId}`,
    UPDATE: (addressId) => `/customer/addresses/${addressId}`,
    SET_DEFAULT: (addressId) => `/customer/addresses/${addressId}/set-default`,
    DELETE: (addressId) => `/customer/addresses/${addressId}`,
    
    // Auth (User) Router API
    USER_UPDATE: '/user/update-address',

    // Legacy / Fallback aliases to not break other parts of app
    LIST: '/customer/addresses',
    ADD: '/customer/addresses',
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
    PROCESS: '/payment/process',
    CREATE_ORDER: '/payment/create-order'
  }
};
