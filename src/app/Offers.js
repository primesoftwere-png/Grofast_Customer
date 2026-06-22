"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Tag, Copy, Check } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/Product/ProductCard";
import { shopAdvertisementAPI } from "@/services/shopAdvertisement.api";
import { productAPI } from "@/services/product.api";

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState(null);
  const [ads, setAds] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adsRes, productsRes] = await Promise.all([
          shopAdvertisementAPI.getActiveAds().catch(err => ({ success: false, data: [] })),
          productAPI.getAll().catch(err => ({ success: false, data: [] }))
        ]);
        
        if (adsRes && adsRes.success && adsRes.data) {
          setAds(adsRes.data);
        }
        
        if (productsRes && productsRes.success && productsRes.data) {
          const allProducts = Array.isArray(productsRes.data) ? productsRes.data : 
                              (productsRes.data.products || []);
          // You can filter discounted products if there's a field for it
          setProducts(allProducts);
        }
      } catch (error) {
        console.error("Error fetching offers page data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-product.svg';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Clean up the path
    const cleanPath = imagePath.replace(/^[/\\]+/, '');
    
    // Get base URL safely
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiBase.replace(/\/api\/?$/, '');
    
    return `${baseUrl}/${cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`}`;
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
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

        {/* Header */}
        <div className="bg-gradient-to-br from-secondary via-secondary/80 to-primary/20 rounded-3xl p-6 md:p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center shadow-card">
              <Tag className="w-8 h-8 text-primary" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Offers & Deals
              </h1>
              <p className="text-muted-foreground">
                Save big with our exclusive offers
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Coupons / Banners */}
            {ads.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xl font-semibold mb-4">
                  Active Promotions
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {ads.map((offer, index) => (
                    <div
                      key={offer._id || index}
                      className="rounded-xl bg-background overflow-hidden hover:shadow-card-lg transition border border-border"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      
                      {/* Image */}
                      <Link href={offer.targetUrl || "#"} className="block relative h-48 md:h-56">
                        <img
                          src={getImageUrl(offer.image)}
                          alt={offer.title || "Promotion"}
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          {offer.discount && (
                            <span className="px-3 py-1 bg-primary rounded-full text-sm font-bold inline-block mb-2">
                              {offer.discount}
                            </span>
                          )}
                          <h3 className="font-semibold text-xl drop-shadow-md">
                            {offer.title || "Special Offer"}
                          </h3>
                        </div>
                      </Link>

                      {/* Content */}
                      {(offer.description || offer.code) && (
                        <div className="p-4 border-t border-border">
                          {offer.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {offer.description}
                            </p>
                          )}

                          {offer.code && (
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
                                <code className="font-mono font-bold text-sm">
                                  {offer.code}
                                </code>

                                <button
                                  onClick={() => handleCopyCode(offer.code)}
                                  className="text-primary hover:text-green-dark"
                                >
                                  {copiedCode === offer.code ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                              </div>

                              {offer.validUntil && (
                                <span className="text-xs text-muted-foreground">
                                  Valid until {offer.validUntil}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Discounted Products */}
            {products.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">
                  Products on Sale
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {products.map((product, index) => (
                    <div
                      key={product._id || product.id}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {!isLoading && ads.length === 0 && products.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">No active offers available at the moment.</p>
                <p className="text-sm mt-2">Please check back later!</p>
              </div>
            )}
          </>
        )}

      </main>

      <Footer />
    </div>
  );
}