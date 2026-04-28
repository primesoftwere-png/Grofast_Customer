"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Clock,
  RotateCcw,
  FileText,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";

/* ================= MOCK DATA ================= */

const mockOrders = [
  {
    id: "1",
    orderNumber: "DM12345678",
    date: "Dec 7, 2024",
    status: "on-the-way",
    total: 34.99,
    items: [
      {
        name: "Fresh Apples",
        quantity: 2,
        image:
          "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=60&h=60&fit=crop",
      },
      {
        name: "Organic Milk",
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=60&h=60&fit=crop",
      },
    ],
  },
  {
    id: "2",
    orderNumber: "DM12345677",
    date: "Dec 5, 2024",
    status: "delivered",
    total: 52.47,
    items: [
      {
        name: "Sourdough Bread",
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=60&h=60&fit=crop",
      },
      {
        name: "Greek Yogurt",
        quantity: 2,
        image:
          "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=60&h=60&fit=crop",
      },
    ],
  },
];

/* ================= STATUS CONFIG ================= */

const statusConfig = {
  delivered: {
    label: "Delivered",
    className: "bg-primary/15 text-green-dark",
  },
  "on-the-way": {
    label: "On the Way",
    className: "bg-secondary text-secondary-foreground",
  },
  preparing: {
    label: "Preparing",
    className: "bg-muted text-muted-foreground",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-destructive/15 text-destructive",
  },
};

/* ================= ORDER CARD ================= */

function OrderCard({ order }) {
  const status = statusConfig[order.status];

  return (
    <article className="rounded-xl bg-background p-4 shadow animate-slide-up">
      
      {/* Header */}
      <div className="flex justify-between mb-3">
        <div>
          <p className="font-semibold">{order.orderNumber}</p>
          <p className="text-sm text-muted-foreground">
            {order.date}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      {/* Items */}
      <div className="flex items-center gap-2 mb-4">
        {order.items.slice(0, 3).map((item, i) => (
          <img
            key={i}
            src={item.image}
            alt={item.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
        ))}

        {order.items.length > 3 && (
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-sm">
            +{order.items.length - 3}
          </div>
        )}

        <div className="flex-1 text-right">
          <p className="font-bold">
            ${order.total.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            {order.items.length} items
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        
        {order.status === "on-the-way" && (
          <Link
            href="/tracking"
            className="flex-1 bg-primary text-white py-2 rounded-md text-center flex items-center justify-center gap-1"
          >
            <Clock className="w-4 h-4" />
            Track
          </Link>
        )}

        {order.status === "delivered" && (
          <>
            <button className="flex-1 bg-primary text-white py-2 rounded-md flex items-center justify-center gap-1">
              <RotateCcw className="w-4 h-4" />
              Reorder
            </button>

            <button className="border border-border px-3 py-2 rounded-md">
              <FileText className="w-4 h-4" />
            </button>
          </>
        )}

        <button className="px-2">
          <ChevronRight />
        </button>
      </div>
    </article>
  );
}

/* ================= MAIN PAGE ================= */

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("recent");

  const currentOrders = mockOrders.filter(
    (o) =>
      o.status === "on-the-way" || o.status === "preparing"
  );

  const pastOrders = mockOrders.filter(
    (o) =>
      o.status === "delivered" || o.status === "cancelled"
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        
        {/* Back */}
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground mb-6"
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
            className={`flex-1 py-2 ${
              activeTab === "recent"
                ? "bg-primary text-white"
                : ""
            }`}
          >
            Recent ({currentOrders.length})
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2 ${
              activeTab === "history"
                ? "bg-primary text-white"
                : ""
            }`}
          >
            History
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          
          {activeTab === "recent" &&
            (currentOrders.length > 0 ? (
              currentOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <EmptyState />
            ))}

          {activeTab === "history" &&
            (pastOrders.length > 0 ? (
              pastOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <EmptyState />
            ))}

        </div>
      </main>
    </div>
  );
}

/* ================= EMPTY ================= */

function EmptyState() {
  return (
    <div className="text-center py-12">
      <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />

      <h3 className="font-medium text-lg mb-2">
        No orders found
      </h3>

      <p className="text-muted-foreground mb-4">
        Start shopping to see your orders
      </p>

      <Link
        href="/"
        className="bg-primary text-white px-6 py-2 rounded-md"
      >
        Start Shopping
      </Link>
    </div>
  );
}