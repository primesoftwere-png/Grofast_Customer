"use client";

import Link from "next/link";
import { Plus, Minus, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const { addItem, updateQuantity, getItemQuantity } = useCart();

  // Handle product ID - normalize it
  const productId = String(product._id || product.id).trim();
  const quantity = getItemQuantity(productId);
  


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

  const handleAddToCart = (e) => {
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

  const handleUpdateQuantity = (e, newQuantity) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(productId, newQuantity);
  };

  // Handle image URL - construct full URL if needed
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-product.svg';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Construct full URL from API base
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiBase.replace('/api', '');
    return `${baseUrl}/uploads/${imagePath}`;
  };

  const imageUrl = getImageUrl(productData.image);

  return (
    <Link href={`/product/${productId}`} className="block">
      <article className="group relative bg-card border border-border rounded-xl p-3 hover:shadow-card-lg transition-all">
        
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
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
          <div className="flex items-center justify-between gap-2">
            
            {/* Price */}
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base">
                ₹{typeof productData.price === 'number' ? productData.price.toFixed(2) : productData.price}
              </span>
            </div>

            {/* Cart Buttons */}
            {quantity === 0 ? (
              <button
                onClick={handleAddToCart}
                className="bg-primary text-primary-foreground p-2 rounded-md hover:opacity-90 transition"
                aria-label={`Add ${productData.name} to cart`}
              >
                <Plus className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                
                <button
                  onClick={(e) => handleUpdateQuantity(e, quantity - 1)}
                  className="bg-muted px-2 py-1 rounded-md hover:bg-muted/80"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>

                <span className="w-6 text-center text-sm font-semibold">
                  {quantity}
                </span>

                <button
                  onClick={(e) => handleUpdateQuantity(e, quantity + 1)}
                  className="bg-muted px-2 py-1 rounded-md hover:bg-muted/80"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}