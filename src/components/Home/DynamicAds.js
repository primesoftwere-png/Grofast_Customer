"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DynamicAds({ ad }) {
  if (!ad) return null;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-product.svg';
    if (imagePath.startsWith('http')) return imagePath;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiBase.replace('/api', '');
    return `${baseUrl}/uploads/${imagePath}`;
  };

  const content = (
    <>
      <img
        src={getImageUrl(ad.image)}
        alt={ad.title || "Advertisement"}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

      <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-center">
        <div className="inline-flex items-center gap-1 bg-primary rounded-full px-2 py-0.5 sm:px-3 sm:py-1 w-fit mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-semibold text-primary-foreground uppercase tracking-wider">
            Sponsored
          </span>
        </div>

        <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-4 max-w-[80%] sm:max-w-sm drop-shadow-md line-clamp-2">
          {ad.title}
        </h3>

        {ad.targetUrl && (
          <div className="flex items-center gap-1 sm:gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl w-fit text-sm sm:text-base font-semibold hover:opacity-90 transition shadow-lg mt-1">
            View Now <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
        )}
      </div>
    </>
  );

  const wrapperClass = "relative overflow-hidden rounded-xl sm:rounded-2xl animate-fade-in group w-full h-[150px] sm:h-[200px] md:h-[240px] lg:h-[260px] shadow-md block";

  if (ad.targetUrl) {
    return (
      <Link href={ad.targetUrl} className={wrapperClass}>
        {content}
      </Link>
    );
  }

  return (
    <div className={wrapperClass}>
      {content}
    </div>
  );
}
