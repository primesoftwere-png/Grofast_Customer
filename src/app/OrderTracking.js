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
import { useParams } from "next/navigation";

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
    'ACCEPTED': 2,
    'PREPARING': 2,
    'READY_FOR_PICKUP': 2,
    'ASSIGNED': 3,
    'ASSIGNED_TO_DELIVERY': 3,
    'PICKED_UP': 4,
    'IN_TRANSIT': 4,
    'ON_THE_WAY': 4,
    'OUT_FOR_DELIVERY': 4,
    'DELIVERED': 5
  };
  return statusStepMap[status ? status.toUpperCase() : 'PENDING'] || 1;
};

export default function OrderTracking({ token: propToken }) {
  const params = useParams();
  const token = propToken || params?.token;
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reusable function to fetch order details using token
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

  // Initial fetch only
  useEffect(() => {
    fetchOrderByToken();
  }, [token]);

  // Log initial order data when it loads
  useEffect(() => {
    if (orderData) {
      console.log('\n🎯 ================================');
      console.log('🎯  ORDER DATA LOADED');
      console.log('🎯 ================================');
      console.log('📦 Order ID:', orderData._id);
      console.log('📦 Order Number:', orderData.orderNumber);
      console.log('📦 Order Status:', orderData.orderStatus);
      console.log('🚴 Delivery Boy ID:', orderData.deliveryBoyId?._id || orderData.deliveryBoyId || orderData.deliveryBoy?._id || 'Not assigned');
      console.log('🎯 ================================');
      
      // Log all available locations
      const customerLoc = getCustomerLocation();
      const shopLoc = getShopLocation();
      
      console.log('\n📍 INITIAL LOCATIONS:');
      console.log('├─ 🏠 Customer:', customerLoc || 'Not available');
      console.log('├─ 🏪 Shop:', shopLoc || 'Not available');
      console.log('└─ 🚴 Delivery Boy: Waiting for live updates...');
      console.log('');
    }
  }, [orderData]);

  // Use the tracking hook
  const { orderStatus: liveStatus, deliveryLocation, deliveryBoy, otp: liveOtp } = useOrderTracking(orderData?._id, orderData?.orderNumber || token, orderData);

  // Log delivery location changes with clear indicator of updates
  useEffect(() => {
    if (deliveryLocation) {
      const updateNumber = Date.now();
      console.log('\n🗺️  ================================');
      console.log('🗺️   MAP LOCATION UPDATE #' + updateNumber);
      console.log('🗺️  ================================');
      console.log('📍 Delivery Boy Location:');
      console.log('   ├─ Latitude:  ', deliveryLocation.lat);
      console.log('   └─ Longitude: ', deliveryLocation.lng);
      if (deliveryLocation.speed) {
        console.log('🚀 Speed:        ', deliveryLocation.speed, 'm/s');
      }
      if (deliveryLocation.heading) {
        console.log('🧭 Heading:      ', deliveryLocation.heading, '°');
      }
      if (deliveryLocation.timestamp) {
        console.log('⏰ Last Update:  ', new Date(deliveryLocation.timestamp).toLocaleString());
      }
      console.log('🔔 Map marker will move to new position!');
      console.log('🗺️  ================================\n');
    }
  }, [deliveryLocation]);

  // Update step when live status changes via socket - NO re-fetch, socket is the source of truth
  useEffect(() => {
    if (liveStatus) {
      const newStep = getStatusStep(liveStatus);
      setCurrentStep(newStep);
      
      console.log('\n🔄 ================================');
      console.log('🔄  ORDER STATUS UPDATED VIA SOCKET');
      console.log('🔄 ================================');
      console.log('📦 New Live Status:', liveStatus);
      console.log('📊 Timeline Step:', newStep, '/ 5');
      console.log('🔄 ================================\n');
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
      label: "Assigned Delivery",
      description: "Rider assigned",
      icon: Bike,
      time: currentStep >= 3 && orderData ? formatTime(orderData.updatedAt) : "",
    },
    {
      id: 4,
      label: "Out for Delivery",
      description: "Rider is on the way",
      icon: Truck,
      time: currentStep >= 4 ? "Now" : "",
    },
    {
      id: 5,
      label: "Delivered",
      description: "Enjoy your order!",
      icon: Package,
      time: currentStep >= 5 ? "Delivered" : "",
    },
  ];

  const getCustomerLocation = () => {
    if (!orderData) return null;
    const addr = orderData.deliveryAddressId || orderData.deliveryAddress;
    const lat = addr?.lat || addr?.lan || addr?.latitude;
    const lng = addr?.lng || addr?.longitude;
    
    const location = lat && lng ? { lat, lng } : null;
    
    if (location) {
      console.log('🏠 Customer Location:', location);
    }
    
    return location;
  };

  const getShopLocation = () => {
    if (!orderData) return null;
    const shop = orderData.shopId || orderData.shop;
    const lat = shop?.lat || shop?.lan || shop?.latitude;
    const lng = shop?.lng || shop?.longitude;
    
    const location = lat && lng ? { lat, lng } : null;
    
    if (location) {
      console.log('🏪 Shop Location:', location);
    }
    
    return location;
  };

  const rawStatus = liveStatus || orderData?.orderStatus || "PENDING";
  let currentStatusDisplay = rawStatus;
  
  // Log current status for debugging
  console.log('📊 Current Status Display:', {
    raw: rawStatus,
    live: liveStatus,
    orderData: orderData?.orderStatus,
    display: currentStatusDisplay
  });
  
  // Map internal statuses to user-friendly display text
  if (['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(rawStatus)) {
    currentStatusDisplay = 'OUT_FOR_DELIVERY';
  } else if (['ASSIGNED', 'ASSIGNED_TO_DELIVERY'].includes(rawStatus)) {
    currentStatusDisplay = 'ASSIGNED_DELIVERY';
  }

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

  const riderImage = getImageUrl(displayRider?.profileImage) || "/delivery_boy.jpg";

  const handleDownloadInvoice = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('printable-area');
      if (!element) return;
      
      const clone = element.cloneNode(true);
      
      // Remove elements that should be hidden in print
      const hiddenElements = clone.querySelectorAll('.print\\:hidden');
      hiddenElements.forEach(el => el.parentNode?.removeChild(el));
      
      // Show elements that are specifically for print
      const blockElements = clone.querySelectorAll('.print\\:block');
      blockElements.forEach(el => {
        el.classList.remove('hidden');
        el.style.display = 'block';
      });

      // FIX: html2canvas crashes on oklch/lab colors.
      // We comprehensively REMOVE Tailwind color classes, shadows, and rings, and replace with safe inline styles.
      // MUST use getAttribute('class') because SVGs return SVGAnimatedString for .className!
      const applySafeColorsAndRemoveClasses = (el) => {
        let classes = el.getAttribute('class') || '';
        if (classes && typeof classes === 'string' && classes.length > 0) {
          
          // Map of known classes to safe inline styles
          const styleMap = [
            { c: 'bg-background', p: 'backgroundColor', v: '#ffffff' },
            { c: 'bg-muted', p: 'backgroundColor', v: '#f4f6f4' },
            { c: 'bg-secondary', p: 'backgroundColor', v: '#fdf2c8' },
            { c: 'bg-secondary/80', p: 'backgroundColor', v: 'rgba(253, 242, 200, 0.8)' },
            { c: 'bg-primary/5', p: 'backgroundColor', v: 'rgba(134, 216, 96, 0.05)' },
            { c: 'bg-primary/10', p: 'backgroundColor', v: 'rgba(134, 216, 96, 0.1)' },
            { c: 'bg-primary/30', p: 'backgroundColor', v: 'rgba(134, 216, 96, 0.3)' },
            { c: 'bg-primary', p: 'backgroundColor', v: '#86d860' }, // must be after / modifiers
            { c: 'text-primary', p: 'color', v: '#86d860' },
            { c: 'text-foreground', p: 'color', v: '#333333' },
            { c: 'text-muted-foreground', p: 'color', v: '#737373' },
            { c: 'text-secondary-foreground', p: 'color', v: '#333333' },
            { c: 'text-green-600', p: 'color', v: '#16a34a' },
            { c: 'border-border', p: 'borderColor', v: '#e5e7eb' },
            { c: 'border-primary/20', p: 'borderColor', v: 'rgba(134, 216, 96, 0.2)' },
            { c: 'text-gray-500', p: 'color', v: '#6b7280' },
            { c: 'bg-white/90', p: 'backgroundColor', v: 'rgba(255, 255, 255, 0.9)' },
            { c: 'bg-primary/15', p: 'backgroundColor', v: 'rgba(134, 216, 96, 0.15)' }
          ];

          let updatedClasses = classes;
          styleMap.forEach(({ c, p, v }) => {
            const regex = new RegExp(`\\b${c.replace(/\//g, '\\/')}\\b`, 'g');
            if (regex.test(classes)) {
              el.style[p] = v;
            }
          });
          
          // AGGRESSIVE STRIP: Remove classes that trigger lab() colors in getComputedStyle
          // This includes shadows, rings, and any color with an opacity modifier (/)
          updatedClasses = updatedClasses.replace(/\bshadow(-\w+)?\b/g, ''); // all shadows
          updatedClasses = updatedClasses.replace(/\bring(-\w+)?(\/\d+)?\b/g, ''); // all rings
          updatedClasses = updatedClasses.replace(/\bbg-\w+\/\d+\b/g, ''); // bg with opacity
          updatedClasses = updatedClasses.replace(/\btext-\w+\/\d+\b/g, ''); // text with opacity
          updatedClasses = updatedClasses.replace(/\bborder-\w+\/\d+\b/g, ''); // border with opacity
          
          // Remove all theme-based utility classes directly to prevent any leftovers
          const themeColors = ['primary', 'secondary', 'muted', 'background', 'foreground', 'border', 'accent', 'destructive'];
          themeColors.forEach(color => {
            updatedClasses = updatedClasses.replace(new RegExp(`\\bbg-${color}\\b`, 'g'), '');
            updatedClasses = updatedClasses.replace(new RegExp(`\\btext-${color}\\b`, 'g'), '');
            updatedClasses = updatedClasses.replace(new RegExp(`\\bborder-${color}\\b`, 'g'), '');
            updatedClasses = updatedClasses.replace(new RegExp(`\\btext-${color}-foreground\\b`, 'g'), '');
          });

          if (classes !== updatedClasses) {
            el.setAttribute('class', updatedClasses.trim().replace(/\s+/g, ' '));
          }
        }
        Array.from(el.children).forEach(applySafeColorsAndRemoveClasses);
      };
      
      applySafeColorsAndRemoveClasses(clone);
      
      const opt = {
        margin:       15,
        filename:     `Invoice_${orderData?.orderNumber || token}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf().set(opt).from(clone).save();
    } catch (err) {
      console.error('Failed to generate PDF', err);
    }
  };

  return (
    <div className="min-h-screen bg-background print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* Loading State - Show while fetching order data */}
      {isLoading && (
        <main className="container mx-auto px-4 py-6 print:py-0 print:px-0 max-w-4xl">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-transparent border-t-primary/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Loading Order Details...</h2>
              <p className="text-sm text-muted-foreground">Please wait while we fetch your order information</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </main>
      )}

      {/* Main Content - Show after loading */}
      {!isLoading && (
      <main id="printable-area" className="container mx-auto px-4 py-6 print:py-0 print:px-0 max-w-4xl">
        
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

        {/* Map and Delivery Info */}
        {(currentStatusDisplay === 'OUT_FOR_DELIVERY') && (
          <>
            <div className="relative rounded-3xl overflow-hidden bg-muted h-64 md:h-80 mb-4 shadow z-0 print:hidden">
              
              <LiveTrackingMap 
                liveLocation={deliveryLocation || null}
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
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{displayRider?.name || displayRider?.fullName || displayRider?.fullname || "Assigning Rider..."}</p>
                      
                      {displayRider && (displayRider.vehicleType || displayRider.vehicleNumber) && (
                        <p className="text-sm text-gray-600 font-medium">
                          {displayRider.vehicleType ? displayRider.vehicleType.charAt(0).toUpperCase() + displayRider.vehicleType.slice(1) : ''} 
                          {displayRider.vehicleNumber ? ` • ${displayRider.vehicleNumber}` : ''}
                        </p>
                      )}
                      
                      <p className="text-sm text-primary font-bold mt-0.5">
                        {displayRider ? (['IN_TRANSIT', 'ON_THE_WAY', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(rawStatus) ? 'On the way' : 'Assigned') : 'Finding delivery partner'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {displayRider?.phone ? (
                      <a href={`tel:${displayRider.phone}`} className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition flex items-center justify-center">
                        <Phone className="w-5 h-5" />
                      </a>
                    ) : (
                      <button className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition opacity-50 cursor-not-allowed">
                        <Phone className="w-5 h-5" />
                      </button>
                    )}

                    <Link href={`/chat/delivery/${displayRider?._id || displayRider?.id || 'd1'}`}>
                      <button className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition">
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Location Debug Panel – for mobile testing */}
            <div className="rounded-xl mb-4 border border-primary/20 bg-primary/5 print:hidden overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-primary/10 border-b border-primary/20">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">📍 Live Location Debug</span>
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Updates every 5s
                </span>
              </div>
              <div className="px-4 py-3 space-y-1.5 font-mono text-xs">
                <div className="flex gap-2 items-start">
                  <span className="text-orange-500 font-bold shrink-0">🚴 Rider:</span>
                  <span className="text-foreground break-all">
                    {deliveryLocation
                      ? `${deliveryLocation.lat.toFixed(7)}, ${deliveryLocation.lng.toFixed(7)}`
                      : <span className="text-muted-foreground italic">Waiting for rider location…</span>}
                  </span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-green-600 font-bold shrink-0">🏪 Shop:</span>
                  <span className="text-foreground break-all">
                    {getShopLocation()
                      ? `${getShopLocation().lat.toFixed(7)}, ${getShopLocation().lng.toFixed(7)}`
                      : <span className="text-muted-foreground italic">Not available</span>}
                  </span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-blue-500 font-bold shrink-0">🏠 You:</span>
                  <span className="text-foreground break-all">
                    {getCustomerLocation()
                      ? `${getCustomerLocation().lat.toFixed(7)}, ${getCustomerLocation().lng.toFixed(7)}`
                      : <span className="text-muted-foreground italic">Not available</span>}
                  </span>
                </div>
                {deliveryLocation?.timestamp && (
                  <div className="flex gap-2 items-center pt-1 border-t border-primary/10">
                    <span className="text-muted-foreground shrink-0">⏰ Last update:</span>
                    <span className="text-muted-foreground">{new Date(deliveryLocation.timestamp).toLocaleTimeString()}</span>
                    {deliveryLocation.source === 'poll' && <span className="text-xs text-blue-400">(poll)</span>}
                  </div>
                )}
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
          </>
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
              onClick={handleDownloadInvoice}
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
        {currentStep === 5 && (
          <Link
            href="/feedback"
            className="block mt-6 bg-primary text-primary-foreground py-3 rounded-xl text-center font-semibold hover:opacity-90 transition"
          >
            Rate Your Experience
          </Link>
        )}
      </main>
      )}
    </div>
  );
}
