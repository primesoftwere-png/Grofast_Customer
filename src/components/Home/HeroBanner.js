import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Tag } from "lucide-react";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden">
      
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/30 rounded-3xl p-6 md:p-8 mb-4">
        <div className="flex flex-col md:flex-row items-center gap-6">
          
          {/* Left Content */}
          <div className="flex-1 text-center md:text-left">
            
            <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-1.5 mb-4 animate-pulse-slow">
              <Zap className="w-4 h-4 text-yellow-bright" />
              <span className="text-sm font-medium">Express Delivery</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
              Fresh Groceries <br />
              <span className="text-primary">Delivered in Minutes</span>
            </h1>

            <p className="text-muted-foreground mb-6 max-w-md">
              Get fresh produce, dairy, and essentials delivered right to your doorstep. Quality guaranteed!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              
              {/* Shop Now Button */}
              <Link
                href="/categories"
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-lg hover:opacity-90 transition"
              >
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>

              {/* Offers Button */}
              <Link
                href="/offers"
                className="flex items-center justify-center gap-2 border-2 border-primary text-primary px-6 py-3 rounded-xl font-semibold text-lg hover:bg-primary hover:text-primary-foreground transition"
              >
                <Tag className="w-5 h-5" />
                View Offers
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1 relative">
            <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
              
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />

              <Image
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop"
                alt="Fresh groceries basket"
                fill
                priority
                className="relative z-10 object-cover rounded-3xl shadow-card-lg animate-bounce-gentle"
                sizes="(max-width: 768px) 256px, 320px"
              />

              {/* Left floating card */}
              <div className="absolute -left-4 top-1/4 bg-background rounded-2xl shadow-card-lg p-3 animate-slide-up z-20">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🍎</span>
                  <div>
                    <p className="text-xs text-muted-foreground">Fresh Fruits</p>
                    <p className="font-semibold text-sm">50+ Items</p>
                  </div>
                </div>
              </div>

              {/* Right floating card */}
              <div
                className="absolute -right-4 bottom-1/4 bg-background rounded-2xl shadow-card-lg p-3 animate-slide-up z-20"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥬</span>
                  <div>
                    <p className="text-xs text-muted-foreground">Organic</p>
                    <p className="font-semibold text-sm">100% Fresh</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="bg-secondary rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🏪</span>
          </div>

          <div>
            <h3 className="font-semibold text-lg">
              Partner with Local Shops
            </h3>
            <p className="text-sm text-muted-foreground">
              Support your neighborhood stores
            </p>
          </div>
        </div>

        <Link
          href="/categories"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition"
        >
          Explore Shops
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}