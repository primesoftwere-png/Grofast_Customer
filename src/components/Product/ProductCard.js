"use client";

import Link from "next/link";
import { Plus, Minus, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const { addItem, decreaseItem, getItemQuantity } = useCart();

  // Handle product ID - normalize it
  const productId = String(product._id || product.id).trim();
  const quantity = getItemQuantity(productId);
  
  // Stock limit from API
  const stock = product.productQuantity || product.stock || 0;
  const isStockLimitReached = stock > 0 && quantity >= stock;
  const isOutOfStock = stock === 0;


  // Map API fields to component fields
  const productData = {
    id: productId,
    _id: productId,
    name: product.productName || product.name,
    description: product.productDescription || product.description,
    price: product.productPrice || product.price,
    image: product.productImage || product.image,
    unit: product.productUnit || product.unit || product.productQuantity + ' units',
    rating: product.productRating || product.rating,
    category: product.productCategory?.categoryName || product.category?.name || product.category,
  };

  const handleDecrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    decreaseItem(productId);
  };

  const handleIncrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Pass complete product data with all fields
    const completeProduct = {
      ...product,
      _id: productId,
      id: productId,
      productName: productData.name,
      name: productData.name,
      productPrice: productData.price,
      price: productData.price,
      productImage: productData.image,
      image: productData.image,
      productUnit: productData.unit,
      unit: productData.unit,
      productDescription: productData.description,
      description: productData.description,
      productCategory: product.productCategory,
      category: productData.category,
    };
    
    addItem(completeProduct);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-product.svg';
    if (imagePath.startsWith('http')) return imagePath;
    
    let cleanUrl = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    if (!cleanUrl.startsWith('uploads/')) {
      cleanUrl = `uploads/${cleanUrl}`;
    }
    
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiBase.replace('/api', '');
    return `${baseUrl}/${cleanUrl}`;
  };

  const imageUrl = getImageUrl(productData.image);

  return (
    <Link href={`/product/${productId}`} className="block">
      <article className={`group relative bg-card border border-border rounded-xl p-3 transition-all ${isOutOfStock ? 'opacity-60' : 'hover:shadow-card-lg'}`}>
        
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-xl z-20 flex items-center justify-center pointer-events-none">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Best Seller Badge */}
        {productData.rating >= 4 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full z-10">
            Best Seller
          </span>
        )}

        {/* Image */}
        <div className="relative aspect-square mb-3 rounded-xl overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={productData.name}
            className={`w-full h-full object-cover transition-transform duration-300 ${isOutOfStock ? '' : 'group-hover:scale-105'}`}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = '/placeholder-product.svg';
            }}
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          
          {/* Title + Rating */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm leading-tight line-clamp-2">
                {productData.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {productData.unit}
              </p>
            </div>

            {productData.rating > 0 && (
              <div className="flex items-center gap-0.5 text-xs text-muted-foreground shrink-0">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{productData.rating}</span>
              </div>
            )}
          </div>

          {/* Price + Cart */}
          <div className="flex items-center justify-between gap-1 sm:gap-2 mt-auto flex-wrap">
            
            {/* Price */}
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-sm sm:text-base">
                ₹{typeof productData.price === 'number' ? productData.price.toFixed(2) : productData.price}
              </span>
            </div>

            {/* Cart Buttons */}
            {isOutOfStock ? (
              <button
                disabled
                className="bg-muted text-muted-foreground p-1.5 sm:p-2 rounded-md opacity-50 cursor-not-allowed shrink-0"
                aria-label="Out of stock"
              >
                <Plus className="w-4 h-4" />
              </button>
            ) : quantity === 0 ? (
              <button
                onClick={handleIncrease}
                className="bg-primary text-primary-foreground p-1.5 sm:p-2 rounded-md hover:opacity-90 transition shrink-0"
                aria-label={`Add ${productData.name} to cart`}
              >
                <Plus className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                
                <button
                  onClick={handleDecrease}
                  className="bg-muted px-1.5 sm:px-2 py-1 rounded-md hover:bg-muted/80"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>

                <span className="w-4 sm:w-6 text-center text-xs sm:text-sm font-semibold">
                  {quantity}
                </span>

                <button
                  onClick={handleIncrease}
                  disabled={isStockLimitReached}
                  className={`px-1.5 sm:px-2 py-1 rounded-md ${isStockLimitReached ? 'bg-muted/50 opacity-50 cursor-not-allowed' : 'bg-muted hover:bg-muted/80'}`}
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}