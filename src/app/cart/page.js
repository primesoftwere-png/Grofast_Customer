"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  MapPin,
  Tag,
  ShoppingBag,
  Edit2,
  LogIn,
  Wallet,
  CreditCard,
  Banknote,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import AddressModal from "@/components/Cart/AddressModal";
import { addressAPI } from "@/services/address.api";
import { orderAPI } from "@/services/order.api";
import toast from "react-hot-toast";

export default function Cart() {
  const {
    items,
    addItem,
    decreaseItem,
    removeItem,
    totalPrice,
    isAuthenticated,
    fetchCart,
  } = useCart();

  // Double-check auth from localStorage as safety net for hard refresh
  // (context may not have initialized yet on first render)
  const [localAuth, setLocalAuth] = useState(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      return !!(token && userStr);
    }
    return false;
  });

  // Use either context or local check — if either says logged in, treat as logged in
  const isUserLoggedIn = isAuthenticated || localAuth;

  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [deliveryAddressId, setDeliveryAddressId] = useState(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [processingItemId, setProcessingItemId] = useState(null); // For item quantity changes

  const router = useRouter();


  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch cart when page loads
  useEffect(() => {
    const loadCart = async () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      console.log("=== Cart Page Loaded ===");
      console.log("Token exists:", !!token);
      console.log("User exists:", !!userStr);

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          const userIdValue = user._id || user.id;

          console.log("📤 Fetching cart for user:", userIdValue);
          console.log("API Call: GET /api/cart/products/" + userIdValue);

          setIsLoadingCart(true);

          // Fetch cart from context
          await fetchCart(userIdValue);

          // Fetch user addresses
          try {
            const addressResponse = await addressAPI.getUserAddresses(userIdValue);
            if (addressResponse?.data && Array.isArray(addressResponse.data)) {
              setAddresses(addressResponse.data);
              
              // Load saved address from localStorage or use default/first
              const savedAddressId = localStorage.getItem("deliveryAddressId");
              let selectedAddr = null;
              
              if (savedAddressId) {
                selectedAddr = addressResponse.data.find(a => (a._id || a.id) === savedAddressId);
              }
              
              if (!selectedAddr && addressResponse.data.length > 0) {
                // Try to find default address, else pick first
                selectedAddr = addressResponse.data.find(a => a.isDefault) || addressResponse.data[0];
              }
              
              if (selectedAddr) {
                setDeliveryAddress(selectedAddr);
                setDeliveryAddressId(selectedAddr._id || selectedAddr.id);
                localStorage.setItem("deliveryAddress", JSON.stringify(selectedAddr));
                localStorage.setItem("deliveryAddressId", selectedAddr._id || selectedAddr.id);
              }
            }
          } catch (addrErr) {
            console.error("Error fetching addresses:", addrErr);
            // Fallback to local storage
            const savedAddress = localStorage.getItem("deliveryAddress");
            const savedAddressId = localStorage.getItem("deliveryAddressId");
            if (savedAddress) {
              try {
                setDeliveryAddress(JSON.parse(savedAddress));
                if (savedAddressId) {
                  setDeliveryAddressId(savedAddressId);
                }
              } catch (e) {
                console.error("Error parsing saved address:", e);
              }
            }
          }

          setIsLoadingCart(false);

          console.log("✅ Cart loaded successfully");
          console.log("Cart items:", items.length);
        } catch (error) {
          console.error("❌ Error loading cart:", error);
          setIsLoadingCart(false);
        }
      } else {
        console.log("⚠️ User not logged in");
        setIsLoadingCart(false);
      }
    };

    loadCart();
  }, []);

  const deliveryFee = totalPrice > 30 ? 0 : 3.99;
  const finalTotal = totalPrice - appliedDiscount + deliveryFee;

  // Get image URL helper
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder-product.svg";
    
    let pathString = imagePath;
    
    if (typeof pathString === 'string' && pathString.startsWith('[') && pathString.endsWith(']')) {
      try {
        const parsed = JSON.parse(pathString);
        if (Array.isArray(parsed) && parsed.length > 0) {
          pathString = parsed[0];
        }
      } catch (e) {}
    }
    
    if (Array.isArray(pathString)) {
      pathString = pathString[0];
    }
    
    if (typeof pathString !== 'string') return "/placeholder-product.svg";
    if (pathString.startsWith("http")) return pathString;

    // Clean up the path
    const cleanPath = pathString.replace(/^[/\\]+/, '');
    
    // Get base URL safely
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const baseUrl = apiBase.replace(/\/api\/?$/, "");
    
    return `${baseUrl}/${cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`}`;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (isApplyingCoupon) {
      return; // Prevent double-click
    }

    setIsApplyingCoupon(true);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiBaseUrl}/customer/coupons/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          couponCode,
          orderAmount: totalPrice
        })
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setAppliedDiscount(data.data.discountAmount);
        toast.success(`Coupon applied: ${data.data.offerName}`);
      } else {
        toast.error(data.message || "Invalid coupon code");
        setAppliedDiscount(0);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error("Failed to apply coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (isProcessingPayment) {
      return; // Prevent double-click
    }

    // Check if user is logged in
    console.log("Is Authenticated:", isUserLoggedIn);
    if (!isUserLoggedIn) {
      const shouldLogin = window.confirm(
        "Please login to complete checkout.\n\nYour cart items will be saved.\n\nWould you like to login now?",
      );
      if (shouldLogin) {
        router.push("/auth");
      }
      return;
    }

    // Check if address is set
    if (!deliveryAddress || !deliveryAddressId) {
      toast.error("Please add a delivery address before checkout");
      setIsAddressModalOpen(true);
      return;
    }

    setIsProcessingPayment(true);

    try {
      // If COD is selected, call order API directly
      if (selectedPaymentMethod === "cod") {
        console.log("=== COD Payment Selected ===");
        console.log("Calling handlePaymentSuccess for COD...");
        await handlePaymentSuccess(null);
        return;
      }

      // For other payment methods, open Razorpay
      await initiateRazorpayPayment();
    } catch (error) {
      console.error("Checkout error:", error);
      setIsProcessingPayment(false);
    }
  };

  const initiateRazorpayPayment = async () => {
    setIsProcessingPayment(true);

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        throw new Error("User not found");
      }

      const user = JSON.parse(userStr);

      // Get Razorpay Key ID from environment
      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayKeyId) {
        throw new Error(
          "Razorpay Key ID not configured. Please add NEXT_PUBLIC_RAZORPAY_KEY_ID to .env.local",
        );
      }

      // Calculate amount in paise (Razorpay requires amount in smallest currency unit)
      const amountInPaise = Math.round(finalTotal * 100);

      console.log("💳 Initiating Razorpay payment");
      console.log("Razorpay Key ID:", razorpayKeyId);
      console.log("Amount:", finalTotal, "INR (", amountInPaise, "paise)");
      console.log("Payment Method:", selectedPaymentMethod);

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please refresh the page.");
      }

      // Razorpay options
      const options = {
        key: razorpayKeyId,
        amount: amountInPaise, // Amount in paise
        currency: "INR",
        name: "Your Store Name", // Your business name
        description: "Order Payment",
        image: "/logo.png", // Your logo URL
        method: {
          upi: true,
          card: true,
          netbanking: true,
        },
        // Note: order_id removed for testing - add it when you have backend order creation
        handler: function (response) {
          console.log("✅ Payment successful!");
          console.log("Payment ID:", response.razorpay_payment_id);
          if (response.razorpay_order_id) {
            console.log("Order ID:", response.razorpay_order_id);
          }
          if (response.razorpay_signature) {
            console.log("Signature:", response.razorpay_signature);
          }

          // Handle successful payment
          handlePaymentSuccess(response);
        },
        prefill: {
          name: user.fullname || user.name || "",
          email: user.email || "",
          contact: user.phone || "",
        },
        notes: {
          address: deliveryAddress
            ? `${deliveryAddress.addressLine1}, ${deliveryAddress.city}`
            : "",
        },
        theme: {
          color: "#3399cc", // Your brand color
        },
        modal: {
          ondismiss: function () {
            console.log("⚠️ Payment cancelled by user");
            setIsProcessingPayment(false);
            toast.error("Payment cancelled. You can try again.");
          },
        },
        // Specify payment methods based on selection
        method: getPaymentMethodForRazorpay(selectedPaymentMethod),
      };

      // Create Razorpay instance and open
      const razorpay = new window.Razorpay(options);
      razorpay.open();

      setIsProcessingPayment(false);
    } catch (error) {
      console.error("❌ Error initiating payment:", error);
      setIsProcessingPayment(false);
      toast.error("We encountered an issue while initiating your payment: " + error.message);
    }
  };

  const getPaymentMethodForRazorpay = (method) => {
    // Map our payment methods to Razorpay methods
    const methodMap = {
      card: {
        card: true,
        netbanking: false,
        wallet: false,
        upi: false,
      },
      netbanking: {
        card: false,
        netbanking: true,
        wallet: false,
        upi: false,
      },
      upi: {
        card: false,
        netbanking: false,
        wallet: false,
        upi: true,
      },
    };

    return (
      methodMap[method] || {
        card: true,
        netbanking: true,
        wallet: true,
        upi: true,
      }
    );
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    console.log('🚀 ========== handlePaymentSuccess CALLED ==========');
    console.log('Payment Response:', paymentResponse);
    
    try {
      console.log("📤 Processing payment...");

      // Step 1: Get user data
      console.log('Step 1: Getting user data...');
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        console.error('❌ User not found in localStorage');
        throw new Error("User not found");
      }

      const user = JSON.parse(userStr);
      const userId = user._id || user.id;

      console.log('✓ User ID:', userId);
      console.log('✓ Delivery Address ID:', deliveryAddressId);
      console.log('✓ Selected Payment Method:', selectedPaymentMethod);

      // Check if deliveryAddressId exists
      if (!deliveryAddressId) {
        console.error('❌ Delivery address ID is missing');
        throw new Error("Delivery address ID not found. Please add a delivery address.");
      }

      // Step 2: Map payment method
      console.log('Step 2: Mapping payment method...');
      let paymentMethodValue = 'cod';
      if (selectedPaymentMethod === 'cod') {
        paymentMethodValue = 'cod';
      } else if (['card', 'netbanking', 'upi', 'online'].includes(selectedPaymentMethod)) {
        paymentMethodValue = 'online';
      }
      console.log('✓ Mapped payment method:', paymentMethodValue);

      // Step 3: Store payment details temporarily
      if (paymentResponse) {
        console.log('Step 3: Storing payment details...');
        localStorage.setItem("lastPayment", JSON.stringify({
          paymentId: paymentResponse.razorpay_payment_id,
          orderId: paymentResponse.razorpay_order_id || null,
          signature: paymentResponse.razorpay_signature || null,
          amount: finalTotal,
          method: selectedPaymentMethod,
          timestamp: new Date().toISOString(),
        }));
        console.log('✓ Payment details stored');
      }

      // Step 4: Prepare API request payload
      console.log('Step 4: Preparing API request...');
      const payload = {
        userId: userId,
        deliveryAddressId: deliveryAddressId,
        paymentMethod: paymentMethodValue
      };

      console.log('=== API CALL DETAILS ===');
      console.log('Method: POST');
      console.log('Endpoint: /api/order/convert-cart-to-order');
      console.log('Payload:', JSON.stringify(payload, null, 2));
      
      if (paymentResponse) {
        console.log('Payment Details:', {
          payment_id: paymentResponse.razorpay_payment_id,
          order_id: paymentResponse.razorpay_order_id,
          signature: paymentResponse.razorpay_signature
        });
      }

      // Step 5: Call Order API using orderAPI service
      console.log('Step 5: Calling Order API...');
      console.log('📤 Making API request NOW...');
      
      let response;
      try {
        response = await orderAPI.convertCartToOrder(payload);
        console.log('✓ API Response received');
        console.log('=== API RESPONSE ===');
        console.log('Full Response:', JSON.stringify(response, null, 2));
      } catch (apiError) {
        console.error('❌ API Call Failed:', apiError);
        
        // Check if it's a 404 error
        if (apiError.message && apiError.message.includes('404')) {
          console.error('❌ ========== BACKEND ENDPOINT NOT FOUND (404) ==========');
          console.error('The backend does not have the order API endpoint implemented.');
          console.error('');
          console.error('BACKEND NEEDS TO IMPLEMENT:');
          console.error('Endpoint: POST /api/order/convert-cart-to-order');
          console.error('');
          console.error('Request Body:');
          console.error(JSON.stringify(payload, null, 2));
          console.error('');
          console.error('Expected Response:');
          console.error(JSON.stringify({
            success: true,
            data: {
              _id: "order_id_here",
              orderId: "ORD-12345",
              userId: payload.userId,
              deliveryAddressId: payload.deliveryAddressId,
              paymentMethod: payload.paymentMethod,
              totalAmount: finalTotal,
              orderStatus: "pending"
            },
            message: "Order created successfully"
          }, null, 2));
          console.error('');
          console.error('See URGENT_BACKEND_FIX.md for complete backend implementation code.');
          console.error('');
          
          // Show user-friendly error with option to continue anyway
          const continueAnyway = confirm(
            '⚠️ BACKEND API NOT FOUND (404 Error)\n\n' +
            'The order creation API endpoint is not implemented on the backend.\n\n' +
            'BACKEND NEEDS TO IMPLEMENT:\n' +
            'POST /api/order/convert-cart-to-order\n\n' +
            'Request Body:\n' +
            JSON.stringify(payload, null, 2) +
            '\n\n' +
            'See URGENT_BACKEND_FIX.md for complete implementation code.\n\n' +
            'Would you like to continue to order confirmation anyway?\n' +
            '(For testing purposes only - no order will be created in database)'
          );
          
          if (continueAnyway) {
            console.log('⚠️ User chose to continue without backend API (TEST MODE)');
            
            // Clear localStorage
            localStorage.removeItem('deliveryAddress');
            localStorage.removeItem('deliveryAddressId');
            
            toast.error("⚠️ TEST MODE: Proceeding without creating order in database. Please implement the backend API for production use.");
            router.push("/order-confirmation");
            return;
          } else {
            throw new Error(
              'Order API endpoint not found (404).\n\n' +
              'Please implement the backend endpoint:\n' +
              'POST /api/order/convert-cart-to-order\n\n' +
              'See URGENT_BACKEND_FIX.md for complete implementation code.'
            );
          }
        }
        
        // Re-throw other errors
        throw apiError;
      }

      console.log('Step 6: Validating API Response...');
      console.log('Response Success:', response?.success);
      console.log('Response Data:', response?.data);

      if (response.success || response.data) {
        console.log('✅ ========== ORDER CREATED SUCCESSFULLY ==========');
        console.log('Order ID:', response.data?._id || response.data?.id || response.orderId);
        
        // Extract orderToken from response
        const orderToken = response.data?.orderToken || response.data?.order?.orderToken;
        console.log('Order Token:', orderToken);
        
        // Save token to localStorage for orders page
        if (orderToken) {
          localStorage.setItem('lastOrderToken', orderToken);
          console.log('✅ Token saved to localStorage');
        }
        
        // Step 7: Clear cart and address from localStorage
        console.log('Step 7: Clearing localStorage...');
        localStorage.removeItem('deliveryAddress');
        localStorage.removeItem('deliveryAddressId');
        
        console.log("✅ Payment processed successfully");

        // Check for multiple orders
        const createdOrders = response.data?.orders || response.data?.data?.orders;
        if (createdOrders && createdOrders.length > 1) {
          toast.success(`Successfully placed ${createdOrders.length} orders for different shops!`);
          alert(`Successfully placed ${createdOrders.length} orders for different shops!`);
        } else {
          toast.success("Order placed successfully! Redirecting to order confirmation...");
        }

        // Step 8: Redirect to order confirmation with token
        console.log('Step 8: Redirecting to order confirmation...');
        
        if (orderToken) {
          console.log('Redirect URL: /order-confirmation/' + orderToken);
          window.location.href = `/order-confirmation/${orderToken}`;
        } else {
          console.log('⚠️ No orderToken found, redirecting without token');
          console.log('Redirect URL: /order-confirmation');
          window.location.href = "/order-confirmation";
        }
        
      } else {
        console.error('❌ API returned unsuccessful response');
        throw new Error(response.message || 'Failed to create order');
      }
      
    } catch (error) {
      console.error('❌ ========== ORDER CREATION FAILED ==========');
      console.error('Error:', error);
      console.error('Error Message:', error.message);
      
      if (!error.message.includes('404')) {
        toast.error("There was an error processing your order. " + error.message);
      }
      setIsProcessingPayment(false);
      throw error;
    }
  };

  const handleSaveAddress = async (addressData) => {
    setIsSavingAddress(true);

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        throw new Error("User not found");
      }

      const user = JSON.parse(userStr);
      const userId = user._id || user.id;

      console.log("📤 Saving address for user:", userId);
      console.log("Address data:", addressData);

      // Call the customer addresses API
      const response = await addressAPI.addAddress({
        userId,
        ...addressData
      });

      console.log("📥 Address API Response:", response);

      if (response.success || response.data) {
        // Extract address ID from response
        const addressId = response.data?._id || response.data?.id || response.addressId;
        
        if (!addressId) {
          console.warn('⚠️ Address ID not found in response');
        }
        
        // Save address to state and localStorage
        const savedAddress = {
          ...addressData
        };

        setDeliveryAddress(savedAddress);
        setDeliveryAddressId(addressId);
        localStorage.setItem("deliveryAddress", JSON.stringify(savedAddress));
        if (addressId) {
          localStorage.setItem("deliveryAddressId", addressId);
        }

        // Add to addresses list and select it
        const newAddress = { ...savedAddress, _id: addressId };
        setAddresses(prev => [...prev, newAddress]);

        console.log("✅ Address saved successfully with ID:", addressId);
        toast.success("Address saved successfully!");
      } else {
        throw new Error(response.message || "Failed to save address");
      }
    } catch (error) {
      console.error("❌ Error saving address:", error);
      toast.error("We couldn't save your address: " + error.message);
      throw error;
    } finally {
      setIsSavingAddress(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return null;

    const parts = [];
    if (address.buildingNumber) parts.push(address.buildingNumber);
    if (address.landmark) parts.push(address.landmark);
    if (address.addressLine1) parts.push(address.addressLine1);

    const line1 = parts.join(", ");
    const line2 = `${address.city}, ${address.state} - ${address.pincode}`;

    return { line1, line2 };
  };

  // Loading state
  if (isLoadingCart) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your cart...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />

        <main className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>

            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>

            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any items yet
            </p>

            <Link
              href="/"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Start Shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">
            Your Cart ({items.length} {items.length === 1 ? "item" : "items"})
          </h1>

          {!isUserLoggedIn && (
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              Login to Save Cart
            </Link>
          )}
        </div>

        {!isUserLoggedIn && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> You're shopping as a guest. Your cart is
              saved locally.
              <Link href="/auth" className="underline ml-1 font-semibold">
                Login
              </Link>{" "}
              to sync your cart and complete checkout.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 w-full min-w-0">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4 min-w-0">
            {items.map(({ product, quantity }) => {
              const productId = product._id || product.id;
              const productName = product.productName || product.name;
              const productPrice = product.productPrice || product.price;
              const productImage = product.productImage || product.image;
              const productUnit = product.productUnit || product.unit;
              const productStock = product.productQuantity || product.stock || 0;
              const isStockLimitReached = productStock > 0 && quantity >= productStock;

              return (
                <article
                  key={productId}
                  className="rounded-xl bg-card border border-border p-3 sm:p-4 flex gap-3 sm:gap-4 animate-slide-up w-full min-w-0"
                >
                  <Link href={`/product/${productId}`} className="shrink-0">
                    <img
                      src={getImageUrl(productImage)}
                      alt={productName}
                      className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-xl"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-product.svg";
                      }}
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2 items-start">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/product/${productId}`}
                          className="font-medium hover:text-primary line-clamp-2 text-sm sm:text-base"
                        >
                          {productName}
                        </Link>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                          {productUnit}
                        </p>
                      </div>

                      <button
                        onClick={() => removeItem(productId)}
                        className="text-muted-foreground hover:text-red-500 transition shrink-0 mt-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center mt-2 sm:mt-4 gap-2">
                      {/* Quantity */}
                      <div className="flex items-center justify-between bg-primary/10 rounded-lg p-1 min-w-0 w-[90px] sm:w-[100px] shrink-0">
                        <button
                          onClick={() => {
                            if (processingItemId) return;
                            setProcessingItemId(productId);
                            decreaseItem(productId);
                            setTimeout(() => setProcessingItemId(null), 300);
                          }}
                          disabled={processingItemId === productId}
                          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-primary hover:text-white transition-colors text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Decrease quantity"
                        >
                          {processingItemId === productId ? (
                            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          )}
                        </button>

                        <span className="font-semibold text-primary text-sm min-w-[16px] text-center">
                          {quantity}
                        </span>

                        <button
                          onClick={() => {
                            if (processingItemId || isStockLimitReached) return;
                            setProcessingItemId(productId);
                            addItem(product);
                            setTimeout(() => setProcessingItemId(null), 300);
                          }}
                          disabled={isStockLimitReached || processingItemId === productId}
                          className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-white rounded-md shadow-sm transition-colors text-primary ${(isStockLimitReached || processingItemId === productId) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary hover:text-white'}`}
                          aria-label="Increase quantity"
                        >
                          {processingItemId === productId ? (
                            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-sm sm:text-base">
                          ₹{(productPrice * quantity).toFixed(2)}
                        </span>
                        {isStockLimitReached && (
                          <p className="text-[10px] sm:text-xs text-orange-500 mt-0.5">Max stock</p>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Summary */}
          <div className="space-y-4 min-w-0 w-full">
            {/* Address */}
            <div className="rounded-xl bg-card border border-border p-3 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="font-semibold text-sm sm:text-base">Delivery Address</h3>
                {isUserLoggedIn && (
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    disabled={isSavingAddress}
                    className="text-primary text-xs sm:text-sm font-semibold hover:bg-primary/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all flex items-center gap-1 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Add new address"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add New
                  </button>
                )}
              </div>

              {isUserLoggedIn ? (
                addresses.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {addresses.map((addr) => {
                      const addrId = addr._id || addr.id;
                      const isSelected = deliveryAddressId === addrId;
                      return (
                        <div
                          key={addrId}
                          onClick={() => {
                            setDeliveryAddress(addr);
                            setDeliveryAddressId(addrId);
                            localStorage.setItem("deliveryAddress", JSON.stringify(addr));
                            localStorage.setItem("deliveryAddressId", addrId);
                          }}
                          className={`flex gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className={`mt-0.5 rounded-full border flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isSelected ? "border-primary" : "border-muted-foreground"}`}>
                            {isSelected && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full" />}
                          </div>
                          <div className="text-xs sm:text-sm flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {formatAddress(addr)?.line1}
                            </p>
                            <p className="text-muted-foreground mt-1 truncate">
                              {formatAddress(addr)?.line2}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-3 rounded-xl font-medium hover:bg-primary/20 transition"
                    aria-label="Add delivery address"
                  >
                    <MapPin className="w-4 h-4" />
                    Add Delivery Address
                  </button>
                )
              ) : (
                <div className="text-sm text-muted-foreground">
                  <Link
                    href="/auth"
                    className="text-primary font-semibold hover:underline"
                  >
                    Login
                  </Link>{" "}
                  to view and add delivery addresses
                </div>
              )}
            </div>

            {/* Coupon */}
            <div className="rounded-xl bg-secondary/50 p-4">
              <div className="flex gap-2 mb-3">
                <Tag className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Apply Coupon</h3>
              </div>

              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  disabled={isApplyingCoupon}
                  className="border border-border px-3 py-2 rounded flex-1 bg-background min-w-0 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <button
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponCode}
                  className="bg-primary text-primary-foreground px-4 rounded hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[80px] justify-center"
                >
                  {isApplyingCoupon ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    </>
                  ) : (
                    'Apply'
                  )}
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-xl bg-card border border-border p-4">
              <div className="flex gap-2 mb-4">
                <Wallet className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Payment Method</h3>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <button
                  onClick={() => setSelectedPaymentMethod("cod")}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedPaymentMethod === "cod"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-lg flex items-center justify-center ${
                          selectedPaymentMethod === "cod"
                            ? "bg-primary/10"
                            : "bg-muted"
                        }`}
                      >
                        <Banknote
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            selectedPaymentMethod === "cod"
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">Cash on Delivery</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          Pay when you receive
                        </p>
                      </div>
                    </div>
                    {selectedPaymentMethod === "cod" && (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-primary" />
                    )}
                  </div>
                </button>

                {/* Credit/Debit Card */}
                <button
                  onClick={() => setSelectedPaymentMethod("card")}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedPaymentMethod === "card"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-lg flex items-center justify-center ${
                          selectedPaymentMethod === "card"
                            ? "bg-primary/10"
                            : "bg-muted"
                        }`}
                      >
                        <CreditCard
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            selectedPaymentMethod === "card"
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">Credit / Debit Card</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          Visa, Mastercard, RuPay
                        </p>
                      </div>
                    </div>
                    {selectedPaymentMethod === "card" && (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-primary" />
                    )}
                  </div>
                </button>

                {/* Net Banking */}
                <button
                  onClick={() => setSelectedPaymentMethod("netbanking")}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedPaymentMethod === "netbanking"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-lg flex items-center justify-center ${
                          selectedPaymentMethod === "netbanking"
                            ? "bg-primary/10"
                            : "bg-muted"
                        }`}
                      >
                        <Building2
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            selectedPaymentMethod === "netbanking"
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">Net Banking</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          All major banks supported
                        </p>
                      </div>
                    </div>
                    {selectedPaymentMethod === "netbanking" && (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-primary" />
                    )}
                  </div>
                </button>

                {/* UPI */}
                <button
                  onClick={() => setSelectedPaymentMethod("upi")}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedPaymentMethod === "upi"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-lg flex items-center justify-center ${
                          selectedPaymentMethod === "upi"
                            ? "bg-primary/10"
                            : "bg-muted"
                        }`}
                      >
                        <Wallet
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            selectedPaymentMethod === "upi"
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">UPI</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          Google Pay, PhonePe, Paytm
                        </p>
                      </div>
                    </div>
                    {selectedPaymentMethod === "upi" && (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-primary" />
                    )}
                  </div>
                </button>
              </div>

              {/* Selected Payment Info */}
              {selectedPaymentMethod && (
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm text-primary font-medium">
                    {selectedPaymentMethod === "cod" &&
                      "✓ You will pay ₹" +
                        finalTotal.toFixed(2) +
                        " on delivery"}
                    {selectedPaymentMethod === "card" &&
                      "✓ Secure card payment gateway"}
                    {selectedPaymentMethod === "netbanking" &&
                      "✓ Redirecting to your bank's secure page"}
                    {selectedPaymentMethod === "upi" &&
                      "✓ Pay using any UPI app"}
                  </p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="rounded-xl bg-card border border-border p-4">
              <h3 className="font-semibold mb-4">Order Summary</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{appliedDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-lg pt-3 border-t">
                  <span>Total</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessingPayment}
                className="w-full mt-4 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : isUserLoggedIn ? (
                  "Proceed to Checkout"
                ) : (
                  "Login to Checkout"
                )}
              </button>

              {!isUserLoggedIn && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Your cart will be saved when you login
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Address Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveAddress}
        currentAddress={deliveryAddress}
      />
    </div>
  );
}
