"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { productAPI } from "@/services";
import ProductCard from "@/components/Product/ProductCard";

export default function BestSellers() {
  const scrollRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBestSellers();
  }, []);

  const fetchBestSellers = async () => {
    try {
      setIsLoading(true);
      const response = await productAPI.getBestsellers({ limit: 10 });
      
      if (response.success && response.data) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch best sellers:', error);
      // Use fallback data from local file
      import('@/data/products').then((module) => {
        const bestSellers = module.products.filter(p => p.isBestSeller).slice(0, 10);
        setProducts(bestSellers);
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <section className="py-6">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">
            Mostly Sold
          </h2>
          <p className="text-sm text-muted-foreground">
            Our customers' favorites
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

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
      >
        {products.map((product, index) => (
          <div key={`${product.id || product._id}-${index}`} className="w-44 sm:w-48 shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}