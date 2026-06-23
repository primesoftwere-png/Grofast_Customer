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
  Download,
  FileText
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
    'SHOP_ACCEPTED': 2,
    'CONFIRMED': 2,
    'ASSIGNED': 2,
    'ASSIGNED_TO_DELIVERY': 2,
    'PREPARING': 2,
    'PICKED_UP': 3,
    'IN_TRANSIT': 3,
    'ON_THE_WAY': 3,
    'DELIVERED': 4
  };
  return statusStepMap[status ? status.toUpperCase() : 'PENDING'] || 1;
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
        const accessToken = localStorage.getItem('token');
        
        const response = await fetch(`${apiBaseUrl}/order/recent/${token}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        console.log('📥 Order tracking response:', data);
        
        if (data.success && data.data) {
          setOrderData(data.data);
          setCurrentStep(getStatusStep(data.data.orderStatus));
          fetchShopDetails(data.data, apiBaseUrl);
        } else if (data.success && data.order) {
          setOrderData(data.order);
          setCurrentStep(getStatusStep(data.order.orderStatus));
          fetchShopDetails(data.order, apiBaseUrl);
        }
      } catch (error) {
        console.error('❌ Error fetching order for tracking:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchShopDetails = async (order, apiBaseUrl) => {
      try {
        const shopRef = order.shop || order.shopId;
        const shopIdString = typeof shopRef === 'string' ? shopRef : shopRef?._id;
        
        if (shopIdString && (!shopRef?.shopName && !shopRef?.name && !shopRef?.phone)) {
          const shopRes = await fetch(`${apiBaseUrl}/customer/shop/${shopIdString}`);
          const shopData = await shopRes.json();
          if (shopData.success && shopData.data) {
             setOrderData(prev => ({...prev, shopDetails: shopData.data}));
          }
        }
      } catch (err) {
        console.error("Failed to fetch shop details", err);
      }
    };

    fetchOrderByToken();
  }, [token]);

  // Use the tracking hook
  const { orderStatus: liveStatus, deliveryLocation, deliveryBoy, otp: liveOtp } = useOrderTracking(orderData?._id);

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
    const addr = orderData.deliveryAddressId || orderData.deliveryAddress;
    const lat = addr?.lat || addr?.lan || addr?.latitude;
    const lng = addr?.lng || addr?.longitude;
    return lat && lng ? { lat, lng } : null;
  };

  const getShopLocation = () => {
    if (!orderData) return null;
    const shop = orderData.shopId || orderData.shop;
    const lat = shop?.lat || shop?.lan || shop?.latitude;
    const lng = shop?.lng || shop?.longitude;
    return lat && lng ? { lat, lng } : null;
  };

  const currentStatusDisplay = liveStatus || orderData?.orderStatus || "PENDING";
  const displayRider = deliveryBoy || orderData?.deliveryBoyId || orderData?.deliveryBoy;
  const displayOtp = liveOtp?.code || liveOtp || orderData?.deliveryOTP?.code || orderData?.deliveryOtp || orderData?.otp;
  const shopInfo = orderData?.shopDetails || orderData?.shop || orderData?.shopId;

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    let cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    if (!cleanUrl.startsWith('uploads/')) {
      cleanUrl = `uploads/${cleanUrl}`;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const serverUrl = baseUrl.replace('/api', '');
    return `${serverUrl}/${cleanUrl}`;
  };

  const riderImage = getImageUrl(displayRider?.profileImage) || "delivery_boy.jpg";

  return (
    <div className="min-h-screen bg-background print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="container mx-auto px-4 py-6 print:py-0 print:px-0 max-w-4xl">
        
        {/* Back */}
        <div className="print:hidden">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground mb-6 hover:text-primary transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Invoice Header (Only visible when printing) */}
        <div className="hidden print:block mb-8 border-b pb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-primary">GroFast</h1>
            <div className="text-right">
              <h2 className="text-xl font-bold">INVOICE</h2>
              <p className="text-sm text-gray-500">Order #{orderData?.orderNumber || token}</p>
              <p className="text-sm text-gray-500">{orderData ? formatTime(orderData.createdAt) : ""}</p>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="relative rounded-3xl overflow-hidden bg-muted h-64 md:h-80 mb-6 shadow z-0 print:hidden">
          
          <LiveTrackingMap 
            liveLocation={deliveryLocation || getShopLocation()}
            shopLocation={getShopLocation()}
            customerLocation={getCustomerLocation()}
            deliveryBoyImage={riderImage}
          />

          {/* Rider Card */}
          <div className="absolute bottom-4 left-4 right-4 z-[1000]">
            <div className="bg-white/90 rounded-xl p-4 flex justify-between items-center shadow">
              
              <div className="flex gap-3 items-center">
                <img
                  src={riderImage}
                  className="w-12 h-12 rounded-full object-contain bg-white p-1"
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

        {/* Delivery OTP */}
        {displayOtp && currentStatusDisplay !== 'DELIVERED' && (
          <div className="rounded-xl bg-primary/5 p-6 shadow mb-6 border border-primary/20 text-center relative overflow-hidden print:hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/30"></div>
            <p className="text-sm text-primary font-bold mb-4 uppercase tracking-wider">Delivery Verification PIN</p>
            <div className="flex justify-center gap-2 sm:gap-3">
              {String(displayOtp).padStart(6, '0').substring(0, 6).split('').map((char, index) => (
                <div 
                  key={index} 
                  className="w-10 h-12 sm:w-12 sm:h-14 bg-background border-2 border-primary/20 rounded-lg flex items-center justify-center text-2xl sm:text-3xl font-bold text-primary shadow-sm"
                >
                  {char}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 font-medium">Share this PIN with the rider to confirm your delivery</p>
          </div>
        )}

        {/* Timeline */}
        <div className="rounded-xl bg-background p-6 shadow mb-6 border border-border print:hidden">
          
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
        {shopInfo && (
          <div className="rounded-xl bg-background p-5 shadow mb-6 border border-border print:shadow-none print:border-none print:p-0">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 text-foreground">
              <Store className="w-5 h-5 text-primary" />
              Store Details
            </h2>
            <div className="flex items-start sm:items-center gap-4">
              <img
                src={getImageUrl(shopInfo.image || shopInfo.logo || shopInfo.shopImage) || "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100"}
                className="w-16 h-16 rounded-xl object-cover print:hidden"
                alt={shopInfo.name || shopInfo.shopName || "Shop"}
              />
              <div className="flex-1 space-y-1.5">
                <p className="font-semibold text-base sm:text-lg">{shopInfo.name || shopInfo.shopName || "Fresh Mart"}</p>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{shopInfo.address || shopInfo.shopAddress || "123 Market Street"}</p>
                </div>
                {(shopInfo.phone || shopInfo.contactNumber || shopInfo.shopkeeperId?.phone) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 shrink-0" />
                    <p>{shopInfo.phone || shopInfo.contactNumber || shopInfo.shopkeeperId?.phone}</p>
                  </div>
                )}
              </div>

              <div className="print:hidden self-start sm:self-auto">
                <Link href={`/chat/shop/${shopInfo._id || (typeof shopInfo === 'string' ? shopInfo : 'shop1')}`}>
                  <button className="border border-primary/20 text-primary bg-primary/5 px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Contact Store</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="rounded-xl bg-background p-6 shadow border border-border print:shadow-none print:border-none print:p-0 print:mt-8">
          <div className="flex justify-between items-center mb-6 border-b border-border pb-4 print:border-black">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary print:hidden" />
              Order Summary
            </h2>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg transition-colors print:hidden"
            >
              <Download className="w-4 h-4" />
              Download Invoice
            </button>
          </div>

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
