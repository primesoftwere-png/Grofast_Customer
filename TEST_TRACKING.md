# 🧪 Testing Live Delivery Tracking

## Quick Test Steps

### 1. Start Your Servers

**Backend Server (Socket.IO):**
```bash
# Make sure your backend is running on port 8001
# The Socket.IO server should be initialized
```

**Frontend (Customer Panel):**
```bash
npm run dev
# Runs on http://localhost:3000
```

### 2. Navigate to Tracking Page

Open in browser:
```
http://localhost:3000/tracking/ORD-1783020102273-H0ETVLXHX
```

Replace `ORD-1783020102273-H0ETVLXHX` with your actual order token.

### 3. Open Browser Console (F12)

You should see these logs:

#### ✅ Step 1: Socket Connection
```
========================================
✅ CUSTOMER SOCKET CONNECTED
========================================
🔌 Socket ID: abc123xyz456
🌐 Socket URL: http://localhost:8001
========================================
```

#### ✅ Step 2: Room Join
```
📤 Joining order tracking room...
✅ Successfully joined order tracking room: { success: true }
```

#### ✅ Step 3: Order Data Loaded
```
📥 Order tracking response: { success: true, data: {...} }
```

### 4. Watch for Live Location Updates

When delivery boy moves (every 5 seconds), you'll see:

```
========================================
📍 LIVE LOCATION UPDATE RECEIVED
========================================
🚴 Delivery Boy ID: 507f1f77bcf86cd799439011
📦 Order ID: 507f191e810c19729de860ea
📍 Location: { lat: 28.7041, lng: 77.1025 }
⏱️ Timestamp: 2026-07-03T10:30:45.000Z
🚀 Speed: 10 m/s
🧭 Heading: 90 °
========================================

✅ Delivery location updated: { lat: 28.7041, lng: 77.1025 }
```

### 5. Check Map Visual Updates

**You Should See:**
- 🟢 Green marker = Shop location (static)
- ⚫ Black marker = Customer destination (static)
- 🚴 Delivery boy photo = Live location (moving)

**Map should:**
- Update delivery boy marker position every 5 seconds
- Auto-adjust bounds to show all markers
- Smoothly animate marker movement

### 6. Test Different Order States

#### State 1: PENDING / CONFIRMED
- No map shown
- Status timeline shows "Ordered" or "Confirmed" as active
- Waiting message: "Waiting for delivery partner..."

#### State 2: ASSIGNED_TO_DELIVERY
- Map appears
- Delivery boy card shows "Assigned"
- Delivery OTP displayed (6 digits)
- Location tracking starts

#### State 3: PICKED_UP / OUT_FOR_DELIVERY
- Delivery boy card shows "On the way"
- Active location updates every 5 seconds
- Map marker moves in real-time
- Status timeline shows "Out for Delivery"

#### State 4: DELIVERED
- Status timeline shows "Delivered" as complete
- OTP disappears
- Location tracking stops
- "Rate Your Experience" button appears

## 🐛 Troubleshooting

### Problem: Socket Not Connecting

**Console shows:**
```
⚠️ Socket connection error: ...
```

**Check:**
1. Backend server running? → `curl http://localhost:8001`
2. Socket.IO initialized on backend? → Check backend logs
3. Correct URL in `.env.local`? → `NEXT_PUBLIC_SOCKET_URL=http://localhost:8001`
4. CORS enabled on backend? → Should allow `http://localhost:3000`

**Test Connection Manually:**
```javascript
// In browser console
socketService.isSocketConnected()
// Should return: true
```

### Problem: No Location Updates

**Console shows connection but no location events**

**Check:**
1. Order has delivery boy assigned?
   ```javascript
   // In console
   console.log(orderData.deliveryBoyId)
   // Should NOT be null
   ```

2. Order status correct?
   ```javascript
   // Should be one of:
   ['ASSIGNED_TO_DELIVERY', 'PICKED_UP', 'OUT_FOR_DELIVERY']
   ```

3. Delivery boy app sending location?
   - Check backend logs for: `📡 [SOCKET RECEIVE] 'location:update'`

4. Joined correct room?
   ```javascript
   // In console
   socketService.getSocket().emit('customer:join-order', { 
     orderId: 'YOUR_ORDER_ID',
     deliveryBoyId: 'YOUR_DELIVERY_BOY_ID'
   })
   ```

### Problem: Map Not Showing

**Check:**
1. At least one location available?
   - Shop location, or
   - Customer location, or
   - Delivery boy location

2. Coordinates format correct?
   ```javascript
   // Should be numbers:
   { lat: 28.7041, lng: 77.1025 }
   
   // NOT strings:
   { lat: "28.7041", lng: "77.1025" } // ❌
   ```

3. Map container has height?
   - Parent div should have `height: 400px` or similar

### Problem: Wrong Order Data

**Console shows:**
```
⚠️ Ignoring status update for different order: 507f...
```

**This is normal!** The hook filters events to only process updates for the current order.

**If you're not getting ANY updates:**
1. Verify order ID matches:
   ```javascript
   // In console
   console.log('Current order ID:', orderId)
   console.log('Event order ID:', data.orderId)
   // Should match
   ```

## 🧪 Manual Testing with Socket.IO

### Test Event Emission (Backend Developer)

If you have access to backend, test broadcasting:

```javascript
// On backend
io.to(`order:${orderId}`).emit('delivery:live-location', {
  orderId: '507f191e810c19729de860ea',
  deliveryBoyId: '507f1f77bcf86cd799439011',
  lat: 28.7041,
  lng: 77.1025,
  speed: 10,
  heading: 90,
  accuracy: 5,
  timestamp: new Date().toISOString()
});
```

Customer console should immediately show the location update.

### Test from Browser Console

Manually emit events:

```javascript
// Get socket instance
const socket = socketService.getSocket();

// Test joining room
socket.emit('customer:join-order', { 
  orderId: '507f191e810c19729de860ea',
  deliveryBoyId: '507f1f77bcf86cd799439011'
}, (response) => {
  console.log('Response:', response);
});

// Listen for specific event
socket.on('delivery:live-location', (data) => {
  console.log('Manual listener:', data);
});
```

## ✅ Success Checklist

Verify all these are working:

- [ ] Socket connects successfully
- [ ] Console shows "✅ CUSTOMER SOCKET CONNECTED"
- [ ] Customer joins order room
- [ ] Order data loads from API
- [ ] Map displays with at least one marker
- [ ] Status timeline shows correct step
- [ ] Delivery boy info shows (name, phone, vehicle)
- [ ] Delivery OTP displays (6 digits)
- [ ] Location updates received every 5 seconds
- [ ] Map marker moves smoothly
- [ ] Console logs location updates with emoji
- [ ] Status changes update timeline
- [ ] No errors in console

## 📊 Expected Console Output (Full Flow)

```
========================================
🚀 INITIALIZING ORDER TRACKING
========================================
📦 Order ID: 507f191e810c19729de860ea
🔢 Order Number: ORD-1783020102273-H0ETVLXHX
========================================

========================================
✅ CUSTOMER SOCKET CONNECTED
========================================
🔌 Socket ID: abc123xyz456
🌐 Socket URL: http://localhost:8001
========================================

📤 Joining order tracking room...
✅ Successfully joined order tracking room: { success: true }

📡 Socket Event Received: "customer:join-order"

========================================
📍 LIVE LOCATION UPDATE RECEIVED
========================================
🚴 Delivery Boy ID: 507f1f77bcf86cd799439011
📦 Order ID: 507f191e810c19729de860ea
📍 Location: { lat: 28.7041, lng: 77.1025 }
⏱️ Timestamp: 2026-07-03T10:30:45.000Z
🚀 Speed: 10 m/s
🧭 Heading: 90 °
========================================

✅ Delivery location updated: { lat: 28.7041, lng: 77.1025 }

[... repeats every 5 seconds ...]
```

## 🎯 Performance Check

Monitor these in browser DevTools:

1. **Network Tab:**
   - WebSocket connection: `ws://localhost:8001/socket.io/...`
   - Status: `101 Switching Protocols` (green)
   - Messages: Should see frames every 5 seconds

2. **Memory:**
   - Should stay stable
   - No memory leaks from socket listeners

3. **CPU:**
   - Should be low
   - Map updates should be smooth (60fps)

## 📱 Mobile Testing

Test on mobile device:

1. Update `.env.local`:
   ```env
   NEXT_PUBLIC_SOCKET_URL=http://YOUR_LOCAL_IP:8001
   ```

2. Access from mobile:
   ```
   http://YOUR_LOCAL_IP:3000/tracking/ORDER_TOKEN
   ```

3. Verify:
   - Socket connects over local network
   - Map renders correctly
   - Touch interactions work
   - Markers update in real-time

## 🎉 Done!

If all checks pass, your live delivery tracking is **100% functional**! 🚀

Track your deliveries at:
```
http://localhost:3000/tracking/[order-token]
```

**Happy Tracking! 📍🚚**
