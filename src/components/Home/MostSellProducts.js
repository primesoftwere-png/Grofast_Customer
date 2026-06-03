"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { productAPI } from "@/services";
import ProductCard from "@/components/Product/ProductCard";

export default function MostSellProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMostSellProducts();
  }, []);

  const fetchMostSellProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productAPI.getAll({ category: 'most_seller_product', limit: 8 });
      
      if (response.success && response.data) {
        // Handle both response formats: data.products or data as array
        const productsData = Array.isArray(response.data) ? response.data : (response.data.products || []);
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Failed to fetch most sell products:', error);
    } finally {
      setIsLoading(false);
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
            Most sell Product
          </h2>
          <p className="text-sm text-muted-foreground">
            Top selling items
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
