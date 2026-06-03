"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  Package,
  Check,
  Bike,
  Store,
  Truck,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import dynamic from "next/dynamic";

const LiveTrackingMap = dynamic(() => import("@/components/map/LiveTrackingMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
});

export default function OrderTracking({ token }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch order details using token
  useEffect(() => {
    const fetchOrderByToken = async () => {
      try {
        if (!token) {
          console.log('⚠️ No token provided');
          setIsLoading(false);
          return;
        }
        
        console.log('📤 Fetching order for tracking with token:', token);
        
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const accessToken = localStorage.getItem('authToken');
        
        const response = await fetch(`${apiBaseUrl}/order/recent/${token}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        console.log('📥 Order tracking response:', data);
        
        if (data.success && data.order) {
          setOrderData(data.order);
          
          // Set current step based on order status
          const statusStepMap = {
            'PENDING': 1,
            'CONFIRMED': 2,
            'ON_THE_WAY': 3,
            'DELIVERED': 4
          };
          setCurrentStep(statusStepMap[data.order.orderStatus] || 1);
        }
      } catch (error) {
        console.error('❌ Error fetching order for tracking:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderByToken();
  }, [token]);

  const steps = [
    {
      id: 1,
      label: "Ordered",
      description: "Order confirmed",
      icon: Check,
      time: "10:30 AM",
    },
    {
      id: 2,
      label: "Shipped",
      description: "Picked from shop",
      icon: Store,
      time: "10:45 AM",
    },
    {
      id: 3,
      label: "Out for Delivery",
      description: "On the way",
      icon: Truck,
      time: "Est. 11:00 AM",
    },
    {
      id: 4,
      label: "Delivered",
      description: "Enjoy your order!",
      icon: Package,
      time: "Est. 11:15 AM",
    },
  ];

  // Use the tracking hook
  const { orderStatus: liveStatus, deliveryLocation, deliveryBoy } = useOrderTracking(orderData?._id);

  // Update step when live status changes
  useEffect(() => {
    if (liveStatus) {
      const statusStepMap = {
        'PENDING': 1,
        'CONFIRMED': 2,
        'ASSIGNED': 2,
        'PICKED_UP': 3,
        'IN_TRANSIT': 3,
        'DELIVERED': 4
      };
      if (statusStepMap[liveStatus]) {
        setCurrentStep(statusStepMap[liveStatus]);
      }
    }
  }, [liveStatus]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        
        {/* Back */}
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Map */}
        <div className="relative rounded-3xl overflow-hidden bg-muted h-64 md:h-80 mb-6 shadow z-0">
          
          <LiveTrackingMap 
            liveLocation={deliveryLocation}
            shopLocation={null}
            customerLocation={
              orderData?.deliveryAddressId?.lan && orderData?.deliveryAddressId?.lng
                ? { lat: orderData.deliveryAddressId.lan, lng: orderData.deliveryAddressId.lng }
                : null
            }
          />

          {/* Rider Card */}
          <div className="absolute bottom-4 left-4 right-4 z-[1000]">
            <div className="bg-white/90 rounded-xl p-4 flex justify-between items-center">
              
              <div className="flex gap-3 items-center">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold">{deliveryBoy?.name || "Assigning Rider..."}</p>
                  <p className="text-sm text-primary">
                    {deliveryBoy ? (liveStatus === 'IN_TRANSIT' ? 'On the way' : 'Assigned') : 'Finding nearest delivery partner'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-2 bg-secondary rounded-full">
                  <Phone />
                </button>

                <Link href="/chat/delivery/d1">
                  <button className="p-2 bg-secondary rounded-full">
                    <MessageCircle />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-xl bg-background p-6 shadow mb-6">
          
          <h2 className="font-semibold text-lg mb-6">
            Order Status
          </h2>

          <div className="space-y-6">
            {steps.map((step) => {
              const isCompleted = step.id <= currentStep;
              const isCurrent = step.id === currentStep;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex gap-4">
                  
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-primary text-white"
                        : "bg-muted"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1">
                    <p className="font-medium">{step.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  <span className="text-sm text-muted-foreground">
                    {step.time}
                  </span>

                  {isCompleted && step.id < currentStep && (
                    <Check className="text-primary w-5 h-5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Shop */}
        <div className="rounded-xl bg-background p-4 shadow mb-6 flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100"
            className="w-16 h-16 rounded-xl"
          />
          <div className="flex-1">
            <p className="font-medium">Fresh Mart</p>
            <p className="text-sm text-muted-foreground">
              123 Market Street
            </p>
          </div>

          <Link href="/chat/shop/shop1">
            <button className="border px-3 py-2 rounded-md">
              <MessageCircle />
            </button>
          </Link>
        </div>

        {/* Summary */}
        <div className="rounded-xl bg-background p-6 shadow">
          <h2 className="font-semibold text-lg mb-4">
            Order Summary
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : orderData ? (
            <div className="space-y-3">
              
              {/* Order Number */}
              <div className="flex justify-between text-sm mb-3 pb-3 border-b">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-medium">{orderData.orderNumber}</span>
              </div>

              {/* Items */}
              {orderData.items && orderData.items.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-xs font-medium">
                    {item.productName?.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {item.productName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ₹{item.unitPrice} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium">₹{item.totalPrice?.toFixed(2)}</span>
                </div>
              ))}

              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{orderData.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Charge</span>
                  <span>{orderData.deliveryCharge === 0 ? 'FREE' : `₹${orderData.deliveryCharge?.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>₹{orderData.taxAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total</span>
                  <span>₹{orderData.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No order data available</p>
          )}
        </div>

        {/* Feedback */}
        {currentStep === 4 && (
          <Link
            href="/feedback"
            className="block mt-6 bg-primary text-white py-3 rounded-xl text-center font-semibold"
          >
            Rate Your Experience
          </Link>
        )}
      </main>
    </div>
  );
}