"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { cartAPI } from "@/services";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize userId and isAuthenticated synchronously from localStorage
  // so the very first render already reflects login state (fixes hard-refresh issue)
  const [userId, setUserId] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
          const user = JSON.parse(userStr);
          return user._id || user.id || null;
        }
      } catch (e) { /* ignore */ }
    }
    return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        return !!(token && userStr);
      } catch (e) { /* ignore */ }
    }
    return false;
  });
  
  // Debounce timers for API calls
  const debounceTimers = useRef({});
  
  // Flag to prevent double initialization in React Strict Mode
  const isInitialized = useRef(false);

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
    // Prevent double initialization in React Strict Mode
    if (isInitialized.current) {
      console.log('⚠️ Cart already initialized, skipping...');
      return;
    }
    
    isInitialized.current = true;
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          const currentUserId = user._id || user.id;
          setUserId(currentUserId);
          setIsAuthenticated(true);
          
          // Fetch cart from backend - call directly without dependency
          (async () => {
            try {
              setIsLoading(true);
              console.log('📤 Initial cart fetch for user:', currentUserId);
              const response = await cartAPI.getCartProducts(currentUserId);
              
              if (response.success && response.products) {
                const cartProducts = response.products || [];
                const productDetailsPromises = cartProducts.map(async (item) => {
                  try {
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
                    }
                    return null;
                  } catch (error) {
                    console.error('❌ Error fetching product details:', item.productId, error);
                    return null;
                  }
                });
                
                const cartItems = await Promise.all(productDetailsPromises);
                const validCartItems = cartItems.filter(item => 
                  item && item.product._id && item.product._id !== 'undefined' && item.product._id !== 'null'
                );
                
                setItems(validCartItems);
                console.log('✅ Initial cart loaded:', validCartItems.length, 'items');
              } else {
                setItems([]);
              }
            } catch (error) {
              console.error('❌ Failed to fetch initial cart:', error.message);
              setItems([]);
            } finally {
              setIsLoading(false);
            }
          })();
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
            
            // Fetch cart inline to avoid dependency issues
            (async () => {
              try {
                setIsLoading(true);
                console.log('📤 Refreshing cart for user:', refreshUserId);
                const response = await cartAPI.getCartProducts(refreshUserId);
                
                if (response.success && response.products) {
                  const cartProducts = response.products || [];
                  const productDetailsPromises = cartProducts.map(async (item) => {
                    try {
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
                      }
                      return null;
                    } catch (error) {
                      console.error('❌ Error fetching product details:', item.productId, error);
                      return null;
                    }
                  });
                  
                  const cartItems = await Promise.all(productDetailsPromises);
                  const validCartItems = cartItems.filter(item => 
                    item && item.product._id && item.product._id !== 'undefined' && item.product._id !== 'null'
                  );
                  
                  setItems(validCartItems);
                  console.log('✅ Cart refreshed:', validCartItems.length, 'items');
                } else {
                  setItems([]);
                }
              } catch (error) {
                console.error('❌ Failed to refresh cart:', error.message);
              } finally {
                setIsLoading(false);
              }
            })();
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
  }, []); // ✅ Empty dependency array - only run once on mount

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
        
        // Show user-friendly error message
        if (error.status === 400 && error.message) {
          if (typeof window !== 'undefined') {
            toast.error(error.message);
          }
        }
      }
    }, delay);
  }, []);

  // Add Item - Calls POST /api/cart/add-item with quantity: 1
  const addItem = useCallback(async (product) => {
    const productId = product._id || product.id;

    // Check stock limit - prevent adding beyond productQuantity
    const stock = product.productQuantity || product.stock || 0;
    const currentItem = items.find(item => 
      String(item.product._id || item.product.id).trim() === String(productId).trim()
    );
    const currentQty = currentItem ? currentItem.quantity : 0;

    if (stock > 0 && currentQty >= stock) {
      console.log(`⚠️ Stock limit reached for ${productId}: ${currentQty}/${stock}`);
      if (typeof window !== 'undefined') {
        toast.error(`Only ${stock} items available in stock.`);
      }
      return;
    }

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

    console.log(`➕ Adding 1 of product ${productId} to cart`);

    try {
      const response = await cartAPI.addItem({
        userId: userIdValue,
        productId,
        quantity: 1
      });

      console.log('📥 Add Item Response:', response);

      if (response.success) {
        console.log('✅ Item added to cart');
        // Skip fetching to maintain smooth UI during rapid clicks
      } else {
        console.error('❌ Failed to add item');
        await fetchCartFromBackend(userIdValue);
      }
    } catch (error) {
      console.error('❌ Error adding item:', error);
      await fetchCartFromBackend(userIdValue);
    }
  }, [items, fetchCartFromBackend]);

  // Remove Item completely - Calls POST /api/cart/remove-item WITHOUT quantity (full remove)
  const removeItem = useCallback(async (productId) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    if (!token || !userStr) return;

    const user = JSON.parse(userStr);
    const userIdValue = user._id || user.id;

    console.log('🗑️ Removing product entirely:', productId);

    // Optimistic update
    setItems((prev) =>
      prev.filter((item) => (item.product._id || item.product.id) !== productId)
    );

    try {
      const response = await cartAPI.removeItem({
        userId: userIdValue,
        productId
      });

      console.log('📥 Remove Item Response:', response);

      if (response.success) {
        console.log('✅ Item removed from cart completely');
        // Skip fetching to maintain smooth UI
      } else {
        console.error('❌ Failed to remove item');
        await fetchCartFromBackend(userIdValue);
      }
    } catch (error) {
      console.error('❌ Error removing item:', error);
      await fetchCartFromBackend(userIdValue);
    }
  }, [fetchCartFromBackend]);

  // Decrease Item by 1 - Calls POST /api/cart/remove-item WITH quantity: 1
  const decreaseItem = useCallback(async (productId) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    if (!token || !userStr) return;

    const user = JSON.parse(userStr);
    const userIdValue = user._id || user.id;

    // Get current quantity
    const currentItem = items.find(item => 
      String(item.product._id || item.product.id).trim() === String(productId).trim()
    );
    const currentQuantity = currentItem ? currentItem.quantity : 0;

    if (currentQuantity <= 0) return;

    // If quantity is 1, this will remove entirely (API handles it)
    if (currentQuantity === 1) {
      // Optimistic: remove from list
      setItems((prev) =>
        prev.filter((item) => (item.product._id || item.product.id) !== productId)
      );
    } else {
      // Optimistic: decrease by 1
      setItems((prev) =>
        prev.map((item) =>
          (item.product._id || item.product.id) === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    }

    console.log(`➖ Decreasing product ${productId} by 1 (current: ${currentQuantity})`);

    try {
      const response = await cartAPI.removeItem({
        userId: userIdValue,
        productId,
        quantity: 1
      });

      console.log('📥 Decrease Item Response:', response);

      if (response.success) {
        console.log('✅ Item quantity decreased');
        // Skip fetching to maintain smooth UI during rapid clicks
      } else {
        console.error('❌ Failed to decrease item');
        await fetchCartFromBackend(userIdValue);
      }
    } catch (error) {
      console.error('❌ Error decreasing item:', error);
      await fetchCartFromBackend(userIdValue);
    }
  }, [items, fetchCartFromBackend]);

  // Update Quantity - Routes to correct API based on direction
  const updateQuantity = useCallback(
    async (productId, newQuantity) => {
      // Get current quantity
      const currentItem = items.find(item => 
        String(item.product._id || item.product.id).trim() === String(productId).trim()
      );
      const currentQuantity = currentItem ? currentItem.quantity : 0;

      if (newQuantity <= 0) {
        // Remove entirely
        removeItem(productId);
        return;
      }

      if (newQuantity > currentQuantity) {
        // Increasing → call add-item API with quantity: 1
        if (currentItem) {
          addItem(currentItem.product);
        }
      } else if (newQuantity < currentQuantity) {
        // Decreasing → call remove-item API with quantity: 1
        decreaseItem(productId);
      }
    },
    [items, removeItem, addItem, decreaseItem]
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
        toast.error("Please login to complete checkout");
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
  // Total unique products (count of different items)
  const totalItems = items.length;
  
  // Total quantity (sum of all quantities)
  const totalQuantity = items.reduce(
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
        decreaseItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
        createCart,
        fetchCart: fetchCartFromBackend,
        refreshCart,
        totalItems, // Number of unique products
        totalQuantity, // Total quantity of all items
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
