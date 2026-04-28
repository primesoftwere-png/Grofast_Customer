"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { customerReviews } from "@/data/products";

export default function CustomerReviews() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;

      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">
            What Our Customers Say
          </h2>
          <p className="text-sm text-muted-foreground">
            Trusted by 10,000+ happy customers
          </p>
        </div>

        <div className="flex items-center gap-2">
          
          {/* Left Button */}
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="border border-border rounded-md p-2 hover:bg-muted transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Right Button */}
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="border border-border rounded-md p-2 hover:bg-muted transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
      >
        {customerReviews.map((review, index) => (
          <div
            key={review.id}
            className="shrink-0 w-72 sm:w-80 rounded-2xl bg-background p-5 relative animate-fade-in hover:shadow-card-lg transition-all hover:-translate-y-0.5"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Quote className="w-8 h-8 text-primary/20 absolute top-4 right-4" />

            {/* User */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={review.avatar}
                alt={review.userName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/20"
              />

              <div>
                <p className="font-semibold text-sm">
                  {review.userName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {review.location} • {review.date}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? "fill-yellow-bright text-yellow-bright"
                      : "text-muted"
                  }`}
                />
              ))}
            </div>

            {/* Comment */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              "{review.comment}"
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}