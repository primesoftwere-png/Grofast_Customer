"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { shopAdvertisementAPI } from "@/services/shopAdvertisement.api";

export default function OffersCarousel() {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await shopAdvertisementAPI.getActiveAds();
        if (response.success && response.data) {
          // Filter ads or offers for Hot Deals section
          const adsData = response.data.filter(item => item.type === 'ad' || item.type === 'offer');
          // If filtered is empty but we have data, use all data just in case
          setAds(adsData.length > 0 ? adsData : response.data);
        }
      } catch (error) {
        console.error("Error fetching ads:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAds();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount =
        direction === "left"
          ? -scrollRef.current.offsetWidth
          : scrollRef.current.offsetWidth;

      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Auto scroll
  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const maxScroll =
          scrollRef.current.scrollWidth -
          scrollRef.current.offsetWidth;

        if (scrollRef.current.scrollLeft >= maxScroll - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
          setCurrentIndex(0);
        } else {
          scroll("right");
          setCurrentIndex((prev) => (prev + 1) % ads.length);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [ads.length]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-product.svg';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Clean up the path
    const cleanPath = imagePath.replace(/^[/\\]+/, '');
    
    // Get base URL safely
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiBase.replace(/\/api\/?$/, '');
    
    return `${baseUrl}/${cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`}`;
  };

  if (isLoading) return null;

  if (ads.length === 0) return null;

  return (
    <section className="py-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Hot Deals 🔥</h2>

        {ads.length > 1 && (
          <div className="flex items-center gap-2">
            
            {/* Dots */}
            <div className="hidden sm:flex gap-1">
              {ads.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Left Button */}
            <button
              onClick={() => scroll("left")}
              className="border border-border rounded-md p-2 hover:bg-muted transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Right Button */}
            <button
              onClick={() => scroll("right")}
              className="border border-border rounded-md p-2 hover:bg-muted transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {ads.length === 1 ? (
        /* Single Ad View - Full width */
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden h-48 sm:h-64 md:h-72 w-full group shadow-md block">
          {ads[0].targetUrl ? (
            <Link href={ads[0].targetUrl} className="block w-full h-full">
              <img
                src={getImageUrl(ads[0].image)}
                alt={ads[0].title || "Hot Deal"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </Link>
          ) : (
             <img
                src={getImageUrl(ads[0].image)}
                alt={ads[0].title || "Hot Deal"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 pointer-events-none">
            {ads[0].discount && (
              <span className="inline-block px-3 py-1 bg-primary rounded-full text-xs sm:text-sm font-bold text-primary-foreground mb-2 shadow-sm">
                {ads[0].discount}
              </span>
            )}
            {ads[0].title && (
              <h3 className="text-white font-bold text-xl sm:text-2xl md:text-3xl mb-2 drop-shadow-lg">
                {ads[0].title}
              </h3>
            )}
            {ads[0].description && (
              <p className="text-white/90 text-sm sm:text-base max-w-2xl drop-shadow-md">
                {ads[0].description}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Carousel View */
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4"
        >
          {ads.map((ad, index) => (
            <Link
              key={ad._id || index}
              href={ad.targetUrl || "/offers"}
              className="shrink-0 w-[85%] sm:w-[60%] lg:w-[45%] snap-start"
            >
              <div
                className="relative rounded-2xl overflow-hidden h-48 md:h-56 group animate-fade-in shadow-md"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={getImageUrl(ad.image)}
                  alt={ad.title || "Hot Deal"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  {ad.discount && (
                    <span className="inline-block px-3 py-1 bg-primary rounded-full text-xs font-bold text-primary-foreground mb-2 shadow-sm">
                      {ad.discount}
                    </span>
                  )}

                  <h3 className="text-white font-bold text-lg sm:text-xl drop-shadow-md line-clamp-1">
                    {ad.title || "Special Offer"}
                  </h3>

                  {ad.description && (
                    <p className="text-white/80 text-sm mt-1 line-clamp-1">
                      {ad.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}