"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Truck, Gift } from "lucide-react";

export default function AdBanner({ variant }) {
  if (variant === "promo") {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-green-dark to-primary p-6 md:p-8 animate-fade-in">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-background rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-background rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center shrink-0 animate-bounce-gentle">
              <Gift className="w-7 h-7 text-secondary-foreground" />
            </div>

            <div className="text-primary-foreground">
              <p className="text-xs font-medium opacity-80 uppercase tracking-wider">
                Limited Time Offer
              </p>
              <h3 className="text-xl md:text-2xl font-bold">
                Get 50% OFF on First Order!
              </h3>
              <p className="text-sm opacity-80 mt-0.5">
                Use code:{" "}
                <span className="font-bold bg-secondary/30 px-2 py-0.5 rounded">
                  FIRST50
                </span>
              </p>
            </div>
          </div>

          <Link
            href="/offers"
            className="flex items-center gap-2 bg-secondary text-secondary-foreground px-5 py-3 rounded-xl font-bold"
          >
            Claim Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (variant === "delivery") {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-secondary via-secondary/80 to-yellow-soft p-5 md:p-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary" />
            </div>

            <div>
              <h3 className="font-bold text-lg">
                Free Delivery on Orders $30+
              </h3>
              <p className="text-sm text-muted-foreground">
                Fast delivery in 15-30 minutes to your doorstep
              </p>
            </div>
          </div>

          <Link
            href="/categories"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold"
          >
            Order Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (variant === "home-essentials") {
    return (
      <div className="relative overflow-hidden rounded-2xl animate-fade-in">
        <div className="relative h-48 md:h-56">
          <img
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop"
            alt="Home essentials"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />

          <div className="absolute inset-0 p-6 flex flex-col justify-center">
            <div className="inline-flex items-center gap-1 bg-secondary rounded-full px-3 py-1 w-fit mb-3">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold">NEW</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-background mb-1">
              Home & Kitchen Essentials
            </h3>

            <p className="text-background/80 text-sm mb-4 max-w-sm">
              Cleaning supplies, kitchen tools & more. Everything for a spotless home!
            </p>

            <Link
              href="/category/Home & Kitchen"
              className="flex items-center gap-2 bg-secondary text-secondary-foreground px-5 py-3 rounded-xl w-fit font-semibold"
            >
              Shop Essentials <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "trust") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
        {[
          { icon: "🚀", title: "15 Min Delivery", desc: "Super fast" },
          { icon: "✅", title: "Fresh Guarantee", desc: "100% quality" },
          { icon: "💰", title: "Best Prices", desc: "Save more" },
          { icon: "🔒", title: "Secure Payment", desc: "Safe & easy" },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-xl bg-background p-4 text-center hover:shadow-card-lg transition-all hover:-translate-y-0.5"
          >
            <span className="text-2xl mb-2 block">{item.icon}</span>
            <p className="font-semibold text-sm">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    );
  }

  // app-download
  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/15 via-secondary/30 to-primary/10 p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-card-lg">
            <span className="text-2xl font-bold text-primary-foreground">
              D
            </span>
          </div>

          <div>
            <h3 className="font-bold text-lg">
              Download DirectMart App
            </h3>
            <p className="text-sm text-muted-foreground">
              Get exclusive app-only deals & faster checkout
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm">
            App Store
          </button>
          <button className="border border-border px-4 py-2 rounded-md text-sm">
            Google Play
          </button>
        </div>
      </div>
    </div>
  );
}