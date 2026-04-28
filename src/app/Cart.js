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
  LogIn,
  Edit2,
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
  const [cartProducts, setCartProducts] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const router = useRouter();

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
          
          // Fetch cart from context (this will load product IDs and quantities)
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

  const handleCheckout = () => {
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

    router.push("/order-confirmation");
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
                {(
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-primary text-sm text-shadow-neutral-100 font-semibold hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
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
                className="w-full mt-4 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition"
              >
                {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
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
