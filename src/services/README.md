# API Services Documentation

This directory contains all API service modules for the application. All services use a centralized axios instance with proper error handling and authentication.

## Architecture

```
src/
├── config/
│   └── api.config.js          # API configuration and endpoints
├── services/
│   ├── api.service.js         # Axios instance with interceptors
│   ├── auth.api.js            # Authentication services
│   ├── product.api.js         # Product services
│   ├── category.api.js        # Category services
│   ├── cart.api.js            # Cart services
│   ├── order.api.js           # Order services
│   ├── user.api.js            # User profile services
│   ├── address.api.js         # Address services
│   └── index.js               # Central export point
```

## Configuration

### API Base URL
Set in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Endpoints
All endpoints are centralized in `src/config/api.config.js`:
- Easy to maintain and update
- Type-safe endpoint generation
- Single source of truth

## Usage Examples

### Import Services
```javascript
import { productAPI, authAPI, cartAPI } from '@/services';
```

### Fetch Products
```javascript
// Get all products
const response = await productAPI.getAll({ 
  page: 1, 
  limit: 20 
});

// Get products by category
const response = await productAPI.getAll({ 
  category: 'Vegetables',
  limit: 8 
});

// Get single product
const product = await productAPI.getById('product-id');
```

### Authentication
```javascript
// Login
const response = await authAPI.login({
  email: 'user@example.com',
  password: 'password123'
});

// Check if authenticated
const isAuth = authAPI.isAuthenticated();

// Get current user
const user = authAPI.getCurrentUser();
```

### Cart Operations
```javascript
// Add item to cart
await cartAPI.addItem({
  productId: 'product-id',
  quantity: 2
});

// Get cart
const cart = await cartAPI.getCart(userId);
```

## Response Format

All API responses follow this structure:
```javascript
{
  success: true,
  data: [...],
  pagination: {
    page: 1,
    limit: 20,
    totalDocs: 100,
    totalPages: 5
  }
}
```

## Error Handling

Errors are automatically handled by the axios interceptor:
- 401: Redirects to login
- 403: Access forbidden
- 404: Resource not found
- 500+: Server errors
- Network errors: Connection issues

All errors are logged to console with detailed information.

## Authentication

The axios instance automatically:
- Adds Bearer token to all requests
- Stores token in localStorage on login
- Removes token on logout or 401 error
- Redirects to /auth on authentication failure

## Adding New Services

1. Create new service file in `src/services/`
2. Add endpoints to `src/config/api.config.js`
3. Export from `src/services/index.js`

Example:
```javascript
// src/services/notification.api.js
import apiClient from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';

export const notificationAPI = {
  getAll: async () => {
    return await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
  }
};
```

## Best Practices

1. **Always use the centralized endpoints** from `api.config.js`
2. **Don't hardcode URLs** in components
3. **Use try-catch** when calling APIs in components
4. **Handle loading states** in UI
5. **Log errors** for debugging
6. **Document new endpoints** when adding them

## Console Logging

All API calls are logged to console with:
- Request method and URL
- Request parameters and data
- Response status and data
- Error details

To disable logging in production, remove console.log statements from `api.service.js`.
