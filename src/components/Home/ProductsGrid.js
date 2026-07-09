"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { productAPI } from "@/services";
import ProductCard from "@/components/Product/ProductCard";
import ProductCardSkeleton from "@/components/common/ProductCardSkeleton";

export default function ProductsGrid({
  selectedCategory,
  searchQuery,
}) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const params = {
        page: currentPage,
        limit: 20
      };
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      
      const response = await productAPI.getAll(params);

      if (response.success && response.data) {
        // Handle both response formats: data.products or data as array
        const productsData = Array.isArray(response.data) ? response.data : (response.data.products || []);
        setProducts(productsData);
        setTotalPages(response.pagination?.totalPages || response.data.pagination?.total_pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      // Use fallback data from local file
      import('@/data/products').then((module) => {
        let filtered = module.products;
        
        if (selectedCategory) {
          filtered = filtered.filter(p => p.category === selectedCategory);
        }
        
        if (searchQuery) {
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        setProducts(filtered);
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (isLoading) {
    return (
      <section id="products" className="py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">
              {selectedCategory ? selectedCategory : "All Products"}
            </h2>
            <p className="text-sm text-muted-foreground">Loading items...</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">
            {selectedCategory ? selectedCategory : "All Products"}
          </h2>

          <p className="text-sm text-muted-foreground">
            {products.length} items available
          </p>
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          
          {products.map((product, index) => (
            <ProductCard key={`${product.id || product._id}-${index}`} product={product} />
          ))}

        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-2xl mb-2">🔍</p>
          <h3 className="font-medium text-lg mb-1">
            No products found
          </h3>
          <p className="text-muted-foreground text-sm">
            Try a different search or category
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}