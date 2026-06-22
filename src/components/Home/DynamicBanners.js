"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DynamicBanners({ banners }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000); // 5 seconds
    
    return () => clearInterval(interval);
  }, [banners]);

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

  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl mb-4 sm:mb-6 shadow-md w-full aspect-[16/9] sm:aspect-[21/9] max-h-[400px]">
      {banners.map((banner, index) => (
        <div
          key={banner._id || index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {banner.targetUrl ? (
            <Link href={banner.targetUrl} className="block w-full h-full">
              <img
                src={getImageUrl(banner.image)}
                alt={banner.title || 'Advertisement Banner'}
                className="w-full h-full object-cover"
              />
            </Link>
          ) : (
            <img
              src={getImageUrl(banner.image)}
              alt={banner.title || 'Advertisement Banner'}
              className="w-full h-full object-cover"
            />
          )}
          {/* Optional Title Overlay */}
          {banner.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 sm:p-4 md:p-6 text-white flex flex-col justify-end h-1/2">
              <h3 className="text-lg sm:text-xl md:text-3xl font-bold truncate">{banner.title}</h3>
            </div>
          )}
        </div>
      ))}
      
      {/* Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 sm:h-2.5 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-4 sm:w-6' : 'bg-white/50 w-1.5 sm:w-2.5 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
  