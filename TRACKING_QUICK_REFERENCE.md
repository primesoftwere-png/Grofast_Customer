# 🚀 Live Tracking - Quick Reference Card

## 📍 Access Tracking Page

```
http://localhost:3000/tracking/[ORDER_TOKEN]
```

Example:
```
http://localhost:3000/tracking/ORD-1783020102273-H0ETVLXHX
```

## 🔧 Configuration Files

### `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:8001
```

## 📡 Socket.IO Events

### Backend → Customer (Receive)

| Event | Frequency | Data |
|-------|-----------|------|
| `delivery:live-location` | Every 5s | `{ orderId, deliveryBoyId, lat, lng, speed, heading }` |
| `order-status` | On change | `{ orderId, status, deliveryBoy, otp }` |
| `order:picked-up` | Once | `{ orderId, deliveryBoyId }` |
| `delivery:completed` | Once | `{ orderId, deliveryBoyId }` |

### Customer → Backend (Send)

| Event | When | Data |
|-------|------|------|
| `customer:join-order` | Page load | `{ orderId, deliveryBoyId }` |

## 🎯 Order Status Flow

```
PENDING → CONFIRMED → ASSIGNED_TO_DELIVERY → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
                       [Start Tracking]         [Location Updates Every 5s]    [Stop]
```

## 🧩 Core Components

### 1. Socket Service
```javascript
import socketService from '@/services/socket.service';

// Connect
socketService.connect(token);

// Join room
socketService.joinOrderTracking(orderId, deliveryBoyId);

// Listen
socketService.onLocationUpdate((data) => {
  console.log('Location:', data.lat, data.lng);
});

// Disconnect
socketService.disconnect();
```

### 2. Order Tracking Hook
```javascript
import { useOrderTracking } from '@/hooks/useOrderTracking';

const { orderStatus, deliveryLocation, deliveryBoy, otp } = useOrderTracking(
  orderId,
  orderNumber,
  initialOrderData
);
```

### 3. Live Map Component
```javascript
import LiveTrackingMap from '@/components/map/LiveTrackingMap';

<LiveTrackingMap 
  liveLocation={deliveryLocation}
  shopLocation={shopLocation}
  customerLocation={customerLocation}
  deliveryBoyImage={riderImage}
/>
```

## 🐛 Debug Console Commands

```javascript
// Check connection
socketService.isSocketConnected()

// Get socket instance
const socket = socketService.getSocket()

// Check socket ID
socket.id

// Manually join room
socket.emit('customer:join-order', { orderId: 'xxx', deliveryBoyId: 'yyy' })

// Listen to all events
socket.onAny((event, data) => console.log(event, data))
```

## 📊 Console Indicators

| Emoji | Meaning |
|-------|---------|
| ✅ | Success / Connected |
| ❌ | Error / Disconnected |
| ⚠️ | Warning |
| 📡 | Socket Event |
| 📍 | Location Update |
| 📦 | Order Status |
| 🚴 | Delivery Boy |
| 🔌 | Connection |

## 🔍 Common Issues

### Socket Won't Connect
```bash
# Check backend running
curl http://localhost:8001

# Verify environment
cat .env.local | grep SOCKET
```

### No Location Updates
```javascript
// Check order state
console.log(orderData.orderStatus)
// Must be: ASSIGNED_TO_DELIVERY or later

// Check delivery boy assigned
console.log(orderData.deliveryBoyId)
// Must not be null
```

### Map Not Showing
```javascript
// Check coordinates
console.log(deliveryLocation)
// Must have: { lat: Number, lng: Number }
```

## 🎨 UI States

| Status | Map | Delivery Boy Card | OTP | Timeline |
|--------|-----|-------------------|-----|----------|
| PENDING | ❌ | ❌ | ❌ | Step 1 |
| CONFIRMED | ❌ | ❌ | ❌ | Step 2 |
| ASSIGNED_TO_DELIVERY | ✅ | ✅ "Assigned" | ✅ | Step 3 |
| PICKED_UP | ✅ | ✅ "On the way" | ✅ | Step 4 |
| OUT_FOR_DELIVERY | ✅ | ✅ "On the way" | ✅ | Step 4 |
| DELIVERED | ✅ | ✅ | ❌ | Step 5 |

## 📱 Production Checklist

- [ ] Update `NEXT_PUBLIC_SOCKET_URL` to production domain
- [ ] Enable CORS on backend for production domain
- [ ] Test with SSL (wss:// protocol)
- [ ] Monitor socket connection stability
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Test on different networks (4G, WiFi)
- [ ] Test on different devices (iOS, Android)
- [ ] Load test socket connections

## 🚀 Quick Start

1. **Install dependencies** (already done):
   ```bash
   npm install socket.io-client leaflet react-leaflet
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Edit NEXT_PUBLIC_SOCKET_URL
   ```

3. **Start dev server**:
   ```bash
   npm run dev
   ```

4. **Test tracking**:
   ```
   http://localhost:3000/tracking/[order-token]
   ```

5. **Open console** (F12) and watch for:
   ```
   ✅ CUSTOMER SOCKET CONNECTED
   ```

## 📚 Documentation Files

- `TRACKING_INTEGRATION.md` - Complete implementation guide
- `TEST_TRACKING.md` - Testing procedures
- `TRACKING_QUICK_REFERENCE.md` - This file

## 💡 Pro Tips

1. **Always check console** - All events are logged with emojis
2. **Use DevTools Network tab** - Monitor WebSocket frames
3. **Test reconnection** - Disable/enable network to test auto-reconnect
4. **Monitor performance** - Location updates should be smooth (no lag)
5. **Filter by order ID** - Hook automatically filters events for current order

## 🎯 Success Criteria

✅ Socket connects within 1 second  
✅ Room join acknowledged  
✅ Location updates every 5 seconds  
✅ Map marker animates smoothly  
✅ Status changes reflect immediately  
✅ No errors in console  
✅ Auto-reconnects after network loss  

---

**Need Help?** Check console logs - they tell you everything! 📊
