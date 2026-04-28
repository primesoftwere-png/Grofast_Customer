"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { offers } from "@/data/products";

export default function OffersCarousel() {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const maxScroll =
          scrollRef.current.scrollWidth -
          scrollRef.current.offsetWidth;

        if (scrollRef.current.scrollLeft >= maxScroll) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
          setCurrentIndex(0);
        } else {
          scroll("right");
          setCurrentIndex((prev) => (prev + 1) % offers.length);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Hot Deals 🔥</h2>

        <div className="flex items-center gap-2">
          
          {/* Dots */}
          <div className="hidden sm:flex gap-1">
            {offers.map((_, index) => (
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
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4"
      >
        {offers.map((offer, index) => (
          <Link
            key={offer.id}
            href="/offers"
            className="shrink-0 w-[85%] sm:w-[45%] lg:w-[30%] snap-start"
          >
            <div
              className="relative rounded-2xl overflow-hidden h-40 md:h-48 group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <img
                src={offer.image}
                alt={offer.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="inline-block px-3 py-1 bg-primary rounded-full text-sm font-bold text-primary-foreground mb-2">
                  {offer.discount} OFF
                </span>

                <h3 className="text-background font-semibold text-lg">
                  {offer.title}
                </h3>

                <p className="text-background/80 text-sm">
                  {offer.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}