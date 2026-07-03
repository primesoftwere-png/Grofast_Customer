"use client";

import { io } from 'socket.io-client';

const normalizeSocketUrl = (url) => (url || 'http://localhost:8001')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');

const SOCKET_URL = normalizeSocketUrl(
  process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
);

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  /**
   * Connect to Socket.IO server
   * @param {string} token - JWT authentication token
   */
  connect(token) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    if (!token) {
      console.error('No token provided for socket connection');
      return null;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.setupDefaultListeners();
    return this.socket;
  }

  /**
   * Setup default event listeners
   */
  setupDefaultListeners() {
    if (!this.socket) return;

    // Remove all previous listeners to prevent duplicates
    this.socket.removeAllListeners();

    this.socket.on('connect', () => {
      console.log('\n========================================');
      console.log('✅ CUSTOMER SOCKET CONNECTED');
      console.log('========================================');
      console.log('🔌 Socket ID:', this.socket.id);
      console.log('🌐 Socket URL:', SOCKET_URL);
      console.log('========================================');
      console.log('📡 LISTENING TO EVENTS:');
      console.log('   ├─ delivery:live-location (Location updates)');
      console.log('   ├─ order-status (Status changes)');
      console.log('   ├─ tracking-status (Tracking updates)');
      console.log('   ├─ order:status-changed (General status)');
      console.log('   ├─ order:shop-accepted (Shop accepted)');
      console.log('   ├─ order:delivery-assigned (Delivery assigned)');
      console.log('   ├─ order:picked-up (Picked up)');
      console.log('   ├─ order:out-for-delivery (Out for delivery)');
      console.log('   ├─ delivery:completed (Delivered)');
      console.log('   └─ order:delivered (Delivered alt)');
      console.log('========================================\n');
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('⚠️ Socket connection error:', error.message);
    });

    // Order status updates - Backend broadcasts these events
    this.socket.on('order-status', (data) => {
      console.log('\n📦 ================================');
      console.log('📦  ORDER STATUS UPDATE RECEIVED');
      console.log('📦 ================================');
      console.log('📦 Order ID:', data.orderId);
      console.log('📦 New Status:', data.status || data.orderStatus);
      console.log('📡 Full Data:', JSON.stringify(data, null, 2));
      console.log('📦 ================================\n');
      this.emit('order-status-update', data);
    });

    this.socket.on('tracking-status', (data) => {
      console.log('\n📦 ================================');
      console.log('📦  TRACKING STATUS UPDATE');
      console.log('📦 ================================');
      console.log('📦 Status:', data.status || data.orderStatus);
      console.log('📦 ================================\n');
      this.emit('order-status-update', data);
    });

    // Order status change event (general)
    this.socket.on('order:status-changed', (data) => {
      console.log('\n📦 ================================');
      console.log('📦  ORDER STATUS CHANGED EVENT');
      console.log('📦 ================================');
      console.log('📦 Order ID:', data.orderId);
      console.log('📦 Old Status:', data.oldStatus);
      console.log('📦 New Status:', data.newStatus || data.status);
      console.log('📦 ================================\n');
      this.emit('order-status-update', { ...data, status: data.newStatus || data.status });
    });

    // Delivery boy assigned event
    this.socket.on('order:delivery-assigned', (data) => {
      console.log('\n🚴 ================================');
      console.log('🚴  DELIVERY BOY ASSIGNED');
      console.log('🚴 ================================');
      console.log('📦 Order ID:', data.orderId);
      console.log('🚴 Delivery Boy:', data.deliveryBoy || data.deliveryBoyId);
      console.log('🚴 ================================\n');
      this.emit('order-status-update', { ...data, status: 'ASSIGNED_TO_DELIVERY' });
    });

    // Order accepted by shop event
    this.socket.on('order:shop-accepted', (data) => {
      console.log('\n🏪 ================================');
      console.log('🏪  SHOP ACCEPTED ORDER');
      console.log('🏪 ================================');
      console.log('📦 Order ID:', data.orderId);
      console.log('🏪 ================================\n');
      this.emit('order-status-update', { ...data, status: 'CONFIRMED' });
    });

    // Live location updates from delivery boy (every 5 seconds)
    this.socket.on('delivery:live-location', (data) => {
      console.log('\n========================================');
      console.log('📍 LIVE LOCATION UPDATE RECEIVED');
      console.log('========================================');
      console.log('🚴 Delivery Boy ID:', data.deliveryBoyId);
      console.log('📦 Order ID:', data.orderId);
      console.log('📡 Full Payload:', JSON.stringify(data, null, 2));
      console.log('========================================');
      console.log('📍 COORDINATES:');
      console.log('   ├─ Latitude:  ', data.lat || data.latitude || data.location?.lat || data.location?.latitude || 'Not found');
      console.log('   └─ Longitude: ', data.lng || data.longitude || data.location?.lng || data.location?.longitude || 'Not found');
      if (data.speed) console.log('🚀 Speed:        ', data.speed, 'm/s (', (data.speed * 3.6).toFixed(2), 'km/h)');
      if (data.heading) console.log('🧭 Heading:      ', data.heading, '°');
      if (data.accuracy) console.log('🎯 Accuracy:     ±', data.accuracy, 'm');
      console.log('⏱️  Timestamp:    ', data.timestamp || new Date().toISOString());
      console.log('========================================\n');
      this.emit('live-location-update', data);
    });

    // Legacy support for older event names
    this.socket.on('live-location', (data) => {
      console.log('📍 Live location update (legacy event):', data);
      this.emit('live-location-update', data);
    });

    // Order picked up event
    this.socket.on('order:picked-up', (data) => {
      console.log('\n📦 ================================');
      console.log('📦  ORDER PICKED UP EVENT');
      console.log('📦 ================================');
      console.log('📦 Order ID:', data.orderId);
      console.log('🚴 Delivery Boy:', data.deliveryBoyId);
      console.log('⏰ Timestamp:', data.timestamp || new Date().toISOString());
      console.log('📦 ================================\n');
      this.emit('order-picked-up', data);
      this.emit('order-status-update', { ...data, status: 'PICKED_UP' });
    });

    // Out for delivery event
    this.socket.on('order:out-for-delivery', (data) => {
      console.log('\n🚚 ================================');
      console.log('🚚  OUT FOR DELIVERY EVENT');
      console.log('🚚 ================================');
      console.log('📦 Order ID:', data.orderId);
      console.log('🚴 Delivery Boy:', data.deliveryBoyId);
      console.log('🚚 ================================\n');
      this.emit('order-status-update', { ...data, status: 'OUT_FOR_DELIVERY' });
    });

    // Delivery completed event
    this.socket.on('delivery:completed', (data) => {
      console.log('\n✅ ================================');
      console.log('✅  DELIVERY COMPLETED EVENT');
      console.log('✅ ================================');
      console.log('📦 Order ID:', data.orderId);
      console.log('🚴 Delivery Boy:', data.deliveryBoyId);
      console.log('⏰ Delivered At:', data.deliveredAt || data.timestamp || new Date().toISOString());
      console.log('✅ ================================\n');
      this.emit('delivery-completed', data);
      this.emit('order-status-update', { ...data, status: 'DELIVERED' });
    });

    // Order delivered event (alternative event name)
    this.socket.on('order:delivered', (data) => {
      console.log('\n✅ ================================');
      console.log('✅  ORDER DELIVERED EVENT');
      console.log('✅ ================================');
      console.log('📦 Order ID:', data.orderId);
      console.log('✅ ================================\n');
      this.emit('delivery-completed', data);
      this.emit('order-status-update', { ...data, status: 'DELIVERED' });
    });

    // Debug: Log all incoming events
    this.socket.onAny((eventName, ...args) => {
      console.log(`📡 Socket Event Received: "${eventName}"`, args);
    });
  }

  /**
   * Disconnect from socket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      console.log('Socket disconnected');
    }
  }

  /**
   * Subscribe to custom events
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Unsubscribe from custom events
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Emit custom events to local listeners
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    callbacks.forEach(callback => callback(data));
  }

  /**
   * Get socket instance
   */
  getSocket() {
    return this.socket;
  }

  /**
   * Check if socket is connected
   */
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  /**
   * Join order tracking room (customer side)
   * @param {string} orderId - Order ID
   * @param {string} deliveryBoyId - Delivery boy ID (optional)
   * @param {Function} callback - Callback function for acknowledgment
   */
  joinOrderTracking(orderId, deliveryBoyId, callback) {
    if (!this.socket || !this.socket.connected) {
      console.error('⚠️ Socket not connected - cannot join order tracking');
      return;
    }

    if (!orderId) {
      console.error('⚠️ Order ID is required to join tracking room');
      return;
    }

    console.log('📤 Joining order tracking room:', { orderId, deliveryBoyId });
    
    this.socket.emit('customer:join-order', { orderId, deliveryBoyId }, (response) => {
      console.log('✅ Joined order tracking room:', response);
      if (callback) callback(response);
    });
  }

  /**
   * Listen for live location updates
   * @param {Function} callback - Callback function to handle location data
   */
  onLocationUpdate(callback) {
    if (!this.socket) {
      console.error('⚠️ Socket not initialized');
      return;
    }
    this.on('live-location-update', callback);
  }

  /**
   * Listen for order status updates
   * @param {Function} callback - Callback function to handle status data
   */
  onOrderStatus(callback) {
    if (!this.socket) {
      console.error('⚠️ Socket not initialized');
      return;
    }
    this.on('order-status-update', callback);
  }

  /**
   * Listen for order picked up event
   * @param {Function} callback - Callback function
   */
  onOrderPickedUp(callback) {
    if (!this.socket) {
      console.error('⚠️ Socket not initialized');
      return;
    }
    this.on('order-picked-up', callback);
  }

  /**
   * Listen for delivery completed event
   * @param {Function} callback - Callback function
   */
  onDeliveryCompleted(callback) {
    if (!this.socket) {
      console.error('⚠️ Socket not initialized');
      return;
    }
    this.on('delivery-completed', callback);
  }

  /**
   * Stop listening to location updates
   */
  offLocationUpdate(callback) {
    if (callback) {
      this.off('live-location-update', callback);
    } else {
      // Remove all listeners for this event
      this.listeners.delete('live-location-update');
    }
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
