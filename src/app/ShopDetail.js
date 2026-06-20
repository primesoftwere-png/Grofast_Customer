"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  Mail,
  User,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/Product/ProductCard";

import { categories as staticCategories } from "@/data/products";

export default function ShopDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [shop, setShop] = useState(null);
  const [shopProducts, setShopProducts] = useState([]);
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
    const fetchShop = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${baseUrl}/customer/shop/${id}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          const data = result.data;
          setShop({
            id: data._id,
            name: data.shopName,
            description: data.description || "A wonderful shop for your daily needs.",
            images: [
              getImageUrl(data.shopImage) || 'https://via.placeholder.com/800x400?text=Shop+Banner', 
              getImageUrl(data.shopBanner) || 'https://via.placeholder.com/800x400?text=Shop+Banner+2'
            ],
            rating: data.rating || 4.5,
            reviewCount: data.totalReviews || 0,
            distance: "1.2 km",
            deliveryTime: "30-45 mins",
            phone: data.shopkeeperId?.phone || data.contactNumber || "+91 9876543210",
            address: `${data.shopAddress || ''}, ${data.city || ''}`,
            categories: data.tags && data.tags.length > 0 ? data.tags : ["Vegetables", "Fruits"],
            isOpen: data.isOpen !== undefined ? data.isOpen : true,
            shopkeeper: data.shopkeeperId && data.shopkeeperId.userId ? {
              id: data.shopkeeperId.userId._id,
              name: data.shopkeeperId.userId.fullname || data.shopkeeperId.ownerName,
              image: getImageUrl(data.shopkeeperId.userId.profileImage) || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.shopkeeperId.userId.fullname || data.shopkeeperId.ownerName || 'S'),
              email: data.shopkeeperId.userId.email,
              phone: data.shopkeeperId.userId.phone
            } : null
          });

          // Fetch products for this shopkeeper (using User ID)
          if (data.shopkeeperId && data.shopkeeperId.userId && data.shopkeeperId.userId._id) {
            const productsRes = await fetch(`${baseUrl}/customer/products?shopkeeperId=${data.shopkeeperId.userId._id}&limit=100`);
            const productsResult = await productsRes.json();
            if (productsResult.success && productsResult.data) {
              setShopProducts(productsResult.data);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching shop:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchShop();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">
            Shop not found
          </h1>
          <Link href="/shops" className="text-primary">
            Browse all shops
          </Link>
        </div>
      </div>
    );
  }

  const uniqueProductCategories = [...new Set(shopProducts.map(p => p.productCategory?.categoryName || p.category).filter(Boolean))];
  const displayCategories = uniqueProductCategories.length > 0 ? uniqueProductCategories : shop.categories;

  const filteredProducts = selectedCategory
    ? shopProducts.filter((p) => (p.productCategory?.categoryName || p.category) === selectedCategory)
    : shopProducts;

  const scrollCategories = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground mb-6 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shops
        </button>

        {/* Images */}
        <div className="relative rounded-3xl overflow-hidden mb-6">
          
          <div className="aspect-[21/9] md:aspect-[3/1]">
            <img
              src={shop.images[currentImageIndex]}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Controls */}
          {shop.images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentImageIndex(
                    currentImageIndex === 0
                      ? shop.images.length - 1
                      : currentImageIndex - 1
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full"
              >
                <ChevronLeft />
              </button>

              <button
                onClick={() =>
                  setCurrentImageIndex(
                    currentImageIndex === shop.images.length - 1
                      ? 0
                      : currentImageIndex + 1
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full"
              >
                <ChevronRight />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {shop.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-2 h-2 rounded-full ${
                      i === currentImageIndex
                        ? "bg-white w-6"
                        : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="bg-white p-2 rounded-full">
              <Heart />
            </button>
            <button className="bg-white p-2 rounded-full">
              <Share2 />
            </button>
          </div>

          {/* Status */}
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                shop.isOpen
                  ? "bg-primary text-white"
                  : "bg-muted"
              }`}
            >
              {shop.isOpen ? "Open Now" : "Closed"}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-xl bg-background p-6 mb-6 shadow">
          
          <h1 className="text-2xl font-bold mb-2">
            {shop.name}
          </h1>

          <p className="text-muted-foreground mb-4">
            {shop.description}
          </p>

          <div className="flex flex-wrap gap-4 text-sm mb-4">
            
            <div className="flex items-center gap-1">
              <Star className="fill-yellow-400 text-yellow-400" />
              {shop.rating} ({shop.reviewCount})
            </div>

            <div className="flex items-center gap-1">
              <MapPin />
              {shop.distance}
            </div>

            <div className="flex items-center gap-1">
              <Clock />
              {shop.deliveryTime}
            </div>

          </div>

          {/* Actions */}
          <div className="flex gap-2">
            
            <a
              href={`tel:${shop.phone}`}
              className="border px-4 py-2 rounded-md flex items-center gap-1"
            >
              <Phone /> Call
            </a>

            <Link
              href={`/chat/shop/${shop.id}`}
              className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-1"
            >
              <MessageCircle /> Chat
            </Link>

          </div>

          <div className="mt-4 pt-4 border-t text-sm text-muted-foreground flex gap-2">
            <MapPin /> {shop.address}
          </div>

          {/* Shopkeeper Details */}
          {shop.shopkeeper && (
            <div className="mt-6 pt-6 border-t flex items-center gap-4">
              <img 
                src={shop.shopkeeper.image} 
                alt={shop.shopkeeper.name || "Shopkeeper"} 
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 shadow-sm"
              />
              <div>
                <h3 className="text-sm font-medium text-primary flex items-center gap-1">
                  <User className="w-4 h-4" /> Shopkeeper
                </h3>
                <p className="text-lg font-semibold mt-1">{shop.shopkeeper.name}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                  {shop.shopkeeper.email && (
                    <a href={`mailto:${shop.shopkeeper.email}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Mail className="w-4 h-4" /> {shop.shopkeeper.email}
                    </a>
                  )}
                  {shop.shopkeeper.phone && (
                    <a href={`tel:${shop.shopkeeper.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Phone className="w-4 h-4" /> {shop.shopkeeper.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mb-6">
          
          <button onClick={() => scrollCategories("left")}>
            <ChevronLeft />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
          >
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex flex-col items-center gap-2 min-w-[80px] p-2 rounded-xl transition-all ${
                !selectedCategory
                  ? "bg-primary/10 shadow-sm"
                  : "hover:bg-muted"
              }`}
            >
              <div className={`w-16 h-16 rounded-full overflow-hidden border-2 flex items-center justify-center bg-secondary text-2xl ${
                !selectedCategory ? "border-primary text-primary" : "border-border text-muted-foreground"
              }`}>
                🌟
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${
                !selectedCategory ? "text-primary font-bold" : "text-muted-foreground"
              }`}>
                All
              </span>
            </button>

            {displayCategories.map((cat) => {
              const category = staticCategories.find(
                (c) => c.name === cat
              );

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex flex-col items-center gap-2 min-w-[80px] p-2 rounded-xl transition-all ${
                    selectedCategory === cat
                      ? "bg-primary/10 shadow-sm"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full overflow-hidden border-2 flex items-center justify-center text-2xl bg-muted ${
                    selectedCategory === cat ? "border-primary" : "border-border"
                  }`}>
                    {category?.image ? (
                      <img src={category.image} alt={cat} className="w-full h-full object-cover" />
                    ) : (
                      category?.icon || "🛒"
                    )}
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap ${
                    selectedCategory === cat ? "text-primary font-bold" : "text-muted-foreground"
                  }`}>
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>

          <button onClick={() => scrollCategories("right")}>
            <ChevronRight />
          </button>
        </div>

        {/* Products */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {selectedCategory || "All"} Products (
            {filteredProducts.length})
          </h2>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredProducts.map((p) => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No products found
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}