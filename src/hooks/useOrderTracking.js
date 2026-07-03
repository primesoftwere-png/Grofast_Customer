"use client";

import { useState, useEffect, useRef } from 'react';
import socketService from '@/services/socket.service';
/**
 * Custom hook for real-time order tracking
 * @param {string} orderId - Order ID to track
 * @param {string} orderNumber - Order Number to track
 */
export function useOrderTracking(orderId, orderNumber, initialOrderData = null) {
  const [orderStatus, setOrderStatus] = useState(initialOrderData?.orderStatus || null);
  const orderStatusRef = useRef(initialOrderData?.orderStatus || null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [deliveryBoy, setDeliveryBoy] = useState(null);
  const [otp, setOtp] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Keep track of delivery boy ID for interval requests
  const deliveryBoyIdRef = useRef(null);
  
  // Sync initial data if provided later
  useEffect(() => {
    if (initialOrderData) {
      if (initialOrderData.orderStatus && !orderStatusRef.current) {
        setOrderStatus(initialOrderData.orderStatus);
        orderStatusRef.current = initialOrderData.orderStatus;
      }
      
      const db = initialOrderData.deliveryBoyId || initialOrderData.deliveryBoy;
      const dbId = typeof db === 'string' ? db : db?._id || db?.id;
      if (dbId && !deliveryBoyIdRef.current) {
        deliveryBoyIdRef.current = dbId;
        setDeliveryBoy(db);
      }
      
      if (!deliveryLocation) {
        const lat = initialOrderData.lat || initialOrderData.latitude || initialOrderData.location?.lat || initialOrderData.location?.latitude || initialOrderData.deliveryLocation?.lat || initialOrderData.deliveryBoy?.lat;
        const lng = initialOrderData.lng || initialOrderData.longitude || initialOrderData.location?.lng || initialOrderData.location?.longitude || initialOrderData.deliveryLocation?.lng || initialOrderData.deliveryBoy?.lng;
        if (lat && lng) {
          setDeliveryLocation({ lat, lng });
        }
      }
    }
  }, [initialOrderData]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('⚠️ No auth token found - cannot connect to Socket.IO');
      return;
    }

    if (!orderId && !orderNumber) {
      console.log('⚠️ No order ID or order number provided - skipping socket connection');
      return;
    }

    console.log('\n========================================');
    console.log('🚀 INITIALIZING ORDER TRACKING');
    console.log('========================================');
    console.log('📦 Order ID:', orderId);
    console.log('🔢 Order Number:', orderNumber);
    console.log('========================================\n');

    // Helper to safely update delivery boy, join their specific room, and preserve object details
    const updateDeliveryBoy = (dbData) => {
      if (!dbData) return;
      const dId = typeof dbData === 'string' ? dbData : dbData._id || dbData.id;
      console.log("📝 Updating delivery boy data:", dbData);
      
      if (dId && dId !== deliveryBoyIdRef.current) {
        deliveryBoyIdRef.current = dId;
        console.log("✅ Delivery boy ID updated:", dId);
        
        // Re-join order tracking room with new delivery boy ID
        if (orderId && socket && socket.connected) {
          socket.emit('customer:join-order', { orderId, deliveryBoyId: dId }, (response) => {
            console.log('🔄 Re-joined tracking room with delivery boy:', response);
          });
        }
      }
      
      setDeliveryBoy(prev => {
        // If we received just an ID, but we already have their full profile, preserve the profile
        if (typeof dbData === 'string' && typeof prev === 'object' && prev !== null) {
          return { ...prev, _id: dbData };
        }
        // Otherwise, update with the new data
        return dbData;
      });
    };

    // Handle order status updates
    const handleOrderStatus = (data) => {
      if (!data) return;
      
      // Filter: only process if it's for this order or if no orderId specified (room broadcast)
      if (data.orderId && data.orderId !== orderId) {
        console.log('⚠️ Ignoring status update for different order:', data.orderId);
        return;
      }

      console.log('📦 Processing order status update:', data);
      
      if (data.status || data.orderStatus) {
        const newStatus = data.status || data.orderStatus;
        setOrderStatus(newStatus);
        orderStatusRef.current = newStatus;
        console.log('✅ Order status updated to:', newStatus);
      }
      
      if (data.deliveryBoy || data.deliveryBoyId) {
        updateDeliveryBoy(data.deliveryBoy || data.deliveryBoyId);
      }
      
      if (data.otp || data.deliveryOtp || data.deliveryOTP) {
        setOtp(data.otp || data.deliveryOtp || data.deliveryOTP);
      }
      
      // If location is also sent in status update
      if (data.location || data.lat || data.latitude) {
        handleLiveLocation(data);
      }
    };

    // Handle live location updates from delivery boy (every 5 seconds)
    const handleLiveLocation = (data) => {
      if (!data) {
        console.log('⚠️ Empty location data received');
        return;
      }
      
      // Filter: only process if it's for this order or if no orderId specified
      if (data.orderId && data.orderId !== orderId) {
        console.log('⚠️ Ignoring location update for different order:', data.orderId);
        return;
      }
      
      console.log('\n========================================');
      console.log('📍 PROCESSING LIVE LOCATION UPDATE');
      console.log('========================================');
      console.log('📦 Order ID:', data.orderId);
      console.log('🚴 Delivery Boy ID:', data.deliveryBoyId);
      console.log('📡 Raw Data Received:', JSON.stringify(data, null, 2));
      console.log('========================================\n');
      
      // Extract latitude and longitude flexibly from the socket data
      const latitude = data.lat || data.latitude || data.location?.latitude || data.location?.lat;
      const longitude = data.lng || data.longitude || data.location?.longitude || data.location?.lng;
      
      console.log('🔍 COORDINATE EXTRACTION:');
      console.log('├─ data.lat:', data.lat);
      console.log('├─ data.latitude:', data.latitude);
      console.log('├─ data.location?.lat:', data.location?.lat);
      console.log('├─ data.location?.latitude:', data.location?.latitude);
      console.log('├─ data.lng:', data.lng);
      console.log('├─ data.longitude:', data.longitude);
      console.log('├─ data.location?.lng:', data.location?.lng);
      console.log('├─ data.location?.longitude:', data.location?.longitude);
      console.log('└─ EXTRACTED → Latitude:', latitude, 'Longitude:', longitude);
      console.log('');
      
      // Sometimes live location payload also includes status/boy updates
      if (data.status || data.orderStatus) {
        const newStatus = data.status || data.orderStatus;
        setOrderStatus(newStatus);
        orderStatusRef.current = newStatus;
        console.log('📦 Order status updated to:', newStatus);
      }
      if (data.deliveryBoy || data.deliveryBoyId) {
        updateDeliveryBoy(data.deliveryBoy || data.deliveryBoyId);
      }
      if (data.otp || data.deliveryOtp || data.deliveryOTP) {
        const otpValue = data.otp || data.deliveryOtp || data.deliveryOTP;
        setOtp(otpValue);
        console.log('🔐 OTP updated:', otpValue);
      }

      // Ensure we have coordinates before updating
      if (latitude && longitude) {
        const locationUpdate = {
          ...data,
          ...(data.location || {}),
          lat: latitude,
          lng: longitude,
          speed: data.speed || data.location?.speed || null,
          heading: data.heading || data.location?.heading || null,
          accuracy: data.accuracy || data.location?.accuracy || null,
          timestamp: data.timestamp || data.location?.updatedAt || new Date().toISOString()
        };
        
        setDeliveryLocation(prev => ({
          ...prev,
          ...locationUpdate
        }));
        
        console.log('\n✅ ================================');
        console.log('✅  LOCATION SUCCESSFULLY UPDATED');
        console.log('✅ ================================');
        console.log('📍 Coordinates:');
        console.log('   ├─ Latitude:  ', latitude);
        console.log('   └─ Longitude: ', longitude);
        if (locationUpdate.speed) {
          console.log('🚀 Speed:        ', locationUpdate.speed, 'm/s', '(' + (locationUpdate.speed * 3.6).toFixed(2) + ' km/h)');
        }
        if (locationUpdate.heading) {
          console.log('🧭 Heading:      ', locationUpdate.heading, '°');
        }
        if (locationUpdate.accuracy) {
          console.log('🎯 Accuracy:     ±', locationUpdate.accuracy, 'm');
        }
        console.log('⏰ Timestamp:    ', new Date(locationUpdate.timestamp).toLocaleString());
        console.log('✅ ================================\n');
      } else {
        console.log('\n❌ ================================');
        console.log('❌  NO VALID COORDINATES FOUND');
        console.log('❌ ================================');
        console.log('⚠️  Extracted values:');
        console.log('    ├─ Latitude:  ', latitude, '(type:', typeof latitude, ')');
        console.log('    └─ Longitude: ', longitude, '(type:', typeof longitude, ')');
        console.log('❌ ================================\n');
      }
    };

    // Handle order picked up event
    const handleOrderPickedUp = (data) => {
      if (!data) return;
      if (data.orderId && data.orderId !== orderId) return;
      
      console.log('📦 Order picked up:', data);
      setOrderStatus('PICKED_UP');
      orderStatusRef.current = 'PICKED_UP';
    };

    // Handle delivery completed event
    const handleDeliveryCompleted = (data) => {
      if (!data) return;
      if (data.orderId && data.orderId !== orderId) return;
      
      console.log('✅ Delivery completed:', data);
      setOrderStatus('DELIVERED');
      orderStatusRef.current = 'DELIVERED';
    };

    // Connect to socket
    const socket = socketService.connect(token);
    if (!socket) {
      console.error('❌ Failed to connect to Socket.IO');
      return;
    }

    setIsConnected(true);

    // Subscribe to Socket.IO events via socketService wrapper
    socketService.on('order-status-update', handleOrderStatus);
    socketService.on('live-location-update', handleLiveLocation);
    socketService.on('order-picked-up', handleOrderPickedUp);
    socketService.on('delivery-completed', handleDeliveryCompleted);
    
    // Join tracking room - this is CRITICAL for receiving location updates
    // Backend broadcasts to room: `order:${orderId}`
    if (orderId) {
      console.log('📤 Joining order tracking room...');
      socket.emit('customer:join-order', { 
        orderId, 
        deliveryBoyId: deliveryBoyIdRef.current 
      }, (response) => {
        if (response?.success) {
          console.log('✅ Successfully joined order tracking room:', response);
        } else {
          console.log('⚠️ Joined tracking room (no ack):', response);
        }
      });
    }
    
    // Legacy support for orderNumber-based tracking
    if (orderNumber) {
      socket.emit('join-tracking', orderNumber, (response) => {
        console.log('📤 Joined legacy tracking room:', response);
      });
    }

    // Handle reconnection - re-join room if connection is lost
    const handleReconnect = () => {
      console.log('🔄 Socket reconnected - rejoining tracking room');
      if (orderId) {
        socket.emit('customer:join-order', { 
          orderId, 
          deliveryBoyId: deliveryBoyIdRef.current 
        }, (response) => {
          console.log('✅ Rejoined tracking room after reconnect:', response);
        });
      }
    };

    socket.on('connect', handleReconnect);
    
    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up order tracking...');
      socket.off('connect', handleReconnect);
      socketService.off('order-status-update', handleOrderStatus);
      socketService.off('live-location-update', handleLiveLocation);
      socketService.off('order-picked-up', handleOrderPickedUp);
      socketService.off('delivery-completed', handleDeliveryCompleted);
    };
  }, [orderId, orderNumber]); // Re-run when orderId or orderNumber changes

  return {
    orderStatus,
    deliveryLocation,
    deliveryBoy,
    otp,
    isConnected
  };
}
