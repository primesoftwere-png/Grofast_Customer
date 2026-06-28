"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Star,
  Camera,
  Loader2,
  CheckCircle,
  ThumbsUp,
  Package,
  ShoppingBag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { orderAPI } from "@/services/order.api";
import { feedbackAPI } from "@/services/feedback.api";
import { API_CONFIG } from "@/config/api.config";

function FeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFetchingOrder, setIsFetchingOrder] = useState(false);
  const [isAlreadyRated, setIsAlreadyRated] = useState(false);

  const [orderDetails, setOrderDetails] = useState(null);

  // Delivery Feedback State
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [packagingRating, setPackagingRating] = useState(0);
  const [deliveryComment, setDeliveryComment] = useState("");
  const [tip, setTip] = useState(null);

  // Product Feedback State
  // { productId: { rating: 5, comment: "" } }
  const [productFeedback, setProductFeedback] = useState({});

  const tips = [10, 20, 30, 50];

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      try {
        setIsFetchingOrder(true);
        const res = await orderAPI.getById(orderId);
        if (res?.data) {
          setOrderDetails(res.data);
          
          const orderFeedback = res.data.feedback || res.data.deliveryFeedback;
          const isRated = res.data.isRated || !!orderFeedback;

          if (isRated) {
            setIsAlreadyRated(true);
            setDeliveryRating(orderFeedback?.rating || orderFeedback?.delivery?.rating || res.data.rating || 0);
            setPackagingRating(orderFeedback?.packaging || orderFeedback?.delivery?.packaging || 0);
            setDeliveryComment(orderFeedback?.comment || orderFeedback?.delivery?.comment || "");
            setTip(orderFeedback?.tip || orderFeedback?.delivery?.tip || null);
          }

          // Initialize product feedback state
          const initialProductFeedback = {};
          res.data.items?.forEach(item => {
            const existingRating = item.rating || item.feedback?.rating || (isRated && orderFeedback?.products?.find(p => p.productId === (item.productId || item._id))?.rating) || 0;
            const existingComment = item.feedback?.comment || (isRated && orderFeedback?.products?.find(p => p.productId === (item.productId || item._id))?.comment) || "";
            initialProductFeedback[item.productId || item._id] = { rating: existingRating, comment: existingComment };
          });
          setProductFeedback(initialProductFeedback);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setIsFetchingOrder(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_CONFIG.BASE_URL.replace('/api', '')}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const displayRider = orderDetails?.deliveryBoyId || orderDetails?.deliveryBoy;
  
  // Mock data for display if no orderId is provided
  const deliveryBoy = displayRider ? {
    name: displayRider.name || displayRider.fullName || displayRider.fullname || "Delivery Partner",
    image: getImageUrl(displayRider.profileImage) || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    id: displayRider._id || displayRider.id || `#${orderId}`,
    time: orderDetails?.deliveryTime || null
  } : {
    name: "John D.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    id: "#DM12345678",
    time: "28 min"
  };

  const products = orderDetails?.items || [
    {
      _id: "p1",
      name: "Fresh Organic Apples",
      image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=100&h=100&fit=crop",
      price: 4.99,
    },
    {
      _id: "p2",
      name: "Whole Wheat Bread",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop",
      price: 2.49,
    }
  ];

  // Initialize mock product feedback if needed
  useEffect(() => {
    if (!orderId && Object.keys(productFeedback).length === 0) {
      const initial = {};
      products.forEach(p => {
        initial[p._id] = { rating: 0, comment: "" };
      });
      setProductFeedback(initial);
    }
  }, [orderId, products, productFeedback]);

  const handleProductRating = (id, rating) => {
    setProductFeedback(prev => ({
      ...prev,
      [id]: { ...prev[id], rating }
    }));
  };

  const handleProductComment = (id, comment) => {
    setProductFeedback(prev => ({
      ...prev,
      [id]: { ...prev[id], comment }
    }));
  };

  const handleSubmit = async () => {
    if (deliveryRating === 0) {
      toast.error("Please rate the delivery experience");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        orderId: orderId || "mock-order-123",
        delivery: {
          rating: deliveryRating,
          packaging: packagingRating,
          comment: deliveryComment,
          tip: tip || 0,
        },
        products: Object.entries(productFeedback).map(([id, fb]) => ({
          productId: id,
          rating: fb.rating,
          comment: fb.comment
        })).filter(p => p.rating > 0)
      };

      await feedbackAPI.submit(payload);
      
      toast.success("Thanks for your feedback!");
      setIsSubmitted(true);
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const StarRating = ({ value, onChange, size = "sm", disabled = false }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button 
          key={star} 
          onClick={() => !disabled && onChange(star)} 
          type="button"
          disabled={disabled}
          className={disabled ? "cursor-default" : "cursor-pointer"}
        >
          <Star
            className={`${
              size === "lg" ? "w-10 h-10" : "w-6 h-6"
            } ${
              star <= value
                ? "fill-yellow-bright text-yellow-bright"
                : "text-muted"
            } transition-colors ${disabled && star <= value ? "opacity-90" : ""}`}
          />
        </button>
      ))}
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/30 p-4">
        <div className="text-center max-w-md bg-background p-8 rounded-3xl shadow-xl border border-primary/10">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>

          <h1 className="text-3xl font-bold mb-3 text-foreground">
            Thank You!
          </h1>

          <p className="text-muted-foreground mb-8 text-lg">
            Your feedback helps us improve and serve you better 🚀
          </p>

          <button
            onClick={() => router.push("/")}
            className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold w-full shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-1"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 pb-12">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <ThumbsUp className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isAlreadyRated ? "Your Feedback" : "Rate Your Experience"}
          </h1>
          <p className="text-muted-foreground">
            We'd love to hear about your order {orderId ? `#${orderId}` : ''}
          </p>
        </div>

        {isFetchingOrder ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Delivery Feedback Section */}
            <div className="bg-background rounded-3xl shadow-sm border border-border overflow-hidden">
              <div className="bg-primary/5 p-4 border-b border-border flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-lg">Delivery Experience</h2>
              </div>
              
              <div className="p-6">
                {/* Delivery Partner */}
                <div className="bg-secondary/20 rounded-2xl p-4 mb-6 flex gap-4 items-center">
                  <img
                    src={deliveryBoy.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"}
                    className="w-16 h-16 rounded-full object-cover border-2 border-background shadow-sm"
                    alt={deliveryBoy.name}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{deliveryBoy.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Delivery Partner
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">{deliveryBoy.id}</p>
                    <p className="text-primary font-medium">{deliveryBoy.time ? `Delivered in ${deliveryBoy.time}` : 'Delivered'}</p>
                  </div>
                </div>

                {/* Overall Rating */}
                <div className="flex flex-col items-center mb-6">
                  <p className="text-muted-foreground mb-3 text-sm font-medium uppercase tracking-wider">Rate Delivery</p>
                  <StarRating
                    value={deliveryRating}
                    onChange={setDeliveryRating}
                    size="lg"
                    disabled={isAlreadyRated}
                  />
                </div>

                {/* Packaging Rating */}
                <div className="flex justify-between items-center mb-6 py-3 border-y border-border">
                  <span className="font-medium">
                    Packaging Quality
                  </span>
                  <StarRating
                    value={packagingRating}
                    onChange={setPackagingRating}
                    disabled={isAlreadyRated}
                  />
                </div>

                {/* Tip */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">
                    Say thanks with a tip
                  </h3>
                  <div className="flex gap-3">
                    {tips.map((t) => (
                      <button
                        key={t}
                        onClick={() => !isAlreadyRated && setTip(tip === t ? null : t)}
                        disabled={isAlreadyRated}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                          tip === t
                            ? "bg-primary text-primary-foreground shadow-md scale-105"
                            : "bg-secondary/30 text-foreground hover:bg-secondary/50"
                        } ${isAlreadyRated ? "opacity-70 cursor-default" : ""}`}
                      >
                        ${t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <textarea
                    value={deliveryComment}
                    onChange={(e) => setDeliveryComment(e.target.value)}
                    disabled={isAlreadyRated}
                    placeholder="Leave a note about the delivery (optional)..."
                    className="w-full bg-secondary/10 border-none p-4 rounded-xl resize-none focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-70"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Products Feedback Section */}
            <div className="bg-background rounded-3xl shadow-sm border border-border overflow-hidden">
              <div className="bg-primary/5 p-4 border-b border-border flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-lg">Product Quality</h2>
              </div>
              
              <div className="p-6 space-y-6">
                {products.length === 0 && (
                  <p className="text-center text-muted-foreground">No products found in this order.</p>
                )}
                
                {products.map((product) => {
                  const id = product.productId || product._id;
                  const fb = productFeedback[id] || { rating: 0, comment: "" };
                  
                  return (
                    <div key={id} className="pb-6 border-b border-border last:border-0 last:pb-0">
                      <div className="flex gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-secondary/20 flex-shrink-0 overflow-hidden border border-border/50">
                          {product.image || product.thumbnail ? (
                            <img 
                              src={product.image || product.thumbnail} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">${product.price}</p>
                          <StarRating
                            value={fb.rating}
                            onChange={(r) => handleProductRating(id, r)}
                            disabled={isAlreadyRated}
                          />
                        </div>
                      </div>
                      
                      {fb.rating > 0 && (
                        <div className="pl-20 animate-in fade-in slide-in-from-top-2 duration-300">
                          <textarea
                            value={fb.comment}
                            onChange={(e) => handleProductComment(id, e.target.value)}
                            disabled={isAlreadyRated}
                            placeholder={`What did you think of the ${product.name}?`}
                            className="w-full text-sm bg-secondary/10 border-none p-3 rounded-xl resize-none focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-70"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 pb-8">
              {!isAlreadyRated && (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-semibold flex justify-center items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Feedback"
                  )}
                </button>
              )}
              
              <button
                onClick={() => router.push("/")}
                className="w-full mt-4 text-muted-foreground hover:text-foreground font-medium transition-colors py-2"
              >
                {isAlreadyRated ? "Back to Home" : "Skip for now"}
              </button>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}

export default function Feedback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <FeedbackContent />
    </Suspense>
  );
}