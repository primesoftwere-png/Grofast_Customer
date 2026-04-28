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

export default function Cart() {
  const { items, updateQuantity, removeItem, totalPrice, isAuthenticated, fetchCart } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const router = useRouter();

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch cart when page loads
  useEffect(() => {
    const loadCart = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      console.log('=== Cart Page Loaded ===');
      console.log('Token exists:', !!token);
      console.log('User exists:', !!userStr);
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          const userIdValue = user._id || user.id;
          
          console.log('📤 Fetching cart for user:', userIdValue);
          console.log('API Call: GET /api/cart/products/' + userIdValue);
          
          setIsLoadingCart(true);
          
          // Fetch cart from context
          await fetchCart(userIdValue);
          
          // Load saved address from localStorage
          const savedAddress = localStorage.getItem('deliveryAddress');
          if (savedAddress) {
            try {
              setDeliveryAddress(JSON.parse(savedAddress));
            } catch (e) {
              console.error('Error parsing saved address:', e);
            }
          }
          
          setIsLoadingCart(false);
          
          console.log('✅ Cart loaded successfully');
          console.log('Cart items:', items.length);
        } catch (error) {
          console.error('❌ Error loading cart:', error);
          setIsLoadingCart(false);
        }
      } else {
        console.log('⚠️ User not logged in');
        setIsLoadingCart(false);
      }
    };
    
    loadCart();
  }, []);

  const deliveryFee = totalPrice > 30 ? 0 : 3.99;
  const finalTotal = totalPrice - appliedDiscount + deliveryFee;

  // Get image URL helper
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-product.svg';
    if (imagePath.startsWith('http')) return imagePath;
    
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const baseUrl = apiBase.replace('/api', '');
    return `${baseUrl}/uploads/${imagePath}`;
  };

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === "fresh10") {
      setAppliedDiscount(totalPrice * 0.1);
      alert("Coupon applied! 10% off");
    } else {
      alert("Invalid coupon code");
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    // Check if user is logged in
    console.log("Is Authenticated:", isAuthenticated);
    if (!isAuthenticated) {
      const shouldLogin = window.confirm(
        "Please login to complete checkout.\n\nYour cart items will be saved.\n\nWould you like to login now?"
      );
      if (shouldLogin) {
        router.push('/auth');
      }
      return;
    }

    // Check if address is set
    if (!deliveryAddress) {
      alert("Please add a delivery address before checkout");
      setIsAddressModalOpen(true);
      return;
    }

    // If COD is selected, proceed directly to order confirmation
    if (selectedPaymentMethod === "cod") {
      console.log("✅ COD selected - Proceeding to order confirmation");
      router.push("/order-confirmation");
      return;
    }

    // For other payment methods, open Razorpay
    await initiateRazorpayPayment();
  };

  const initiateRazorpayPayment = async () => {
    setIsProcessingPayment(true);

    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error("User not found");
      }

      const user = JSON.parse(userStr);
      
      // Get Razorpay Key ID from environment
      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      
      if (!razorpayKeyId) {
        throw new Error("Razorpay Key ID not configured. Please add NEXT_PUBLIC_RAZORPAY_KEY_ID to .env.local");
      }
      
      // Calculate amount in paise (Razorpay requires amount in smallest currency unit)
      const amountInPaise = Math.round(finalTotal * 100);

      console.log('💳 Initiating Razorpay payment');
      console.log('Razorpay Key ID:', razorpayKeyId);
      console.log('Amount:', finalTotal, 'INR (', amountInPaise, 'paise)');
      console.log('Payment Method:', selectedPaymentMethod);

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please refresh the page.");
      }

      // Razorpay options
      const options = {
        key: razorpayKeyId,
        amount: amountInPaise, // Amount in paise
        currency: 'INR',
        name: 'Your Store Name', // Your business name
        description: 'Order Payment',
        image: '/logo.png', // Your logo URL
        // Note: order_id removed for testing - add it when you have backend order creation
        handler: function (response) {
          console.log('✅ Payment successful!');
          console.log('Payment ID:', response.razorpay_payment_id);
          if (response.razorpay_order_id) {
            console.log('Order ID:', response.razorpay_order_id);
          }
          if (response.razorpay_signature) {
            console.log('Signature:', response.razorpay_signature);
          }
          
          // Handle successful payment
          handlePaymentSuccess(response);
        },
        prefill: {
          name: user.fullname || user.name || '',
          email: user.email || '',
          contact: user.phone || ''
        },
        notes: {
          address: deliveryAddress ? `${deliveryAddress.addressLine1}, ${deliveryAddress.city}` : ''
        },
        theme: {
          color: '#3399cc' // Your brand color
        },
        modal: {
          ondismiss: function() {
            console.log('⚠️ Payment cancelled by user');
            setIsProcessingPayment(false);
            alert('Payment cancelled. You can try again.');
          }
        },
        // Specify payment methods based on selection
        method: getPaymentMethodForRazorpay(selectedPaymentMethod)
      };

      // Create Razorpay instance and open
      const razorpay = new window.Razorpay(options);
      razorpay.open();

      setIsProcessingPayment(false);

    } catch (error) {
      console.error('❌ Error initiating payment:', error);
      setIsProcessingPayment(false);
      alert('Failed to initiate payment: ' + error.message);
    }
  };

  const getPaymentMethodForRazorpay = (method) => {
    // Map our payment methods to Razorpay methods
    const methodMap = {
      'card': {
        card: true,
        netbanking: false,
        wallet: false,
        upi: false
      },
      'netbanking': {
        card: false,
        netbanking: true,
        wallet: false,
        upi: false
      },
      'upi': {
        card: false,
        netbanking: false,
        wallet: false,
        upi: true
      }
    };

    return methodMap[method] || {
      card: true,
      netbanking: true,
      wallet: true,
      upi: true
    };
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      console.log('📤 Processing payment...');
      
      // Here you would typically:
      // 1. Send payment details to your backend
      // 2. Verify payment signature (if order_id was used)
      // 3. Create order in database
      // 4. Clear cart
      
      // For now, we'll just redirect to order confirmation
      // In production, you should verify the payment on backend first
      
      // Store payment details temporarily
      localStorage.setItem('lastPayment', JSON.stringify({
        paymentId: paymentResponse.razorpay_payment_id,
        orderId: paymentResponse.razorpay_order_id || null,
        signature: paymentResponse.razorpay_signature || null,
        amount: finalTotal,
        method: selectedPaymentMethod,
        timestamp: new Date().toISOString()
      }));

      console.log('✅ Payment processed successfully');
      alert('Payment successful! Redirecting to order confirmation...');
      
      // Redirect to order confirmation
      router.push('/order-confirmation');
      
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      alert('Payment was successful but there was an error processing your order. Please contact support.');
    }
  };

  const handleSaveAddress = async (addressData) => {
    setIsSavingAddress(true);
    
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error("User not found");
      }
      
      const user = JSON.parse(userStr);
      const userId = user._id || user.id;
      
      console.log('📤 Saving address for user:', userId);
      console.log('Address data:', addressData);
      
      // Call the customer addresses API
      const response = await addressAPI.addCustomerAddress({
        userId,
        addressLine1: addressData.addressLine1,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode
      });
      
      console.log('📥 Address API Response:', response);
      
      if (response.success || response.data) {
        // Save address to state and localStorage
        const savedAddress = {
          addressLine1: addressData.addressLine1,
          city: addressData.city,
          state: addressData.state,
          pincode: addressData.pincode,
          landmark: addressData.landmark,
          buildingNumber: addressData.buildingNumber
        };
        
        setDeliveryAddress(savedAddress);
        localStorage.setItem('deliveryAddress', JSON.stringify(savedAddress));
        
        console.log('✅ Address saved successfully');
        alert('Address saved successfully!');
      } else {
        throw new Error(response.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('❌ Error saving address:', error);
      alert('Failed to save address: ' + error.message);
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
      <div className="min-h-screen bg-background">
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
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>

            <h1 className="text-2xl font-bold mb-2">
              Your cart is empty
            </h1>

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
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            Your Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>

          {!isAuthenticated && (
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              <LogIn className="w-4 h-4" />
              Login to Save Cart
            </Link>
          )}
        </div>

        {!isAuthenticated && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> You're shopping as a guest. Your cart is saved locally. 
              <Link href="/auth" className="underline ml-1 font-semibold">
                Login
              </Link> to sync your cart and complete checkout.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => {
              const productId = product._id || product.id;
              const productName = product.productName || product.name;
              const productPrice = product.productPrice || product.price;
              const productImage = product.productImage || product.image;
              const productUnit = product.productUnit || product.unit;

              return (
                <article
                  key={productId}
                  className="rounded-xl bg-card border border-border p-4 flex gap-4 animate-slide-up"
                >
                  <Link href={`/product/${productId}`}>
                    <img
                      src={getImageUrl(productImage)}
                      alt={productName}
                      className="w-24 h-24 object-cover rounded-xl"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-product.svg';
                      }}
                    />
                  </Link>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <Link
                          href={`/product/${productId}`}
                          className="font-medium hover:text-primary"
                        >
                          {productName}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {productUnit}
                        </p>
                      </div>

                      <button
                        onClick={() => removeItem(productId)}
                        className="text-muted-foreground hover:text-red-500 transition"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      
                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(productId, quantity - 1)
                          }
                          className="bg-muted px-2 py-1 rounded hover:bg-muted/80 transition"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span className="w-8 text-center font-medium">{quantity}</span>

                        <button
                          onClick={() =>
                            updateQuantity(productId, quantity + 1)
                          }
                          className="bg-muted px-2 py-1 rounded hover:bg-muted/80 transition"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold">
                        ₹{(productPrice * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            
            {/* Address */}
            <div className="rounded-xl bg-card border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Delivery Address</h3>
                {isAuthenticated && deliveryAddress && (
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-primary text-sm font-semibold hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                    aria-label="Change delivery address"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Change
                  </button>
                )}
              </div>

              {isAuthenticated ? (
                deliveryAddress ? (
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground">
                        {formatAddress(deliveryAddress)?.line1}
                      </p>
                      <p className="text-muted-foreground mt-1">
                        {formatAddress(deliveryAddress)?.line2}
                      </p>
                    </div>
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
                  <Link href="/auth" className="text-primary font-semibold hover:underline">
                    Login
                  </Link> to add delivery address
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
                  className="border border-border px-3 py-2 rounded flex-1 bg-background"
                />

                <button
                  onClick={handleApplyCoupon}
                  className="bg-primary text-primary-foreground px-4 rounded hover:opacity-90 transition"
                >
                  Apply
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
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedPaymentMethod === "cod"
                          ? "bg-primary/10"
                          : "bg-muted"
                      }`}>
                        <Banknote className={`w-5 h-5 ${
                          selectedPaymentMethod === "cod"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-xs text-muted-foreground">Pay when you receive</p>
                      </div>
                    </div>
                    {selectedPaymentMethod === "cod" && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
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
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedPaymentMethod === "card"
                          ? "bg-primary/10"
                          : "bg-muted"
                      }`}>
                        <CreditCard className={`w-5 h-5 ${
                          selectedPaymentMethod === "card"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">Credit / Debit Card</p>
                        <p className="text-xs text-muted-foreground">Visa, Mastercard, RuPay</p>
                      </div>
                    </div>
                    {selectedPaymentMethod === "card" && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
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
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedPaymentMethod === "netbanking"
                          ? "bg-primary/10"
                          : "bg-muted"
                      }`}>
                        <Building2 className={`w-5 h-5 ${
                          selectedPaymentMethod === "netbanking"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">Net Banking</p>
                        <p className="text-xs text-muted-foreground">All major banks supported</p>
                      </div>
                    </div>
                    {selectedPaymentMethod === "netbanking" && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
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
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedPaymentMethod === "upi"
                          ? "bg-primary/10"
                          : "bg-muted"
                      }`}>
                        <Wallet className={`w-5 h-5 ${
                          selectedPaymentMethod === "upi"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">UPI</p>
                        <p className="text-xs text-muted-foreground">Google Pay, PhonePe, Paytm</p>
                      </div>
                    </div>
                    {selectedPaymentMethod === "upi" && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </button>

              </div>

              {/* Selected Payment Info */}
              {selectedPaymentMethod && (
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm text-primary font-medium">
                    {selectedPaymentMethod === "cod" && "✓ You will pay ₹" + finalTotal.toFixed(2) + " on delivery"}
                    {selectedPaymentMethod === "card" && "✓ Secure card payment gateway"}
                    {selectedPaymentMethod === "netbanking" && "✓ Redirecting to your bank's secure page"}
                    {selectedPaymentMethod === "upi" && "✓ Pay using any UPI app"}
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
                    {deliveryFee === 0
                      ? "FREE"
                      : `₹${deliveryFee.toFixed(2)}`}
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
                ) : (
                  isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'
                )}
              </button>

              {!isAuthenticated && (
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
