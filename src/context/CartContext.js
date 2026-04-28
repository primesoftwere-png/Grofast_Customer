"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { cartAPI } from "@/services";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Debounce timers for API calls
  const debounceTimers = useRef({});

  // Log items changes for debugging
  useEffect(() => {
    if (items.length > 0) {
      console.log('🛒 Cart:', items.length, 'items', items.map(i => i.product._id));
    }
  }, [items]);

  // Fetch cart from backend - using lightweight products endpoint
  const fetchCartFromBackend = useCallback(async (userIdToFetch) => {
    const targetUserId = userIdToFetch || userId;
    if (!targetUserId) return;

    try {
      setIsLoading(true);
      
      console.log('📤 Fetching cart products for user:', targetUserId);
      
      // Use the lightweight endpoint that returns just productId and quantity
      const response = await cartAPI.getCartProducts(targetUserId);

      console.log('📥 Cart API Response:', response);

      if (response.success && response.products) {
        // Response format: { success: true, products: [{productId, quantity}] }
        const cartProducts = response.products || [];
        
        console.log('📦 Cart products:', cartProducts.length, 'items');
        
        // Fetch full product details for each cart item
        const productDetailsPromises = cartProducts.map(async (item) => {
          try {
            // Import productAPI dynamically to avoid circular dependency
            const { productAPI } = await import('@/services/product.api');
            const productResponse = await productAPI.getById(item.productId);
            
            if (productResponse.success && productResponse.data) {
              const productData = productResponse.data;
              return {
                product: {
                  _id: String(item.productId).trim(),
                  id: String(item.productId).trim(),
                  name: productData.productName || productData.name || '',
                  productName: productData.productName || productData.name || '',
                  price: productData.productPrice || productData.price || 0,
                  productPrice: productData.productPrice || productData.price || 0,
                  image: productData.productImage || productData.image || '',
                  productImage: productData.productImage || productData.image || '',
                  unit: productData.productUnit || productData.unit || '',
                  productUnit: productData.productUnit || productData.unit || '',
                  description: productData.productDescription || productData.description || '',
                  category: productData.productCategory || productData.category || '',
                  productCode: productData.productCode || '',
                  productQuantity: productData.productQuantity || 0,
                  productRating: productData.productRating || 0,
                },
                quantity: item.quantity || 1
              };
            } else {
              // If product details fetch fails, return minimal data
              console.warn('⚠️ Failed to fetch details for product:', item.productId);
              return {
                product: {
                  _id: String(item.productId).trim(),
                  id: String(item.productId).trim(),
                  name: 'Product',
                  productName: 'Product',
                  price: 0,
                  productPrice: 0,
                },
                quantity: item.quantity || 1
              };
            }
          } catch (error) {
            console.error('❌ Error fetching product details:', item.productId, error);
            // Return minimal data on error
            return {
              product: {
                _id: String(item.productId).trim(),
                id: String(item.productId).trim(),
                name: 'Product',
                productName: 'Product',
                price: 0,
                productPrice: 0,
              },
              quantity: item.quantity || 1
            };
          }
        });
        
        // Wait for all product details to be fetched
        const cartItems = await Promise.all(productDetailsPromises);
        
        // Filter out any items with invalid IDs
        const validCartItems = cartItems.filter(item => 
          item.product._id && item.product._id !== 'undefined' && item.product._id !== 'null'
        );
        
        setItems(validCartItems);
        console.log('✅ Cart loaded with full details:', validCartItems.length, 'items');
      } else {
        console.log('⚠️ No products in cart or invalid response');
        setItems([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch cart:', error.message);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initialize user from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserId(user._id || user.id);
          setIsAuthenticated(true);
          
          // Fetch cart from backend
          fetchCartFromBackend(user._id || user.id);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      
      // Listen for cart refresh events (e.g., after login)
      const handleCartRefresh = () => {
        const refreshToken = localStorage.getItem('token');
        const refreshUserStr = localStorage.getItem('user');
        
        if (refreshToken && refreshUserStr) {
          try {
            const refreshUser = JSON.parse(refreshUserStr);
            const refreshUserId = refreshUser._id || refreshUser.id;
            setUserId(refreshUserId);
            setIsAuthenticated(true);
            fetchCartFromBackend(refreshUserId);
          } catch (error) {
            console.error('Error refreshing cart:', error);
          }
        }
      };
      
      window.addEventListener('cartRefresh', handleCartRefresh);
      
      return () => {
        window.removeEventListener('cartRefresh', handleCartRefresh);
      };
    }
  }, [fetchCartFromBackend]);

  // Debounced API call helper
  const debouncedAPICall = useCallback((key, apiCall, delay = 500) => {
    // Clear existing timer for this key
    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key]);
    }

    // Set new timer
    debounceTimers.current[key] = setTimeout(async () => {
      try {
        await apiCall();
        delete debounceTimers.current[key];
      } catch (error) {
        console.error('Debounced API call failed:', error);
        delete debounceTimers.current[key];
      }
    }, delay);
  }, []);

  // Add Item - Debounced API call
  const addItem = useCallback(async (product) => {
    const productId = product._id || product.id;
    const productName = product.productName || product.name;

    // Check authentication
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    if (!token || !userStr) {
      if (typeof window !== 'undefined') {
        const shouldLogin = window.confirm(
          `Please login to add items to cart.\n\nWould you like to login now?`
        );
        if (shouldLogin) {
          window.location.href = '/auth';
        }
      }
      return;
    }

    const user = JSON.parse(userStr);
    const userIdValue = user._id || user.id;

    // Optimistic update - immediate UI feedback
    setItems((prev) => {
      const existingItem = prev.find(
        (item) => (item.product._id || item.product.id) === productId
      );

      if (existingItem) {
        return prev.map((item) =>
          (item.product._id || item.product.id) === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { product, quantity: 1 }];
    });

    // Get current quantity after update
    const currentItem = items.find(item => (item.product._id || item.product.id) === productId);
    const newQuantity = currentItem ? currentItem.quantity + 1 : 1;

    console.log(`⏱️ Debouncing API call for product ${productId}`);

    // Debounced API call
    debouncedAPICall(
      `add-${productId}`,
      async () => {
        console.log('📤 API Call: POST /api/cart/add-item (debounced)');
        console.log('📦 Payload:', { userId: userIdValue, productId, quantity: newQuantity });

        const response = await cartAPI.addItem({
          userId: userIdValue,
          productId,
          quantity: newQuantity
        });

        console.log('📥 API Response:', response);

        if (response.success) {
          console.log('✅ Item added to cart');
          // Refresh cart from backend
          await fetchCartFromBackend(userIdValue);
        } else {
          console.error('❌ Failed to add item');
          await fetchCartFromBackend(userIdValue);
        }
      },
      500 // 500ms debounce delay
    );
  }, [items, debouncedAPICall, fetchCartFromBackend]);

  // Remove Item - Immediate API call (no debounce for delete)
  const removeItem = useCallback(async (productId) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    if (!token || !userStr) return;

    const user = JSON.parse(userStr);
    const userIdValue = user._id || user.id;

    // Cancel any pending debounced calls for this product
    if (debounceTimers.current[`add-${productId}`]) {
      clearTimeout(debounceTimers.current[`add-${productId}`]);
      delete debounceTimers.current[`add-${productId}`];
    }
    if (debounceTimers.current[`update-${productId}`]) {
      clearTimeout(debounceTimers.current[`update-${productId}`]);
      delete debounceTimers.current[`update-${productId}`];
    }

    console.log('📤 API Call: POST /api/cart/remove-item (immediate)');
    console.log('📦 Payload:', { userId: userIdValue, productId });

    // Optimistic update
    setItems((prev) =>
      prev.filter((item) => (item.product._id || item.product.id) !== productId)
    );

    try {
      // Call API immediately (no debounce for delete)
      const response = await cartAPI.removeItem({
        userId: userIdValue,
        productId
      });

      console.log('📥 API Response:', response);

      if (response.success) {
        console.log('✅ Item removed from cart');
        // Refresh cart from backend
        await fetchCartFromBackend(userIdValue);
      } else {
        console.error('❌ Failed to remove item');
        await fetchCartFromBackend(userIdValue);
      }
    } catch (error) {
      console.error('❌ Error removing item:', error);
      await fetchCartFromBackend(userIdValue);
    }
  }, [fetchCartFromBackend]);

  // Update Quantity - Debounced API call
  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

      if (!token || !userStr) return;

      const user = JSON.parse(userStr);
      const userIdValue = user._id || user.id;

      // Optimistic update - immediate UI feedback
      setItems((prev) =>
        prev.map((item) =>
          (item.product._id || item.product.id) === productId
            ? { ...item, quantity }
            : item
        )
      );

      console.log(`⏱️ Debouncing quantity update for product ${productId}`);

      // Debounced API call
      debouncedAPICall(
        `update-${productId}`,
        async () => {
          console.log('📤 API Call: POST /api/cart/add-item (update quantity - debounced)');
          console.log('📦 Payload:', { userId: userIdValue, productId, quantity });

          const response = await cartAPI.addItem({
            userId: userIdValue,
            productId,
            quantity
          });

          console.log('📥 API Response:', response);

          if (response.success) {
            console.log('✅ Quantity updated');
            // Refresh cart from backend
            await fetchCartFromBackend(userIdValue);
          } else {
            console.error('❌ Failed to update quantity');
            await fetchCartFromBackend(userIdValue);
          }
        },
        800 // 800ms debounce delay for quantity updates
      );
    },
    [removeItem, debouncedAPICall, fetchCartFromBackend]
  );

  // Clear Cart
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Get Quantity
  const getItemQuantity = useCallback(
    (productId) => {
      // Normalize the productId for comparison (remove any whitespace)
      const normalizedSearchId = String(productId).trim();
      
      const item = items.find((item) => {
        const itemProductId = String(item.product._id || item.product.id).trim();
        return itemProductId === normalizedSearchId;
      });
      
      return item ? item.quantity : 0;
    },
    [items]
  );

  // Create Cart (Checkout)
  const createCart = useCallback(async (orderId) => {
    if (!userId || items.length === 0) {
      if (!userId) {
        alert('Please login to complete checkout');
        window.location.href = '/auth';
      }
      return null;
    }

    try {
      const cartItems = items.map(item => ({
        productId: item.product._id || item.product.id,
        quantity: item.quantity
      }));

      const response = await cartAPI.createCart({
        userId,
        cartItems,
        OrderId: orderId
      });

      if (response.success) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to create cart:', error);
      throw error;
    }
  }, [userId, items]);

  // Refresh cart
  const refreshCart = useCallback(async () => {
    if (userId) {
      await fetchCartFromBackend(userId);
    }
  }, [userId, fetchCartFromBackend]);

  // Totals
  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalPrice = items.reduce(
    (sum, item) => {
      const price = item.product.productPrice || item.product.price || 0;
      return sum + price * item.quantity;
    },
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        isAuthenticated,
        userId,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
        createCart,
        fetchCart: fetchCartFromBackend,
        refreshCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used within a CartProvider"
    );
  }

  return context;
}
