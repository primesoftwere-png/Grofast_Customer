"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  Package,
  Check,
  Bike,
  Store,
  Truck,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function OrderTracking() {
  const [currentStep, setCurrentStep] = useState(2);

  const steps = [
    {
      id: 1,
      label: "Ordered",
      description: "Order confirmed",
      icon: Check,
      time: "10:30 AM",
    },
    {
      id: 2,
      label: "Shipped",
      description: "Picked from shop",
      icon: Store,
      time: "10:45 AM",
    },
    {
      id: 3,
      label: "Out for Delivery",
      description: "On the way",
      icon: Truck,
      time: "Est. 11:00 AM",
    },
    {
      id: 4,
      label: "Delivered",
      description: "Enjoy your order!",
      icon: Package,
      time: "Est. 11:15 AM",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 5000);

    return () => clearInterval(timer);
  }, []);

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

        {/* Map */}
        <div className="relative rounded-3xl overflow-hidden bg-muted h-64 md:h-80 mb-6 shadow">
          
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/20" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full max-w-md h-full">
              
              {/* Shop */}
              <div className="absolute top-1/4 left-1/4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center animate-pulse">
                  <Store className="text-white w-5 h-5" />
                </div>
              </div>

              {/* Rider */}
              <div className="absolute top-1/2 left-1/2">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center animate-bounce">
                  <Bike className="text-white w-6 h-6" />
                </div>
              </div>

              {/* Destination */}
              <div className="absolute bottom-1/4 right-1/4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <MapPin className="text-white w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Rider Card */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white/90 rounded-xl p-4 flex justify-between items-center">
              
              <div className="flex gap-3 items-center">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold">John D.</p>
                  <p className="text-sm text-primary">
                    On the way • 10 min away
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-2 bg-secondary rounded-full">
                  <Phone />
                </button>

                <Link href="/chat/delivery/d1">
                  <button className="p-2 bg-secondary rounded-full">
                    <MessageCircle />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-xl bg-background p-6 shadow mb-6">
          
          <h2 className="font-semibold text-lg mb-6">
            Order Status
          </h2>

          <div className="space-y-6">
            {steps.map((step) => {
              const isCompleted = step.id <= currentStep;
              const isCurrent = step.id === currentStep;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex gap-4">
                  
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-primary text-white"
                        : "bg-muted"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1">
                    <p className="font-medium">{step.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  <span className="text-sm text-muted-foreground">
                    {step.time}
                  </span>

                  {isCompleted && step.id < currentStep && (
                    <Check className="text-primary w-5 h-5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Shop */}
        <div className="rounded-xl bg-background p-4 shadow mb-6 flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100"
            className="w-16 h-16 rounded-xl"
          />
          <div className="flex-1">
            <p className="font-medium">Fresh Mart</p>
            <p className="text-sm text-muted-foreground">
              123 Market Street
            </p>
          </div>

          <Link href="/chat/shop/shop1">
            <button className="border px-3 py-2 rounded-md">
              <MessageCircle />
            </button>
          </Link>
        </div>

        {/* Summary */}
        <div className="rounded-xl bg-background p-6 shadow">
          <h2 className="font-semibold text-lg mb-4">
            Order Summary
          </h2>

          <div className="space-y-3">
            
            <div className="flex gap-3">
              <img
                src="https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=60"
                className="w-12 h-12 rounded-lg"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Fresh Apples
                </p>
                <p className="text-xs text-muted-foreground">
                  1 kg × 2
                </p>
              </div>
              <span>$9.98</span>
            </div>

            <div className="border-t pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span>$13.47</span>
            </div>
          </div>
        </div>

        {/* Feedback */}
        {currentStep === 4 && (
          <Link
            href="/feedback"
            className="block mt-6 bg-primary text-white py-3 rounded-xl text-center font-semibold"
          >
            Rate Your Experience
          </Link>
        )}
      </main>
    </div>
  );
}