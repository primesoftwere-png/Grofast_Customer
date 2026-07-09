"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import socketService from '@/services/socket.service';

/**
 * Custom hook for real-time order tracking.
 *
 * Flow:
 *  1. OrderTracking.js fetches the order via API ONCE on mount → passes data as initialOrderData.
 *  2. This hook seeds the initial state (status, deliveryBoy, location) from that API data.
 *  3. After seeding, ALL updates to location and status come exclusively via socket.io events.
 *  4. No repeated API calls are made from inside this hook.
 */
export function useOrderTracking(orderId, orderNumber, initialOrderData = null) {
  const [orderStatus, setOrderStatus] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [deliveryBoy, setDeliveryBoy] = useState(null);
  const [otp, setOtp] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Refs to avoid stale closures in socket callbacks
  const orderIdRef = useRef(orderId);
  const deliveryBoyIdRef = useRef(null);
  const seededRef = useRef(false); // Ensure we seed initial data only once

  // Keep orderIdRef in sync
  useEffect(() => {
    orderIdRef.current = orderId;
  }, [orderId]);

  // ── STEP 1: Seed state from API data (runs once when initialOrderData is first set) ──
  useEffect(() => {
    if (!initialOrderData || seededRef.current) return;
    seededRef.current = true;

    console.log('\n🌱 ================================');
    console.log('🌱  SEEDING INITIAL STATE FROM API');
    console.log('🌱 ================================');

    // Seed order status
    if (initialOrderData.orderStatus) {
      setOrderStatus(initialOrderData.orderStatus);
      console.log('📦 Initial status:', initialOrderData.orderStatus);
    }

    // Seed delivery boy
    const db = initialOrderData.deliveryBoyId || initialOrderData.deliveryBoy;
    if (db) {
      const dbId = typeof db === 'string' ? db : db?._id || db?.id;
      deliveryBoyIdRef.current = dbId;
      setDeliveryBoy(db);
      console.log('🚴 Initial delivery boy:', dbId);
    }

    // Seed OTP
    const initialOtp =
      initialOrderData.deliveryOTP?.code ||
      initialOrderData.deliveryOtp ||
      initialOrderData.otp;
    if (initialOtp) {
      setOtp(initialOtp);
      console.log('🔐 Initial OTP:', initialOtp);
    }

    // Seed initial delivery location if available in API data
    const lat =
      initialOrderData.deliveryLocation?.lat ||
      initialOrderData.deliveryLocation?.latitude ||
      initialOrderData.deliveryBoy?.lat ||
      initialOrderData.deliveryBoy?.latitude ||
      initialOrderData.deliveryBoyId?.lat ||
      initialOrderData.deliveryBoyId?.latitude ||
      initialOrderData.location?.lat ||
      initialOrderData.location?.latitude ||
      initialOrderData.lat ||
      initialOrderData.latitude;
      
    const lng =
      initialOrderData.deliveryLocation?.lng ||
      initialOrderData.deliveryLocation?.longitude ||
      initialOrderData.deliveryBoy?.lng ||
      initialOrderData.deliveryBoy?.longitude ||
      initialOrderData.deliveryBoyId?.lng ||
      initialOrderData.deliveryBoyId?.longitude ||
      initialOrderData.location?.lng ||
      initialOrderData.location?.longitude ||
      initialOrderData.lng ||
      initialOrderData.longitude;

    if (lat && lng) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        setDeliveryLocation({ lat: parsedLat, lng: parsedLng });
        console.log('📍 Initial delivery location:', { lat: parsedLat, lng: parsedLng });
      }
    }

    console.log('🌱 ================================\n');
  }, [initialOrderData]);

  // ── STEP 2: Connect to socket and listen for live updates ──
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('⚠️ No auth token - cannot connect to socket');
      return;
    }
    if (!orderId && !orderNumber) {
      console.log('⚠️ No orderId/orderNumber yet - waiting...');
      return;
    }

    console.log('\n🔌 ================================');
    console.log('🔌  CONNECTING SOCKET FOR TRACKING');
    console.log('🔌 ================================');
    console.log('📦 Order ID:', orderId);
    console.log('🔢 Order Number:', orderNumber);

    // Connect
    const socket = socketService.connect(token);
    if (!socket) {
      console.error('❌ Socket connection failed');
      return;
    }
    setIsConnected(true);

    // ── Helper: update delivery boy preserving existing profile if only ID is sent ──
    const updateDeliveryBoy = (dbData) => {
      if (!dbData) return;
      const dId = typeof dbData === 'string' ? dbData : dbData._id || dbData.id;

      if (dId && dId !== deliveryBoyIdRef.current) {
        deliveryBoyIdRef.current = dId;

        // Re-join room with the new delivery boy ID
        if (socket?.connected) {
          socket.emit('customer:join-order', { orderId: orderIdRef.current, deliveryBoyId: dId }, (res) => {
            console.log('🔄 Re-joined room with delivery boy:', res);
          });
        }
      }

      setDeliveryBoy(prev => {
        if (typeof dbData === 'string' && typeof prev === 'object' && prev !== null) {
          return { ...prev, _id: dbData };
        }
        return dbData;
      });
    };

    // ── Socket event: live location from delivery boy ──
    const handleLiveLocation = (data) => {
      if (!data) return;
      if (data.orderId && data.orderId !== orderIdRef.current) {
        console.log('⚠️ Ignoring location for different order:', data.orderId);
        return;
      }

      const lat = data.lat || data.latitude || data.location?.lat || data.location?.latitude || data.deliveryBoy?.lat || data.deliveryBoy?.latitude || data.deliveryBoyId?.lat || data.deliveryBoyId?.latitude;
      const lng = data.lng || data.longitude || data.location?.lng || data.location?.longitude || data.deliveryBoy?.lng || data.deliveryBoy?.longitude || data.deliveryBoyId?.lng || data.deliveryBoyId?.longitude;

      console.log('📍 [SOCKET] Live location update → lat:', lat, 'lng:', lng);

      if (data.status || data.orderStatus) setOrderStatus(data.status || data.orderStatus);
      if (data.deliveryBoy || data.deliveryBoyId) updateDeliveryBoy(data.deliveryBoy || data.deliveryBoyId);
      if (data.otp || data.deliveryOtp || data.deliveryOTP) setOtp(data.otp || data.deliveryOtp || data.deliveryOTP);

      if (lat && lng) {
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          setDeliveryLocation({
            lat: parsedLat,
            lng: parsedLng,
            speed: data.speed || data.location?.speed || null,
            heading: data.heading || data.location?.heading || null,
            accuracy: data.accuracy || data.location?.accuracy || null,
            timestamp: data.timestamp || new Date().toISOString(),
          });
          console.log('✅ [SOCKET] Delivery location updated on map');
        }
      }
    };

    // ── Socket event: order status changed ──
    const handleOrderStatus = (data) => {
      if (!data) return;
      if (data.orderId && data.orderId !== orderIdRef.current) {
        console.log('⚠️ Ignoring status for different order:', data.orderId);
        return;
      }

      console.log('📦 [SOCKET] Order status update:', data);

      const newStatus = data.status || data.orderStatus;
      if (newStatus) setOrderStatus(newStatus);

      if (data.deliveryBoy || data.deliveryBoyId) updateDeliveryBoy(data.deliveryBoy || data.deliveryBoyId);
      if (data.otp || data.deliveryOtp || data.deliveryOTP) setOtp(data.otp || data.deliveryOtp || data.deliveryOTP);

      // Location may be bundled with status event
      if (data.location || data.lat || data.latitude) handleLiveLocation(data);
    };

    // ── Socket event: order picked up ──
    const handleOrderPickedUp = (data) => {
      if (!data) return;
      if (data.orderId && data.orderId !== orderIdRef.current) return;
      console.log('📦 [SOCKET] Order picked up');
      setOrderStatus('PICKED_UP');
    };

    // ── Socket event: delivery completed ──
    const handleDeliveryCompleted = (data) => {
      if (!data) return;
      if (data.orderId && data.orderId !== orderIdRef.current) return;
      console.log('✅ [SOCKET] Delivery completed');
      setOrderStatus('DELIVERED');
    };

    // Register listeners
    socketService.on('order-status-update', handleOrderStatus);
    socketService.on('live-location-update', handleLiveLocation);
    socketService.on('order-picked-up', handleOrderPickedUp);
    socketService.on('delivery-completed', handleDeliveryCompleted);

    // Join order tracking room
    if (orderId) {
      socket.emit('customer:join-order', {
        orderId,
        deliveryBoyId: deliveryBoyIdRef.current
      }, (res) => {
        console.log('✅ Joined order tracking room:', res);
      });
    }

    // Legacy room join by order number
    if (orderNumber) {
      socket.emit('join-tracking', orderNumber);
    }

    // Re-join room on reconnect
    const handleReconnect = () => {
      console.log('🔄 Socket reconnected - rejoining room');
      if (orderIdRef.current) {
        socket.emit('customer:join-order', {
          orderId: orderIdRef.current,
          deliveryBoyId: deliveryBoyIdRef.current
        }, (res) => {
          console.log('✅ Rejoined after reconnect:', res);
        });
      }
    };

    socket.on('connect', handleReconnect);

    // Cleanup on unmount or when orderId/orderNumber changes
    return () => {
      console.log('🧹 Cleaning up socket listeners');
      socket.off('connect', handleReconnect);
      socketService.off('order-status-update', handleOrderStatus);
      socketService.off('live-location-update', handleLiveLocation);
      socketService.off('order-picked-up', handleOrderPickedUp);
      socketService.off('delivery-completed', handleDeliveryCompleted);
    };
  }, [orderId, orderNumber]); // Only re-runs if orderId or orderNumber changes

  // ── STEP 3: 5-second polling fallback for live delivery location ──
  // This ensures the map updates every 5s even if socket is slow or silent.
  useEffect(() => {
    if (!orderId) return;

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    const pollLocation = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Fetch fresh order details
        const endpoint = orderNumber ? `/order/recent/${orderNumber}` : `/order/recent/${orderId}`;
        const response = await fetch(`${apiBaseUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        const orderInfo = data.data || data.order;
        if (!orderInfo) return;

        // Extract location precisely as done in seeding
        const lat = orderInfo.deliveryLocation?.lat || orderInfo.deliveryLocation?.latitude ||
                   orderInfo.deliveryBoy?.lat || orderInfo.deliveryBoy?.latitude ||
                   orderInfo.deliveryBoyId?.lat || orderInfo.deliveryBoyId?.latitude ||
                   orderInfo.location?.lat || orderInfo.location?.latitude ||
                   orderInfo.lat || orderInfo.latitude;
                   
        const lng = orderInfo.deliveryLocation?.lng || orderInfo.deliveryLocation?.longitude ||
                   orderInfo.deliveryBoy?.lng || orderInfo.deliveryBoy?.longitude ||
                   orderInfo.deliveryBoyId?.lng || orderInfo.deliveryBoyId?.longitude ||
                   orderInfo.location?.lng || orderInfo.location?.longitude ||
                   orderInfo.lng || orderInfo.longitude;

        if (lat && lng) {
          const parsedLat = parseFloat(lat);
          const parsedLng = parseFloat(lng);
          if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
            setDeliveryLocation(prev => {
              // Only update if location changed to prevent unnecessary re-renders
              if (prev && prev.lat === parsedLat && prev.lng === parsedLng) return prev;
              
              console.log('📍 [POLL] Delivery location updated:', { lat: parsedLat, lng: parsedLng });
              return { 
                lat: parsedLat, 
                lng: parsedLng,
                timestamp: new Date().toISOString(),
                source: 'poll'
              };
            });
          }
        }
        
        // Also update status if changed
        if (orderInfo.orderStatus) {
            setOrderStatus(orderInfo.orderStatus);
        }
      } catch (err) {
        console.error('Polling location failed:', err);
      }
    };

    pollLocation();
    const intervalId = setInterval(pollLocation, 5000);
    return () => clearInterval(intervalId);
  }, [orderId, orderNumber]);

  return { orderStatus, deliveryLocation, deliveryBoy, otp, isConnected };
}
