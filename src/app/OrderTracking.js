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

const formatTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getStatusStep = (status) => {
  if (!status) return 1;
  const statusStepMap = {
    'PENDING': 1,
    'CONFIRMED': 2,
    'ASSIGNED': 2,
    'PREPARING': 2,
    'PICKED_UP': 3,
    'IN_TRANSIT': 3,
    'ON_THE_WAY': 3,
    'DELIVERED': 4
  };
  return statusStepMap[status.toUpperCase()] || 1;
};

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
          setCurrentStep(getStatusStep(data.order.orderStatus));
        }
      } catch (error) {
        console.error('❌ Error fetching order for tracking:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderByToken();
  }, [token]);

  // Use the tracking hook
  const { orderStatus: liveStatus, deliveryLocation, deliveryBoy } = useOrderTracking(orderData?._id);

  // Update step when live status changes
  useEffect(() => {
    if (liveStatus) {
      setCurrentStep(getStatusStep(liveStatus));
    }
  }, [liveStatus]);

  const steps = [
    {
      id: 1,
      label: "Ordered",
      description: "Order placed",
      icon: Check,
      time: orderData ? formatTime(orderData.createdAt) : "",
    },
    {
      id: 2,
      label: "Confirmed",
      description: "Preparing your order",
      icon: Store,
      time: currentStep >= 2 && orderData ? formatTime(orderData.updatedAt) : "",
    },
    {
      id: 3,
      label: "Out for Delivery",
      description: "Rider is on the way",
      icon: Truck,
      time: currentStep >= 3 ? "Now" : "",
    },
    {
      id: 4,
      label: "Delivered",
      description: "Enjoy your order!",
      icon: Package,
      time: currentStep >= 4 ? "Delivered" : "",
    },
  ];

  const getCustomerLocation = () => {
    if (!orderData) return null;
    const lat = orderData.deliveryAddress?.lat || orderData.deliveryAddress?.lan || orderData.deliveryAddressId?.lat || orderData.deliveryAddressId?.lan;
    const lng = orderData.deliveryAddress?.lng || orderData.deliveryAddressId?.lng;
    return lat && lng ? { lat, lng } : null;
  };

  const getShopLocation = () => {
    if (!orderData) return null;
    const lat = orderData.shop?.lat || orderData.shop?.lan || orderData.vendorId?.lat;
    const lng = orderData.shop?.lng || orderData.vendorId?.lng;
    return lat && lng ? { lat, lng } : null;
  };

  const currentStatusDisplay = liveStatus || orderData?.orderStatus || "PENDING";
  const displayRider = deliveryBoy || orderData?.deliveryBoy;

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
            shopLocation={getShopLocation()}
            customerLocation={getCustomerLocation()}
          />

          {/* Rider Card */}
          <div className="absolute bottom-4 left-4 right-4 z-[1000]">
            <div className="bg-white/90 rounded-xl p-4 flex justify-between items-center shadow">
              
              <div className="flex gap-3 items-center">
                <img
                  src={displayRider?.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"}
                  className="w-12 h-12 rounded-full object-cover"
                  alt="Delivery Partner"
                />
                <div>
                  <p className="font-semibold">{displayRider?.name || displayRider?.fullName || "Assigning Rider..."}</p>
                  <p className="text-sm text-primary font-medium">
                    {displayRider ? (['IN_TRANSIT', 'ON_THE_WAY', 'PICKED_UP'].includes(currentStatusDisplay) ? 'On the way' : 'Assigned') : 'Finding delivery partner'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition">
                  <Phone className="w-5 h-5" />
                </button>

                <Link href={`/chat/delivery/${displayRider?._id || 'd1'}`}>
                  <button className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-xl bg-background p-6 shadow mb-6 border border-border">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-lg">Order Status</h2>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
              {currentStatusDisplay.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="space-y-6">
            {steps.map((step) => {
              const isCompleted = step.id <= currentStep;
              const isCurrent = step.id === currentStep;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex gap-4">
                  
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors ${
                        isCompleted
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {/* Line connecting steps */}
                    {step.id < steps.length && (
                      <div className={`w-0.5 h-full absolute top-10 ${
                        step.id < currentStep ? "bg-primary" : "bg-muted"
                      }`} />
                    )}
                  </div>

                  <div className="flex-1 pb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {step.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-muted-foreground">
                          {step.time}
                        </span>
                        {isCompleted && step.id < currentStep && (
                          <Check className="text-primary w-4 h-4 mt-1" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shop */}
        {orderData?.shop && (
          <div className="rounded-xl bg-background p-4 shadow mb-6 flex items-center gap-4 border border-border">
            <img
              src={orderData.shop.image || orderData.shop.logo || "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100"}
              className="w-16 h-16 rounded-xl object-cover"
              alt={orderData.shop.name || "Shop"}
            />
            <div className="flex-1">
              <p className="font-medium">{orderData.shop.name || "Fresh Mart"}</p>
              <p className="text-sm text-muted-foreground">
                {orderData.shop.address || "123 Market Street"}
              </p>
            </div>

            <Link href={`/chat/shop/${orderData.shop._id || 'shop1'}`}>
              <button className="border px-3 py-2 rounded-md hover:bg-muted transition">
                <MessageCircle className="w-5 h-5" />
              </button>
            </Link>
          </div>
        )}

        {/* Summary */}
        <div className="rounded-xl bg-background p-6 shadow border border-border">
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
              <div className="flex justify-between text-sm mb-3 pb-3 border-b border-border">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-medium">{orderData.orderNumber || token}</span>
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
                      ₹{item.price || item.unitPrice} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium">₹{(item.totalPrice || ((item.price || item.unitPrice) * item.quantity))?.toFixed(2)}</span>
                </div>
              ))}

              <div className="border-t border-border pt-3 space-y-2 text-sm mt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{orderData.subtotal?.toFixed(2) || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Charge</span>
                  <span>{orderData.deliveryCharge === 0 ? 'FREE' : `₹${orderData.deliveryCharge?.toFixed(2) || 0}`}</span>
                </div>
                {orderData.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>₹{orderData.taxAmount?.toFixed(2)}</span>
                  </div>
                )}
                {orderData.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="text-muted-foreground">Discount</span>
                    <span>-₹{orderData.discountAmount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t border-border mt-2">
                  <span>Total</span>
                  <span className="text-primary">₹{orderData.totalAmount?.toFixed(2) || 0}</span>
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
            className="block mt-6 bg-primary text-primary-foreground py-3 rounded-xl text-center font-semibold hover:opacity-90 transition"
          >
            Rate Your Experience
          </Link>
        )}
      </main>
    </div>
  );
}