"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Heart, Share2, Loader2, ArrowLeft, Star, Minus, Plus } from "lucide-react";
import { productAPI, wishlistAPI } from "@/services";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import ProductCard from "@/components/Product/ProductCard";
import toast from "react-hot-toast";

export default function ProductDetails() {
  const params = useParams();
  const id = params.id;

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addItem, decreaseItem, removeItem, getItemQuantity } = useCart();
  const quantity = product ? getItemQuantity(product._id || product.id) : 0;

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  // Fetch product details
  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching product details for ID:', id);
      
      // Fetch product by ID
      const response = await productAPI.getById(id);

      if (response.success && response.data) {
        const productData = response.data;
        
        // Transform API response to match frontend structure
        const transformedProduct = {
          id: productData._id,
          _id: productData._id,
          name: productData.productName,
          productName: productData.productName,
          description: productData.productDescription,
          productDescription: productData.productDescription,
          price: productData.productPrice,
          productPrice: productData.productPrice,
          image: productData.productImage,
          productImage: productData.productImage,
          unit: productData.productUnit,
          productUnit: productData.productUnit,
          rating: productData.productRating || 0,
          productRating: productData.productRating || 0,
          category: productData.productCategory?.categoryName || productData.productCategory,
          productCategory: productData.productCategory,
          stock: productData.productQuantity || 0,
          productQuantity: productData.productQuantity || 0,
          reviews: productData.productReviews || [],
          createdBy: productData.createdBy,
        };

        setProduct(transformedProduct);

        // Fetch related products
        fetchRelatedProducts(transformedProduct.category);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Failed to fetch product:', err);
      setError('Failed to load product details');
      
      // Try to load from local data as fallback
      try {
        const { products } = await import('@/data/products');
        const localProduct = products.find((p) => p.id === id);
        if (localProduct) {
          setProduct(localProduct);
          const related = products
            .filter((p) => p.category === localProduct.category && p.id !== id)
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryName) => {
    try {
      // Fetch products from the same category
      const response = await productAPI.getAll({
        category: categoryName,
        limit: 5
      });

      if (response.success && response.data) {
        const productsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.products || []);
        
        // Filter out current product and limit to 4
        const related = productsData
          .filter(p => (p._id || p.id) !== id)
          .slice(0, 4);
        
        setRelatedProducts(related);
      }
    } catch (err) {
      console.error('Failed to fetch related products:', err);
    }
  };

  // Check wishlist status
  useEffect(() => {
    const checkWishlist = async () => {
      const userStr = localStorage.getItem("user");
      if (userStr && product) {
        try {
          const user = JSON.parse(userStr);
          const userId = user._id || user.id;
          const productId = product._id || product.id;
          
          const res = await wishlistAPI.checkWishlist(userId, productId);
          if (res.success && res.data) {
            setIsWishlisted(res.data.isWishlisted || res.data === true);
          } else if (res.success === undefined) {
             // If backend returns true/false directly
             setIsWishlisted(!!res);
          } else {
             // Maybe API returns full wishlist
             const wishlistRes = await wishlistAPI.getUserWishlist(userId);
             if (wishlistRes.success && Array.isArray(wishlistRes.data)) {
               const found = wishlistRes.data.some(item => 
                 item.product?._id === productId || item.productId === productId || item._id === productId
               );
               setIsWishlisted(found);
             }
          }
        } catch (error) {
          console.error("Failed to check wishlist status:", error);
        }
      }
    };
    
    checkWishlist();
  }, [product]);

  const toggleWishlist = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      toast.error("Please login to add items to your wishlist");
      return;
    }

    try {
      setIsWishlistLoading(true);
      const user = JSON.parse(userStr);
      const userId = user._id || user.id;
      const productId = product._id || product.id;

      if (isWishlisted) {
        await wishlistAPI.removeFromWishlist({ userId, productId });
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await wishlistAPI.addToWishlist({ userId, productId });
        setIsWishlisted(true);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      toast.error("Failed to update wishlist. Please try again.");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // Get image URL helper
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-product.svg';
    if (imagePath.startsWith('http')) return imagePath;
    
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const baseUrl = apiBase.replace('/api', '');
    return `${baseUrl}/uploads/${imagePath}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {error || 'Product not found'}
          </h1>
          <Link href="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) /
          product.originalPrice) *
          100
      )
    : 0;

  const productId = product._id || product.id;
  const productName = product.productName || product.name;
  const productPrice = product.productPrice || product.price;
  const productImage = product.productImage || product.image;
  const productUnit = product.productUnit || product.unit;
  const productDescription = product.productDescription || product.description;
  const productRating = product.productRating || product.rating || 0;
  const productStock = product.productQuantity || product.stock || 0;
  const productCategory = typeof product.productCategory === 'object' 
    ? product.productCategory?.categoryName 
    : (product.category || product.productCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        
        {/* Back */}
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden bg-muted shadow-lg">
              <img
                src={getImageUrl(productImage)}
                alt={productName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-product.svg';
                }}
              />
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {productRating >= 4 && (
                <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                  Best Seller
                </span>
              )}

              {discount > 0 && (
                <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-semibold">
                  -{discount}% OFF
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button 
                onClick={toggleWishlist}
                disabled={isWishlistLoading}
                className="bg-white p-2 rounded-full shadow hover:shadow-lg transition disabled:opacity-50"
              >
                <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
              </button>
              <button className="bg-white p-2 rounded-full shadow hover:shadow-lg transition">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            
            <p className="text-primary mb-2 font-medium">
              {productCategory}
            </p>

            <h1 className="text-3xl font-bold mb-3">
              {productName}
            </h1>

            {/* Rating */}
            {productRating > 0 && (
              <div className="flex gap-2 mb-4 items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(productRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="font-medium">{productRating.toFixed(1)}</span>
              </div>
            )}

            {/* Price */}
            <div className="flex gap-3 mb-6 items-baseline">
              <span className="text-4xl font-bold">
                ₹{productPrice.toFixed(2)}
              </span>

              {product.originalPrice && (
                <span className="line-through text-muted-foreground text-xl">
                  ₹{product.originalPrice.toFixed(2)}
                </span>
              )}

              <span className="text-muted-foreground">/ {productUnit}</span>
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {productDescription}
            </p>

            {/* Stock */}
            <div className="flex gap-2 mb-8 items-center">
              <div
                className={`w-2 h-2 rounded-full ${
                  productStock > 10
                    ? "bg-green-500"
                    : productStock > 0
                    ? "bg-yellow-400"
                    : "bg-red-500"
                }`}
              />
              <span className="text-sm font-medium">
                {productStock > 10
                  ? "In Stock"
                  : productStock > 0
                  ? `Only ${productStock} left`
                  : "Out of Stock"}
              </span>
            </div>

            {/* Cart */}
            <div className="bg-muted p-6 rounded-2xl space-y-4">
              
              <div className="flex justify-between items-center">
                <span className="font-semibold">Quantity</span>

                <div className="flex gap-3 items-center">
                  
                  <button
                    onClick={() => decreaseItem(productId)}
                    disabled={quantity === 0}
                    className="border border-border p-2 rounded hover:bg-background transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="w-8 text-center font-semibold">{quantity}</span>

                  <button
                    onClick={() => addItem(product)}
                    disabled={productStock === 0 || (productStock > 0 && quantity >= productStock)}
                    className="border border-border p-2 rounded hover:bg-background transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                </div>
              </div>

              {productStock > 0 && quantity >= productStock && (
                <p className="text-sm text-orange-500 text-center font-medium">
                  Maximum stock limit reached ({productStock} items)
                </p>
              )}

              <button
                onClick={() => addItem(product)}
                disabled={productStock === 0 || (productStock > 0 && quantity >= productStock)}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {productStock === 0 
                  ? 'Out of Stock' 
                  : (productStock > 0 && quantity >= productStock)
                    ? 'Max Stock Reached'
                    : `Add to Cart - ₹${(productPrice * Math.max(1, quantity)).toFixed(2)}`}
              </button>

            </div>
          </div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">
              You might also like
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}