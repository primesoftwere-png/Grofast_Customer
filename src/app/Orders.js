"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Clock,
  RotateCcw,
  FileText,
  ChevronRight,
  MapPin,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import socketService from "@/services/socket.service";
import toast from "react-hot-toast";

/* ================= STATUS CONFIG ================= */

const statusConfig = {
  DELIVERED: {
    label: "Delivered",
    className: "bg-green-100 text-green-700 border border-green-200",
  },
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  PREPARING: {
    label: "Preparing",
    className: "bg-purple-100 text-purple-700 border border-purple-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 border border-red-200",
  },
  "ON_THE_WAY": {
    label: "On the Way",
    className: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  },
  ASSIGNED: {
    label: "Assigned",
    className: "bg-cyan-100 text-cyan-700 border border-cyan-200",
  },
  PICKED_UP: {
    label: "Picked Up",
    className: "bg-teal-100 text-teal-700 border border-teal-200",
  },
  IN_TRANSIT: {
    label: "In Transit",
    className: "bg-sky-100 text-sky-700 border border-sky-200",
  },
};

/* ================= ORDER CARD ================= */

function OrderCard({ order }) {
  const status = statusConfig[order.orderStatus?.toUpperCase()] || statusConfig.PENDING;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <article className="rounded-xl bg-background p-4 shadow animate-slide-up border border-border">
      
      {/* Header */}
      <div className="flex justify-between mb-3">
        <div>
          <p className="font-semibold">{order.orderNumber}</p>
          <p className="text-sm text-muted-foreground">
            {orderDate}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      {/* Items - Show product names */}
      <div className="mb-4">
        <div className="space-y-2">
          {order.items && order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-xs font-medium">
                  {item.productName?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-medium">₹{item.totalPrice?.toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
          <p className="font-bold">Total Amount</p>
          <p className="font-bold text-lg">₹{order.totalAmount?.toFixed(2)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        
        {(order.showTrackingButton || ["PENDING", "CONFIRMED", "ON_THE_WAY", "ASSIGNED", "PICKED_UP", "IN_TRANSIT"].includes(order.orderStatus?.toUpperCase())) && (
          <Link
            href={`/tracking/${order.orderToken || order._id}` || order.actionButton?.url}
            className="flex-1 bg-primary text-white py-2 rounded-md text-center flex items-center justify-center gap-1 hover:opacity-90 transition"
          >
            <Clock className="w-4 h-4" />
            {order.actionButton?.text || "Track Order"}
          </Link>
        )}

        {order.orderStatus?.toUpperCase() === "DELIVERED" && (
          <>
            <button className="flex-1 bg-primary text-white py-2 rounded-md flex items-center justify-center gap-1 hover:opacity-90 transition">
              <RotateCcw className="w-4 h-4" />
              Reorder
            </button>

            <button className="border border-border px-3 py-2 rounded-md hover:bg-muted transition">
              <FileText className="w-4 h-4" />
            </button>
          </>
        )}

        <Link 
          href={`/orders/${order.orderToken}`}
          className="px-3 py-2 border border-border rounded-md hover:bg-muted transition"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}

/* ================= ORDER DETAIL COMPONENT ================= */

function OrderDetail({ token }) {
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderByToken = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://http://localhost:8001/api';
        const accessToken = localStorage.getItem('token');
        
        const response = await fetch(`${apiBaseUrl}/order/recent/${token}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        if (data.success && (data.order || data.data)) {
          setOrderData(data.order || data.data);
        }
      } catch (error) {
        console.error('❌ Error fetching order details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderByToken();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12 flex justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">We could not find the details for this order.</p>
          <Link href="/orders" className="bg-primary text-primary-foreground px-6 py-2 rounded-xl">Back to Orders</Link>
        </main>
      </div>
    );
  }

  const orderNumber = orderData.orderNumber || token;
  const status = statusConfig[orderData.orderStatus?.toUpperCase()] || statusConfig.PENDING;
  
  const deliveryAddress = orderData.deliveryAddress?.addressLine1 
    ? `${orderData.deliveryAddress.addressLine1}${orderData.deliveryAddress.addressLine2 ? ', ' + orderData.deliveryAddress.addressLine2 : ''}`
    : orderData.deliveryAddressId?.addressLine1 
    ? `${orderData.deliveryAddressId.addressLine1}${orderData.deliveryAddressId.addressLine2 ? ', ' + orderData.deliveryAddressId.addressLine2 : ''}`
    : "Address will be confirmed shortly";
  const city = orderData.deliveryAddress?.city || orderData.deliveryAddressId?.city || "";
  const state = orderData.deliveryAddress?.state || orderData.deliveryAddressId?.state || "";
  const pincode = orderData.deliveryAddress?.pincode || orderData.deliveryAddressId?.pincode || "";
  const fullAddress = deliveryAddress + (city ? `, ${city}` : '') + (state ? `, ${state}` : '') + (pincode ? ` - ${pincode}` : '');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-lg">
        <Link href="/orders" className="flex items-center gap-2 text-muted-foreground mb-6 hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Order Details</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.className}`}>
            {status.label}
          </span>
        </div>

        {/* Order Info */}
        <div className="rounded-xl bg-background p-6 text-left mb-6 shadow border border-border">
          <div className="flex justify-between mb-4 pb-4 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-bold text-lg">{orderNumber}</p>
            </div>
            <Package className="w-8 h-8 text-primary" />
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date Placed</p>
                <p className="font-medium">{new Date(orderData.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Address</p>
                <p className="font-medium text-sm">{fullAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        {orderData.items && orderData.items.length > 0 && (
          <div className="rounded-xl bg-background p-6 text-left mb-6 shadow border border-border">
            <h2 className="font-bold text-lg mb-4 pb-2 border-b border-border">Items</h2>
            <div className="space-y-4">
              {orderData.items.map((item) => (
                <div key={item._id || item.productId} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity} × ₹{item.price?.toFixed(2) || item.price}</p>
                  </div>
                  <p className="font-semibold">₹{item.totalPrice?.toFixed(2) || item.totalPrice}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <p>Subtotal</p>
                <p>₹{orderData.subtotal?.toFixed(2) || 0}</p>
              </div>
              {(orderData.taxAmount > 0) && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <p>Tax</p>
                  <p>₹{orderData.taxAmount?.toFixed(2)}</p>
                </div>
              )}
              <div className="flex justify-between text-sm text-muted-foreground">
                <p>Delivery Fee</p>
                <p>{orderData.deliveryCharge > 0 ? `₹${orderData.deliveryCharge.toFixed(2)}` : 'Free'}</p>
              </div>
              {(orderData.discountAmount > 0) && (
                <div className="flex justify-between text-sm text-green-600">
                  <p>Discount</p>
                  <p>-₹{orderData.discountAmount?.toFixed(2)}</p>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t border-border text-lg mt-2">
                <p>Total</p>
                <p className="text-primary">₹{orderData.totalAmount?.toFixed(2) || 0}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ================= MAIN PAGE ================= */

let lastGlobalFetchTime = 0;

export default function OrdersPage({ token }) {
  if (token) {
    return <OrderDetail token={token} />;
  }

  const [activeTab, setActiveTab] = useState("recent");
  const [recentOrders, setRecentOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    const now = Date.now();
    if (now - lastGlobalFetchTime < 2000) {
      console.log('⏳ Throttled fetchOrders to prevent loop');
      return;
    }
    lastGlobalFetchTime = now;

    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem('token');
      
      if (!accessToken) {
        console.log('⚠️ No auth token found');
        setIsLoading(false);
        return;
      }

      // Get userId from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.log('⚠️ No user data found');
        setIsLoading(false);
        return;
      }        

      const user = JSON.parse(userStr);
      console.log('👤 User data:', user);
      const userId = user._id || user.id;
      
      if (!userId) {
        console.log('⚠️ No user ID found');
        setIsLoading(false);
        return;
      }

      console.log('📤 Fetching categorized orders for user:', userId);
      
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';
      
      const response = await fetch(`${apiBaseUrl}/order/categorized/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('📥 Categorized orders response:', data);
      
      if (data.success && data.data) {
        setRecentOrders(data.data.recent || []);
        setHistoryOrders(data.data.history || []);
      }
    } catch (error) {
      console.error('❌ Error fetching categorized orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch categorized orders
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Socket Connection for Real-time tracking
  useEffect(() => {
    const accessToken = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (accessToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        const userId = user._id || user.id;
        
        if (userId) {
          // Connect to socket and join room
          const socket = socketService.connect(accessToken);
          if (socket) {
            socket.emit('join', userId);
            
            let debounceTimer;
            // Listen for order status updates
            const handleOrderStatusUpdate = (data) => {
              console.log('📦 Order Status Update received via Socket:', data);
              
              // Debounce toast and fetchOrders to prevent infinite loops if backend is spamming
              clearTimeout(debounceTimer);
              debounceTimer = setTimeout(() => {
                toast.success(`Order ${data.orderId || ''} status updated to ${data.status}`);
                fetchOrders();
              }, 2000);
            };
            
            socketService.on('order-status-update', handleOrderStatusUpdate);
            
            return () => {
              socketService.off('order-status-update', handleOrderStatusUpdate);
              clearTimeout(debounceTimer);
            };
          }
        }
      } catch (error) {
        console.error('Socket initialization error:', error);
      }
    }
    }, [fetchOrders]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        
        {/* Back */}
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground mb-6 hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-2xl font-bold mb-6">
          My Orders
        </h1>

        {/* Tabs */}
        <div className="flex mb-6 border border-border rounded-lg overflow-hidden">
          
          <button
            onClick={() => setActiveTab("recent")}
            className={`flex-1 py-2 font-medium ${
              activeTab === "recent"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            Recent ({recentOrders.length})
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2 font-medium ${
              activeTab === "history"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            History ({historyOrders.length})
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {activeTab === "recent" &&
              (recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <OrderCard key={order._id || order.orderNumber} order={order} />
                ))
              ) : (
                <EmptyState />
              ))}

            {activeTab === "history" &&
              (historyOrders.length > 0 ? (
                historyOrders.map((order) => (
                  <OrderCard key={order._id || order.orderNumber} order={order} />
                ))
              ) : (
                <EmptyState />
              ))}

          </div>
        )}
      </main>
    </div>
  );
}

/* ================= EMPTY ================= */

function EmptyState() {
  return (
    <div className="text-center py-16 bg-background rounded-xl border border-border border-dashed">
      <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />

      <h3 className="font-semibold text-lg mb-2">
        No orders found
      </h3>

      <p className="text-muted-foreground mb-6">
        You haven't placed any orders in this category yet.
      </p>

      <Link
        href="/"
        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition"
      >
        Start Shopping
      </Link>
    </div>
  );
}