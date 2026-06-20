"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Search,
  ChevronRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import axios from "axios";
import toast from "react-hot-toast";

// Dynamically import the map component to avoid SSR issues
const ShopsMap = dynamic(() => import("@/components/map/ShopsMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted rounded-2xl flex items-center justify-center border border-border">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  ),
});

export default function NearbyShops() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState("all"); // all | open
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    // 1. Get User Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          fetchShops(loc.lat, loc.lng);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError("Could not get your location. Showing all shops.");
          fetchShops(); // Fetch without location
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      fetchShops();
    }
  }, []);

  const fetchShops = async (lat, lng) => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      
      let url = `${baseUrl}/customer/nearby-shops`;
      if (lat && lng) {
        url += `?lat=${lat}&lng=${lng}&maxDistance=10`;
      }
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        setShops(response.data.data);
      } else {
        toast.error("Failed to load nearby shops");
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter((shop) => {
    const searchLower = searchQuery.toLowerCase();
    
    const matchesSearch =
      shop.shopName?.toLowerCase().includes(searchLower) ||
      shop.businessType?.toLowerCase().includes(searchLower) ||
      (shop.tags && shop.tags.some(tag => tag.toLowerCase().includes(searchLower)));

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
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nearby Shops</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> 
              {loading ? "Discovering shops..." : `${filteredShops.length} shops found around you`}
            </p>
            {locationError && (
              <p className="text-amber-500 text-xs mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {locationError}
              </p>
            )}
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by shop name or category (e.g., grocery, pharmacy)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setFilterOpen("all")}
              className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                filterOpen === "all"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              All Shops
            </button>

            <button
              onClick={() => setFilterOpen("open")}
              className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                filterOpen === "open"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              Open Now
            </button>
          </div>
        </div>

        {/* Map Preview */}
        <div className="w-full h-[350px] mb-8 rounded-2xl shadow-sm border border-border/50">
          <ShopsMap shops={filteredShops} userLocation={userLocation} />
        </div>

        {/* Shops List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground font-medium">Finding nearby shops...</p>
            </div>
          ) : (
            <>
              {filteredShops.map((shop, index) => (
                <Link
                  key={shop._id}
                  href={`/shop/${shop._id}`}
                  className="rounded-xl bg-card border border-border p-4 flex gap-5 hover:shadow-lg hover:border-primary/30 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  
                  {/* Image */}
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-muted">
                    {shop.shopImage ? (
                      <img
                        src={shop.shopImage}
                        alt={shop.shopName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150?text=Shop';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                        <MapPin className="w-8 h-8 text-muted-foreground opacity-50" />
                      </div>
                    )}

                    {!shop.isOpen && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-xs font-bold text-destructive border border-destructive/50 px-2 py-1 rounded-md bg-background/50">CLOSED</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{shop.shopName}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1 max-w-[90%] mt-0.5">{shop.shopAddress}</p>

                        {/* Shopkeeper Details */}
                        {shop.shopkeeperId && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-muted border border-border">
                              {shop.shopkeeperId.profileImage ? (
                                <img src={shop.shopkeeperId.profileImage} alt={shop.shopkeeperId.fullname} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-[10px] font-bold">
                                  {shop.shopkeeperId.fullname?.charAt(0) || 'S'}
                                </div>
                              )}
                            </div>
                            <span className="text-xs font-medium text-foreground">{shop.shopkeeperId.fullname}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-foreground mt-2">
                          <div className="flex items-center gap-1 bg-yellow-bright/10 text-yellow-bright px-1.5 py-0.5 rounded-md font-medium text-xs">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {shop.rating || "New"}
                          </div>
                          <span className="text-muted-foreground text-xs">• {shop.totalReviews || 0} reviews</span>
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-3 text-sm font-medium">
                      {shop.distance !== undefined && (
                        <span className="flex items-center gap-1.5 text-primary">
                          <MapPin className="w-4 h-4" />
                          {shop.distance} km
                        </span>
                      )}

                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {shop.openingTime || '09:00'} - {shop.closingTime || '21:00'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2.5 py-1 bg-secondary text-secondary-foreground text-xs rounded-md font-medium capitalize">
                        {shop.businessType}
                      </span>
                      {shop.tags && shop.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-muted text-muted-foreground text-xs rounded-md capitalize"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                  </div>
                </Link>
              ))}

              {/* Empty State */}
              {filteredShops.length === 0 && (
                <div className="text-center py-16 bg-card border border-border rounded-xl">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    No shops found
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We couldn't find any shops matching your criteria. Try adjusting your search or filters.
                  </p>
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setFilterOpen("all");
                    }}
                    className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}