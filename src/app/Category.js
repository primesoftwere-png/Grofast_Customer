"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { categories, subCategories, products } from "@/data/products";
import ProductCard from "@/components/Product/ProductCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function CategoryPage() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.categoryName);

  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const scrollRef = useRef(null);

  const category = categories.find((c) => c.name === categoryName);

  const categorySubCategories = subCategories.filter(
    (sc) => sc.parentId === category?.id
  );

  const filteredProducts = products.filter((p) => {
    const matchesCategory = p.category === categoryName;
    const matchesSubCategory =
      !selectedSubCategory || p.subCategory === selectedSubCategory;
    return matchesCategory && matchesSubCategory;
  });

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">
            Category not found
          </h1>
          <Link href="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/30 rounded-3xl p-6 md:p-8 mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center shadow-card text-4xl">
              {category.icon}
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                {category.name}
              </h1>
              <p className="text-muted-foreground">
                {filteredProducts.length} products available
              </p>
            </div>
          </div>
        </div>

        {/* Subcategories */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Browse by Type
            </h2>

            <div className="flex gap-2">
              <button
                onClick={() => scroll("left")}
                className="border border-border rounded-md p-2 hover:bg-muted"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => scroll("right")}
                className="border border-border rounded-md p-2 hover:bg-muted"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
          >
            <button
              onClick={() => setSelectedSubCategory(null)}
              className={`shrink-0 px-5 py-3 rounded-2xl font-medium ${
                !selectedSubCategory
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "bg-muted"
              }`}
            >
              All {category.name}
            </button>

            {categorySubCategories.map((sc) => (
              <button
                key={sc.id}
                onClick={() => setSelectedSubCategory(sc.name)}
                className={`shrink-0 px-5 py-3 rounded-2xl font-medium ${
                  selectedSubCategory === sc.name
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-muted"
                }`}
              >
                {sc.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">🔍</p>
            <h3 className="font-medium text-lg mb-1">
              No products found
            </h3>
            <p className="text-muted-foreground text-sm">
              Try a different subcategory
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}