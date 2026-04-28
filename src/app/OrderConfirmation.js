"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, MapPin, Clock, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";

export default function OrderConfirmation() {
  const { items, totalPrice, clearCart } = useCart();

  const [showCheck, setShowCheck] = useState(false);

  const orderNumber = `DM${Date.now().toString().slice(-8)}`;
  const estimatedTime = "25-35 min";

  useEffect(() => {
    const timer = setTimeout(() => setShowCheck(true), 100);

    const clearTimer = setTimeout(() => {
      clearCart();
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(clearTimer);
    };
  }, [clearCart]);

  // ================= EMPTY CART (CONFIRMATION UI) =================
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            
            {/* Check Animation */}
            <div
              className={`w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8 transition-transform duration-500 ${
                showCheck ? "scale-100" : "scale-0"
              }`}
            >
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
                <Check
                  className="w-12 h-12 text-primary-foreground"
                  strokeWidth={3}
                />
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-2">
              Order Confirmed!
            </h1>

            <p className="text-muted-foreground mb-8">
              Your order has been placed successfully
            </p>

            {/* Order Info */}
            <div className="rounded-xl bg-background p-6 text-left mb-6 shadow">
              
              <div className="flex justify-between mb-4 pb-4 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Order Number
                  </p>
                  <p className="font-bold text-lg">
                    {orderNumber}
                  </p>
                </div>

                <Package className="w-8 h-8 text-primary" />
              </div>

              <div className="space-y-4">
                
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Estimated Delivery
                    </p>
                    <p className="font-medium">
                      {estimatedTime}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Delivery Address
                    </p>
                    <p className="font-medium">
                      123 Main Street, Apt 4B, NYC
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              
              <Link
                href="/tracking"
                className="bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-center"
              >
                Track My Order Live
              </Link>

              <Link
                href="/"
                className="border border-border py-3 rounded-xl text-center"
              >
                Continue Shopping
              </Link>

            </div>
          </div>
        </main>
      </div>
    );
  }

  // ================= LOADING STATE =================
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center p-8">
        
        <div
          className={`w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8 transition-transform duration-500 ${
            showCheck ? "scale-100" : "scale-0"
          }`}
        >
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
            <Check
              className="w-12 h-12 text-primary-foreground"
              strokeWidth={3}
            />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">
          Placing your order...
        </h1>

        <p className="text-muted-foreground">
          Please wait
        </p>
      </div>
    </div>
  );
}