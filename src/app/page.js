"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import HeroBanner from "@/components/Home/HeroBanner";
import CategoriesGrid from "@/components/Home/CategoriesGrid";
import BestSellers from "@/components/Home/BestSellers";
import MostSellProducts from "@/components/Home/MostSellProducts";
import ProductsGrid from "@/components/Home/ProductsGrid";
import OffersCarousel from "@/components/Home/OffersCarousel";
import AdBanner from "@/components/Home/AdBanner";
import CustomerReviews from "@/components/Home/CustomerReviews";
import CategoryCarousel from "@/components/Home/CategoryCarousel";
import Footer from "@/components/layout/Footer";
import DynamicBanners from "@/components/Home/DynamicBanners";
import DynamicAds from "@/components/Home/DynamicAds";
import { categoryAPI } from "@/services/category.api";
import { shopAdvertisementAPI } from "@/services/shopAdvertisement.api";

function HomeContent() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dynamicBanners, setDynamicBanners] = useState([]);
  const [dynamicAds, setDynamicAds] = useState([]);

  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAll();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchAdvertisements = async () => {
      try {
        const response = await shopAdvertisementAPI.getActiveAds();
        if (response.success && response.data) {
          const adsData = response.data;
          setDynamicBanners(adsData.filter(ad => ad.type === 'banner'));
          setDynamicAds(adsData.filter(ad => ad.type === 'ad'));
        }
      } catch (error) {
        console.error("Error fetching advertisements:", error);
      }
    };

    fetchCategories();
    fetchAdvertisements();
  }, []); // ✅ Empty dependency array - only fetch once on mount

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {dynamicBanners.length > 0 && <DynamicBanners banners={dynamicBanners} />}

        <HeroBanner />

        <AdBanner variant="trust" />

        <OffersCarousel />

        <CategoriesGrid
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <MostSellProducts />

        <BestSellers />

        {dynamicAds.length > 2 ? <DynamicAds ad={dynamicAds[2]} /> : <AdBanner variant="promo" />}

        {/* Dynamic Category Carousels - Display products by category */}
        {categories.length > 0 ? (
          categories.map((category, index) => (
            <React.Fragment key={category._id}>
              <CategoryCarousel 
                categoryName={category.categoryName} 
                icon={getCategoryIcon(category.categoryName)}
              />
              
              {/* Add ad banners between categories for better UX */}
              {index === 1 && (dynamicAds.length > 0 ? <DynamicAds ad={dynamicAds[0]} /> : <AdBanner variant="home-essentials" />)}
              {index === 3 && (dynamicAds.length > 1 ? <DynamicAds ad={dynamicAds[1]} /> : <AdBanner variant="delivery" />)}
            </React.Fragment>
          ))
        ) : (
          <>
            {/* Fallback to static categories if API fails */}
            <CategoryCarousel categoryName="Fruits" icon="🍎" />
            <AdBanner variant="home-essentials" />
            <CategoryCarousel categoryName="Vegetables" icon="🥬" />
            <CategoryCarousel categoryName="Dairy" icon="🥛" />
            <AdBanner variant="delivery" />
            <CategoryCarousel categoryName="Bakery" icon="🍞" />
            <CategoryCarousel categoryName="Home & Kitchen" icon="🏠" />
            <CategoryCarousel categoryName="Personal Care" icon="🧴" />
          </>
        )}

        <CustomerReviews />

        <AdBanner variant="app-download" />

        {/* Show filtered products only when category is selected or search is active */}
        {(selectedCategory || searchQuery) && (
          <ProductsGrid
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

// Helper function to get category icons
function getCategoryIcon(categoryName) {
  const icons = {
    "Fruits": "🍎",
    "Vegetables": "🥬",
    "Dairy": "🥛",
    "Bakery": "🍞",
    "Beverages": "🥤",
    "Snacks": "🍿",
    "Personal Care": "🧴",
    "Home & Kitchen": "🏠",
    "Meat & Seafood": "🍖",
    "Frozen Foods": "🧊",
    "default": "📦"
  };
  return icons[categoryName] || icons.default;
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}