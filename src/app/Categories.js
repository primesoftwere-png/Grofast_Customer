"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { categories, subCategories, products } from "@/data/products";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function CategoriesPage() {
  
  const getProductCount = (categoryName) => {
    return products.filter((p) => p.category === categoryName).length;
  };

  const getSubCategoryCount = (categoryId) => {
    return subCategories.filter((sc) => sc.parentId === categoryId).length;
  };

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

        <h1 className="text-3xl font-bold mb-8">
          All Categories
        </h1>

        <div className="grid gap-6">
          {categories.map((category, index) => {
            const categorySubCategories = subCategories.filter(
              (sc) => sc.parentId === category.id
            );

            return (
              <div
                key={category.id}
                className="rounded-xl bg-background p-6 animate-fade-in hover:shadow-card-lg transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  
                  {/* Icon */}
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-4xl shrink-0">
                    {category.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h2 className="text-xl font-semibold">
                          {category.name}
                        </h2>

                        <p className="text-sm text-muted-foreground">
                          {getProductCount(category.name)} products •{" "}
                          {getSubCategoryCount(category.id)} subcategories
                        </p>
                      </div>

                      <Link
                        href={`/category/${category.name}`}
                        className="flex items-center gap-1 text-primary font-medium hover:underline"
                      >
                        View All <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Subcategories */}
                    <div className="flex flex-wrap gap-2">
                      {categorySubCategories.map((sc) => (
                        <Link
                          key={sc.id}
                          href={`/category/${category.name}?sub=${sc.name}`}
                          className="px-4 py-2 bg-muted rounded-xl text-sm font-medium hover:bg-primary/10 hover:text-primary transition"
                        >
                          {sc.name}
                        </Link>
                      ))}
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}