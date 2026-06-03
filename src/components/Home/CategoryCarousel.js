"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { productAPI } from "@/services";
import ProductCard from "@/components/Product/ProductCard";

export default function CategoryCarousel({ categoryName, icon }) {
  const scrollRef = useRef(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategoryProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use the products API with category filter (by category name)
      console.log(`Fetching products for category: ${categoryName}`);
      const response = await productAPI.getAll({
        category: categoryName,
        limit: 8
      });

      console.log('Category products response:', response);

      if (response && (response.success || response.data)) {
        // Handle the response format from your API
        const productsData = response.data 
          ? (Array.isArray(response.data) 
              ? response.data 
              : (response.data.products || []))
          : [];
        
        console.log(`Loaded ${productsData.length} products for ${categoryName}`);
        setCategoryProducts(productsData);
      } else {
        console.warn('Unexpected response format:', response);
        setCategoryProducts([]);
      }
    } catch (error) {
      console.error(`Failed to fetch products for category ${categoryName}:`, error);
      console.error('Error details:', {
        message: error.message,
        categoryName
      });
      
      // Use fallback data
      try {
        const module = await import('@/data/products');
        const filtered = module.products
          .filter((p) => p.category === categoryName)
          .slice(0, 8);
        console.log(`Using fallback data: ${filtered.length} products`);
        setCategoryProducts(filtered);
      } catch (fallbackError) {
        console.error('Failed to load fallback data:', fallbackError);
        setCategoryProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [categoryName]);

  useEffect(() => {
    fetchCategoryProducts();
  }, [fetchCategoryProducts]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;

      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <section className="py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <div>
              <div className="h-5 w-24 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-40 sm:w-44 shrink-0 h-48 bg-muted animate-pulse rounded-2xl"></div>
          ))}
        </div>
      </section>
    );
  }

  if (categoryProducts.length === 0) return null;

  return (
    <section className="py-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>

          <div>
            <h2 className="text-lg font-semibold">
              {categoryName}
            </h2>
            <p className="text-xs text-muted-foreground">
              {categoryProducts.length} products
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          
          <Link
            href={`/category?name=${encodeURIComponent(categoryName)}`}
            className="text-sm text-primary font-medium hover:underline hidden sm:block"
          >
            View All
          </Link>

          {/* Left Button */}
          <button
            onClick={() => scroll("left")}
            className="border border-border rounded-md p-2 hover:bg-muted transition"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Right Button */}
          <button
            onClick={() => scroll("right")}
            className="border border-border rounded-md p-2 hover:bg-muted transition"
            aria-label="Scroll right"
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
        {categoryProducts.map((product) => (
          <div key={product.id || product._id} className="w-40 sm:w-44 shrink-0">
            <ProductCard product={product} />
          </div>
        ))}

        {/* View All Card */}
        <Link
          href={`/category?name=${encodeURIComponent(categoryName)}`}
          className="w-40 sm:w-44 shrink-0 rounded-2xl bg-background flex flex-col items-center justify-center gap-3 min-h-[200px] hover:shadow-card-lg transition-all hover:-translate-y-0.5 group"
        >
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <ChevronRight className="w-6 h-6 text-primary" />
          </div>

          <span className="text-sm font-medium text-primary">
            View All
          </span>
        </Link>
      </div>
    </section>
  );
}