"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { categoryAPI } from "@/services/category.api";

// Default category icons mapping
const categoryIcons = {
  "Fruits": "🍎",
  "Vegetables": "🥬",
  "Dairy": "🥛",
  "Bakery": "🍞",
  "Beverages": "🥤",
  "Snacks": "🍿",
  "Personal Care": "🧴",
  "Home & Kitchen": "🏠",
  "default": "📦"
};

// Function to get icon for category
const getCategoryIcon = (categoryName) => {
  return categoryIcons[categoryName] || categoryIcons.default;
};

export default function CategoriesGrid({
  selectedCategory,
  onSelectCategory,
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryAPI.getAll();
      
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-muted animate-pulse"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="w-12 h-3 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Shop by Category</h2>
        </div>
        <div className="text-center py-8 text-red-500">{error}</div>
      </section>
    );
  }

  return (
    <section className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Shop by Category
        </h2>

        <Link
          href="/categories"
          className="text-sm text-primary font-medium hover:underline"
        >
          View All
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {categories.map((category, index) => (
          <button
            key={category._id}
            onClick={(e) => {
              e.preventDefault();
              if (selectedCategory === category._id) {
                onSelectCategory(null);
              } else {
                onSelectCategory(category._id);
                // Scroll to products section
                setTimeout(() => {
                  const productsSection = document.getElementById('products');
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }
            }}
            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-background hover:bg-muted transition-all group animate-fade-in ${
              selectedCategory === category._id
                ? "bg-primary/30 ring-2 ring-primary"
                : ""
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-1">
              {category.categoryImage ? (
                <img 
                  src={`http://localhost:8000/uploads/${category.categoryImage}`} 
                  alt={category.categoryName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-2xl md:text-3xl">
                  {getCategoryIcon(category.categoryName)}
                </span>
              )}
            </div>

            <span className="text-xs font-medium text-center leading-tight">
              {category.categoryName}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}