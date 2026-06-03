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
  const [isConnected, setIsConnected] = useState(false);
  
  // Use ref to store orderId to avoid re-creating handlers
  const orderIdRef = useRef(orderId);
  
  useEffect(() => {
    orderIdRef.current = orderId;
  }, [orderId]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
      return;
    }

    // Handle order status updates
    const handleOrderStatus = (data) => {
      if (data.orderId === orderIdRef.current) {
        console.log('Order status updated:', data);
        setOrderStatus(data.status);
        
        if (data.deliveryBoy) {
          setDeliveryBoy(data.deliveryBoy);
        }
      }
    };

    // Handle live location updates
    const handleLiveLocation = (data) => {
      if (data.orderId === orderIdRef.current) {
        console.log('Location updated:', data);
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

    // Connect to socket (only once)
    const socket = socketService.connect(token);
    if (socket) {
      setIsConnected(true);

      // Subscribe to events
      socketService.on('order-status-update', handleOrderStatus);
      socketService.on('live-location-update', handleLiveLocation);
    }

    // Cleanup
    return () => {
      socketService.off('order-status-update', handleOrderStatus);
      socketService.off('live-location-update', handleLiveLocation);
    };
  }, []); // Empty dependency array - only run once on mount

  return {
    orderStatus,
    deliveryLocation,
    deliveryBoy,
    isConnected
  };
}
