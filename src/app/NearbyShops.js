"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Search,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { shops } from "@/data/shops";

export default function NearbyShops() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState("all"); // all | open

  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.categories.some((cat) =>
        cat.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesFilter = filterOpen === "all" || shop.isOpen;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        
        {/* Back */}
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Nearby Shops</h1>
          <p className="text-muted-foreground">
            {filteredShops.length} shops near you
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3 mb-6">
          
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search shops or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 py-2 border border-border rounded-md"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterOpen("all")}
              className={`px-3 py-2 rounded-md text-sm ${
                filterOpen === "all"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border"
              }`}
            >
              All
            </button>

            <button
              onClick={() => setFilterOpen("open")}
              className={`px-3 py-2 rounded-md text-sm ${
                filterOpen === "open"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border"
              }`}
            >
              Open Now
            </button>
          </div>
        </div>

        {/* Map Preview */}
        <div className="relative rounded-2xl overflow-hidden bg-muted h-40 mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/20" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">View on Map</p>
            </div>
          </div>

          {filteredShops.slice(0, 5).map((shop, index) => (
            <div
              key={shop.id}
              className="absolute w-3 h-3 bg-primary rounded-full"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + index * 18}%`,
              }}
            />
          ))}
        </div>

        {/* Shops */}
        <div className="space-y-4">
          {filteredShops.map((shop, index) => (
            <Link
              key={shop.id}
              href={`/shop/${shop.id}`}
              className="rounded-xl bg-background p-4 flex gap-4 hover:shadow-card-lg transition-all"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              
              {/* Image */}
              <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                <img
                  src={shop.image}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />

                {!shop.isOpen && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <span className="text-xs">Closed</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{shop.name}</h3>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Star className="w-4 h-4 fill-yellow-bright text-yellow-bright" />
                      {shop.rating} • {shop.reviewCount} reviews
                    </div>
                  </div>

                  <ChevronRight className="text-muted-foreground" />
                </div>

                <div className="flex gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {shop.distance}
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {shop.deliveryTime}
                  </span>
                </div>

                <div className="flex gap-2 mt-2">
                  {shop.categories.slice(0, 3).map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {cat}
                    </span>
                  ))}
                </div>

              </div>
            </Link>
          ))}
        </div>

        {/* Empty */}
        {filteredShops.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No shops found
            </h3>
            <p className="text-muted-foreground">
              Try different filters
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}