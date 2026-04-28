"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/Product/ProductCard";

import { shops } from "@/data/shops";
import { products, categories } from "@/data/products";

export default function ShopDetail() {
  const params = useParams();
  const id = params.id;

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const scrollRef = useRef(null);

  const shop = shops.find((s) => s.id === id);

  if (!shop) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">
            Shop not found
          </h1>
          <Link href="/shops" className="text-primary">
            Browse all shops
          </Link>
        </div>
      </div>
    );
  }

  const shopProducts = products.filter((p) =>
    shop.categories.includes(p.category)
  );

  const filteredProducts = selectedCategory
    ? shopProducts.filter((p) => p.category === selectedCategory)
    : shopProducts;

  const scrollCategories = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        
        {/* Back */}
        <Link
          href="/shops"
          className="flex items-center gap-2 text-muted-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shops
        </Link>

        {/* Images */}
        <div className="relative rounded-3xl overflow-hidden mb-6">
          
          <div className="aspect-[21/9] md:aspect-[3/1]">
            <img
              src={shop.images[currentImageIndex]}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Controls */}
          {shop.images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentImageIndex(
                    currentImageIndex === 0
                      ? shop.images.length - 1
                      : currentImageIndex - 1
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full"
              >
                <ChevronLeft />
              </button>

              <button
                onClick={() =>
                  setCurrentImageIndex(
                    currentImageIndex === shop.images.length - 1
                      ? 0
                      : currentImageIndex + 1
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full"
              >
                <ChevronRight />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {shop.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-2 h-2 rounded-full ${
                      i === currentImageIndex
                        ? "bg-white w-6"
                        : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="bg-white p-2 rounded-full">
              <Heart />
            </button>
            <button className="bg-white p-2 rounded-full">
              <Share2 />
            </button>
          </div>

          {/* Status */}
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                shop.isOpen
                  ? "bg-primary text-white"
                  : "bg-muted"
              }`}
            >
              {shop.isOpen ? "Open Now" : "Closed"}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-xl bg-background p-6 mb-6 shadow">
          
          <h1 className="text-2xl font-bold mb-2">
            {shop.name}
          </h1>

          <p className="text-muted-foreground mb-4">
            {shop.description}
          </p>

          <div className="flex flex-wrap gap-4 text-sm mb-4">
            
            <div className="flex items-center gap-1">
              <Star className="fill-yellow-400 text-yellow-400" />
              {shop.rating} ({shop.reviewCount})
            </div>

            <div className="flex items-center gap-1">
              <MapPin />
              {shop.distance}
            </div>

            <div className="flex items-center gap-1">
              <Clock />
              {shop.deliveryTime}
            </div>

          </div>

          {/* Actions */}
          <div className="flex gap-2">
            
            <a
              href={`tel:${shop.phone}`}
              className="border px-4 py-2 rounded-md flex items-center gap-1"
            >
              <Phone /> Call
            </a>

            <Link
              href={`/chat/shop/${shop.id}`}
              className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-1"
            >
              <MessageCircle /> Chat
            </Link>

          </div>

          <div className="mt-4 pt-4 border-t text-sm text-muted-foreground flex gap-2">
            <MapPin /> {shop.address}
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mb-6">
          
          <button onClick={() => scrollCategories("left")}>
            <ChevronLeft />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto"
          >
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full border ${
                !selectedCategory ? "bg-primary text-white" : ""
              }`}
            >
              All
            </button>

            {shop.categories.map((cat) => {
              const category = categories.find(
                (c) => c.name === cat
              );

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full border ${
                    selectedCategory === cat
                      ? "bg-primary text-white"
                      : ""
                  }`}
                >
                  {category?.icon} {cat}
                </button>
              );
            })}
          </div>

          <button onClick={() => scrollCategories("right")}>
            <ChevronRight />
          </button>
        </div>

        {/* Products */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {selectedCategory || "All"} Products (
            {filteredProducts.length})
          </h2>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No products found
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}