"use client";

import { useState, useEffect, useRef } from 'react';
import socketService from '@/services/socket.service';
/**
 * Custom hook for real-time order tracking
 * @param {string} orderId - Order ID to track
 */
export function useOrderTracking(orderId) {
  const [orderStatus, setOrderStatus] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [deliveryBoy, setDeliveryBoy] = useState(null);
  const [otp, setOtp] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No auth token found');
      return;
    }

    // Handle order status updates
    const handleOrderStatus = (data) => {
      if (data.orderId === orderId) {
        console.log('Order status updated:', data);
        setOrderStatus(data.status);
        
        if (data.deliveryBoy) {
          setDeliveryBoy(data.deliveryBoy);
        }
        
        if (data.otp || data.deliveryOtp || data.deliveryOTP) {
          setOtp(data.otp || data.deliveryOtp || data.deliveryOTP);
        }
      }
    };

    // Handle live location updates
    const handleLiveLocation = (data) => {
      if (data.orderId === orderId) {
        console.log('Location updated via socket:', data);
        setDeliveryLocation({
          lat: data.lat,
          lng: data.lng,
          speed: data.speed,
          heading: data.heading,
          accuracy: data.accuracy,
          timestamp: data.timestamp
        });
      }
    };

    // Connect to socket
    const socket = socketService.connect(token);
    if (socket) {
      setIsConnected(true);

      // Subscribe to events
      socketService.on('order-status-update', handleOrderStatus);
      socketService.on('live-location-update', handleLiveLocation);
    }

    // Fetch location
    const fetchLocation = async () => {
      if (!orderId) return;
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';
        const res = await fetch(`${apiBaseUrl}/order/${orderId}/track`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success && data.data && data.data.location) {
          console.log('Location fetched via API:', data.data.location);
          setDeliveryLocation({
            lat: data.data.location.latitude,
            lng: data.data.location.longitude,
            speed: data.data.location.speed,
            heading: data.data.location.heading,
            accuracy: data.data.location.accuracy,
            timestamp: data.data.location.updatedAt || new Date()
          });
        }
      } catch (err) {
        console.error('Failed to fetch location:', err);
      }
    };

    fetchLocation();
    
    // Poll every 10 seconds as requested
    const intervalId = setInterval(fetchLocation, 10000);

    // Cleanup
    return () => {
      socketService.off('order-status-update', handleOrderStatus);
      socketService.off('live-location-update', handleLiveLocation);
      clearInterval(intervalId);
    };
  }, [orderId]); // Re-run when orderId changes

  return {
    orderStatus,
    deliveryLocation,
    deliveryBoy,
    otp,
    isConnected
  };
}
