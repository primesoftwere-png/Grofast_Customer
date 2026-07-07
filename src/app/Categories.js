"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EcommerceLoader from "@/components/common/EcommerceLoader";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    let cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    if (!cleanUrl.startsWith('uploads/')) {
      cleanUrl = `uploads/${cleanUrl}`;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const serverUrl = baseUrl.replace('/api', '');
    return `${serverUrl}/${cleanUrl}`;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${baseUrl}/categories/structured`);
        const result = await response.json();

        if (result.success && result.data) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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

        <h1 className="text-3xl font-bold mb-8">All Categories</h1>

        {loading ? (
          <EcommerceLoader fullScreen={false} />
        ) : (
          <div className="grid gap-6">
            {categories.map((category, index) => {
              const subCategories = category.subCategories || [];

              return (
                <div
                  key={category._id}
                  className="rounded-xl bg-background p-6 animate-fade-in hover:shadow-card-lg transition-all duration-300 border border-border"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Icon / Image */}
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-4xl shrink-0 overflow-hidden">
                      {category.categoryImage ? (
                        <img src={getImageUrl(category.categoryImage)} alt={category.categoryName} className="w-full h-full object-cover" />
                      ) : (
                        "🛒"
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                        <div>
                          <h2 className="text-xl font-semibold">
                            {category.categoryName}
                          </h2>
                          <p className="text-sm text-muted-foreground mt-1">
                            {subCategories.length} subcategories
                          </p>
                        </div>

                        <Link
                          href={`/category/${category._id}`}
                          className="flex items-center gap-1 text-primary font-medium hover:underline shrink-0"
                        >
                          View All <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>

                      {/* Subcategories */}
                      {subCategories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 md:mt-2">
                          {subCategories.map((sc) => (
                            <Link
                              key={sc._id}
                              href={`/category/${category._id}?sub=${sc._id}`}
                              className="px-4 py-2 bg-muted rounded-xl text-sm font-medium hover:bg-primary/10 hover:text-primary transition"
                            >
                              {sc.categoryName}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {categories.length === 0 && !loading && (
              <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
                No categories found.
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}