"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Tag, Copy, Check } from "lucide-react";
import { offers, products } from "@/data/products";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/Product/ProductCard";

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);

    alert("Coupon code copied!");

    setTimeout(() => setCopiedCode(null), 2000);
  };

  const discountedProducts = products.filter(
    (p) => p.originalPrice
  );

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

        {/* Coupons */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">
            Active Coupons
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {offers.map((offer, index) => (
              <div
                key={offer.id}
                className="rounded-xl bg-background overflow-hidden hover:shadow-card-lg transition"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                
                {/* Image */}
                <div className="relative h-40">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />

                  <div className="absolute bottom-4 left-4 text-background">
                    <span className="px-3 py-1 bg-primary rounded-full text-sm font-bold">
                      {offer.discount} OFF
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">
                    {offer.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-3">
                    {offer.description}
                  </p>

                  <div className="flex items-center justify-between">
                    
                    {/* Code */}
                    <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
                      <code className="font-mono font-bold text-sm">
                        {offer.code}
                      </code>

                      <button
                        onClick={() =>
                          handleCopyCode(offer.code)
                        }
                        className="text-primary hover:text-green-dark"
                      >
                        {copiedCode === offer.code ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <span className="text-xs text-muted-foreground">
                      Valid until {offer.validUntil}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Discounted Products */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Products on Sale
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {discountedProducts.map((product, index) => (
              <div
                key={product.id}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}