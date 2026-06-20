"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import ProductCard from "@/components/Product/ProductCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const categoryId = params.categoryId;
  const initialSubCategory = searchParams.get("sub") || null;

  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(initialSubCategory);
  const [category, setCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const scrollRef = useRef(null);

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
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        
        // Fetch all categories to get current category details and subcategories
        const catRes = await fetch(`${baseUrl}/categories/structured`);
        const catResult = await catRes.json();
        
        if (catResult.success && catResult.data) {
          const currentCat = catResult.data.find(
            c => c._id === categoryId
          );
          
          if (currentCat) {
            setCategory(currentCat);
            setSubCategories(currentCat.subCategories || []);
          }
        }
        
        // Fetch products for the selected category or subcategory
        const filterCategory = selectedSubCategoryId || categoryId;
        const prodRes = await fetch(`${baseUrl}/products?category=${encodeURIComponent(filterCategory)}`);
        const prodResult = await prodRes.json();
        
        if (prodResult.success && prodResult.data) {
          // Adapt the products to match frontend ProductCard expected structure if necessary
          const adaptedProducts = prodResult.data.map(p => ({
            id: p._id,
            name: p.productName,
            price: p.price,
            originalPrice: p.comparePrice,
            image: getImageUrl(p.productImage) || 'https://via.placeholder.com/300?text=Product',
            category: p.productCategory?.categoryName || currentCat?.categoryName || 'Category',
            rating: p.rating || 4.5,
            unit: p.unit || '1 pc',
            description: p.productDescription,
            isBestSeller: false // Could be determined by other fields
          }));
          setProducts(adaptedProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId, selectedSubCategoryId]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 flex justify-center items-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

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
          href="/categories"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/30 rounded-3xl p-6 md:p-8 mb-8 animate-fade-in relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center shadow-card text-4xl overflow-hidden shrink-0">
              {category.categoryImage ? (
                <img src={getImageUrl(category.categoryImage)} alt={category.categoryName} className="w-full h-full object-cover" />
              ) : (
                "🛒"
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                {selectedSubCategoryId ? subCategories.find(s => s._id === selectedSubCategoryId)?.categoryName || category.categoryName : category.categoryName}
              </h1>
              <p className="text-muted-foreground mt-1 font-medium">
                {products.length} products available
              </p>
            </div>
          </div>
          
          {category.categoryImage && (
             <img src={getImageUrl(category.categoryImage)} alt="Background pattern" className="absolute right-0 top-0 w-1/3 h-full object-cover opacity-10 mix-blend-overlay pointer-events-none" />
          )}
        </div>

        {/* Subcategories */}
        {subCategories.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Browse by Type
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={() => scroll("left")}
                  className="border border-border rounded-md p-2 hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => scroll("right")}
                  className="border border-border rounded-md p-2 hover:bg-muted transition-colors"
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
                onClick={() => setSelectedSubCategoryId(null)}
                className={`shrink-0 px-5 py-3 rounded-2xl font-medium transition-all duration-300 ${
                  !selectedSubCategoryId
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-muted text-foreground hover:bg-primary/10"
                }`}
              >
                All {category.categoryName}
              </button>

              {subCategories.map((sc) => (
                <button
                  key={sc._id}
                  onClick={() => setSelectedSubCategoryId(sc._id)}
                  className={`shrink-0 px-5 py-3 rounded-2xl font-medium transition-all duration-300 ${
                    selectedSubCategoryId === sc._id
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "bg-muted text-foreground hover:bg-primary/10"
                  }`}
                >
                  {sc.categoryName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in h-full"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              🔍
            </div>
            <h3 className="font-bold text-xl mb-2 text-foreground">
              No products found
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We couldn't find any products in {selectedSubCategoryId ? 'this subcategory' : 'this category'}. Try exploring other types.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}