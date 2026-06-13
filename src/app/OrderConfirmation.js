"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, MapPin, Clock, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { orderAPI } from "@/services";
import Navbar from "@/components/layout/Navbar";

export default function OrderConfirmation({ token }) {
  const { clearCart } = useCart();

  const [showCheck, setShowCheck] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('🔍 OrderConfirmation component loaded');
  console.log('Token received:', token);

  useEffect(() => {
    console.log('🔍 useEffect triggered with token:', token);
    
    const timer = setTimeout(() => setShowCheck(true), 100);

    const clearTimer = setTimeout(() => {
      clearCart();
    }, 1000);

    // Fetch order details using token
    const fetchOrderByToken = async () => {
      try {
        if (!token) {
          console.log('⚠️ No token provided, skipping order fetch');
          setIsLoading(false);
          return;
        }
        
        console.log('📤 Fetching order with token:', token);
        console.log('📤 API URL: http://172.20.10.5:8000/api/order/recent/' + token);
        
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://172.20.10.5:8000/api';
        const accessToken = localStorage.getItem('authToken');
        
        console.log('📤 Access Token:', accessToken ? 'Found' : 'Not Found');
        console.log('📤 Full API Call: GET ' + apiBaseUrl + '/order/recent/' + token);
        
        const response = await fetch(`${apiBaseUrl}/order/recent/${token}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📥 Response status:', response.status);
        
        const data = await response.json();
        console.log('📥 Order by token response:', data);
        
        if (data.success && (data.order || data.data)) {
          setOrderData(data.order || data.data);
          console.log('✅ Order data set successfully');
        } else {
          console.log('⚠️ No order data in response');
        }
      } catch (error) {
        console.error('❌ Error fetching order by token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderByToken();

    return () => {
      clearTimeout(timer);
      clearTimeout(clearTimer);
    };
  }, [clearCart, token]);

  const orderNumber = orderData?.orderNumber || `DM${Date.now().toString().slice(-8)}`;
  const totalAmount = orderData?.totalAmount || 0;
  const deliveryAddress = orderData?.deliveryAddress?.addressLine1 
    ? `${orderData.deliveryAddress.addressLine1}${orderData.deliveryAddress.addressLine2 ? ', ' + orderData.deliveryAddress.addressLine2 : ''}`
    : orderData?.deliveryAddressId?.addressLine1 
    ? `${orderData.deliveryAddressId.addressLine1}${orderData.deliveryAddressId.addressLine2 ? ', ' + orderData.deliveryAddressId.addressLine2 : ''}`
    : "Address will be confirmed shortly";
  const city = orderData?.deliveryAddress?.city || orderData?.deliveryAddressId?.city || "";
  const state = orderData?.deliveryAddress?.state || orderData?.deliveryAddressId?.state || "";
  const pincode = orderData?.deliveryAddress?.pincode || orderData?.deliveryAddressId?.pincode || "";
  
  const fullAddress = deliveryAddress + (city ? `, ${city}` : '') + (state ? `, ${state}` : '') + (pincode ? ` - ${pincode}` : '');

  // ================= SUCCESS STATE =================
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          
          {/* Check Animation */}
          <div
            className={`w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8 transition-transform duration-500 ${
              showCheck ? "scale-100" : "scale-0"
            }`}
          >
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
              <Check
                className="w-12 h-12 text-primary-foreground"
                strokeWidth={3}
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2">
            Order Confirmed!
          </h1>

          <p className="text-muted-foreground mb-8">
            Your order has been placed successfully
          </p>

          {/* Order Info */}
          <div className="rounded-xl bg-background p-6 text-left mb-6 shadow">
            
            <div className="flex justify-between mb-4 pb-4 border-b border-border">
              <div>
                <p className="text-sm text-muted-foreground">
                  Order Number
                </p>
                <p className="font-bold text-lg">
                  {orderNumber}
                </p>
              </div>

              <Package className="w-8 h-8 text-primary" />
            </div>

            <div className="space-y-4">
              
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Amount
                  </p>
                  <p className="font-medium">
                    ₹{totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Delivery Address
                  </p>
                  <p className="font-medium">
                    {fullAddress}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Order Items */}
          {orderData?.items && orderData.items.length > 0 && (
            <div className="rounded-xl bg-background p-6 text-left mb-6 shadow">
              <h2 className="font-bold text-lg mb-4 pb-2 border-b border-border">Order Items</h2>
              <div className="space-y-4">
                {orderData.items.map((item) => (
                  <div key={item._id || item.productId} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity} × ₹{item.price?.toFixed(2) || item.price}</p>
                    </div>
                    <p className="font-semibold">₹{item.totalPrice?.toFixed(2) || item.totalPrice}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <p>Subtotal</p>
                  <p>₹{orderData.subtotal?.toFixed(2) || 0}</p>
                </div>
                {(orderData.taxAmount > 0) && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <p>Tax</p>
                    <p>₹{orderData.taxAmount?.toFixed(2)}</p>
                  </div>
                )}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <p>Delivery Fee</p>
                  <p>{orderData.deliveryCharge > 0 ? `₹${orderData.deliveryCharge.toFixed(2)}` : 'Free'}</p>
                </div>
                {(orderData.discountAmount > 0) && (
                  <div className="flex justify-between text-sm text-green-600">
                    <p>Discount</p>
                    <p>-₹{orderData.discountAmount?.toFixed(2)}</p>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-2 border-t border-border">
                  <p>Total</p>
                  <p>₹{orderData.totalAmount?.toFixed(2) || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            
            <Link
              href={`/orders/${token}`}
              className="bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-center"
            >
              Track Order
            </Link>

            <Link
              href={`/orders/${token}`}
              className="border border-border py-3 rounded-xl text-center font-semibold"
            >
              View Order Details
            </Link>

            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground py-2 text-center"
            >
              Continue Shopping
            </Link>

          </div>
        </div>
      </main>
    </div>
  );
}