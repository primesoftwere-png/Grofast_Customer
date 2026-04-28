"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  Camera,
  Loader2,
  CheckCircle,
  ThumbsUp,
} from "lucide-react";

export default function Feedback() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [ratings, setRatings] = useState({
    overall: 0,
    delivery: 0,
    packaging: 0,
    quality: 0,
  });

  const [comment, setComment] = useState("");
  const [tip, setTip] = useState(null);

  const tips = [10, 20, 30, 50];

  const handleSubmit = async () => {
    if (ratings.overall === 0) {
      alert("Please rate your experience");
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    setIsSubmitted(true);

    alert("Thanks for feedback!");
  };

  const StarRating = ({ value, onChange, size = "sm" }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} onClick={() => onChange(star)}>
          <Star
            className={`${
              size === "lg" ? "w-10 h-10" : "w-6 h-6"
            } ${
              star <= value
                ? "fill-yellow-bright text-yellow-bright"
                : "text-muted"
            }`}
          />
        </button>
      ))}
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/30 p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>

          <h1 className="text-2xl font-bold mb-2">
            Thank You!
          </h1>

          <p className="text-muted-foreground mb-8">
            Your feedback helps us improve 🚀
          </p>

          <button
            onClick={() => router.push("/")}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/30">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <ThumbsUp className="w-10 h-10 text-primary-foreground" />
          </div>

          <h1 className="text-2xl font-bold">
            Order Delivered!
          </h1>

          <p className="text-muted-foreground">
            How was your experience?
          </p>
        </div>

        {/* Delivery Partner */}
        <div className="rounded-xl bg-background p-4 mb-6 flex gap-4">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
            className="w-14 h-14 rounded-full"
          />

          <div className="flex-1">
            <p className="font-semibold">John D.</p>
            <p className="text-sm text-muted-foreground">
              Delivery Partner
            </p>
          </div>

          <div className="text-right text-sm">
            <p className="text-muted-foreground">#DM12345678</p>
            <p className="text-primary">Delivered in 28 min</p>
          </div>
        </div>

        {/* Overall Rating */}
        <div className="rounded-xl bg-background p-6 mb-6 text-center">
          <h2 className="font-semibold mb-4">
            Rate your experience
          </h2>

          <StarRating
            value={ratings.overall}
            onChange={(v) =>
              setRatings({ ...ratings, overall: v })
            }
            size="lg"
          />
        </div>

        {/* Detailed */}
        <div className="rounded-xl bg-background p-6 mb-6 space-y-4">
          
          {["delivery", "packaging", "quality"].map((key) => (
            <div
              key={key}
              className="flex justify-between items-center"
            >
              <span className="text-muted-foreground capitalize">
                {key}
              </span>

              <StarRating
                value={ratings[key]}
                onChange={(v) =>
                  setRatings({ ...ratings, [key]: v })
                }
              />
            </div>
          ))}
        </div>

        {/* Comment */}
        <div className="rounded-xl bg-background p-6 mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write feedback..."
            className="w-full border border-border p-3 rounded-md"
          />

          <button className="mt-2 flex gap-2 text-sm">
            <Camera /> Add Photo
          </button>
        </div>

        {/* Tip */}
        <div className="rounded-xl bg-secondary/50 p-6 mb-6">
          <h2 className="font-semibold mb-2">
            Tip delivery partner
          </h2>

          <div className="flex gap-2">
            {tips.map((t) => (
              <button
                key={t}
                onClick={() => setTip(tip === t ? null : t)}
                className={`flex-1 py-3 rounded-xl ${
                  tip === t
                    ? "bg-primary text-white"
                    : "bg-background border border-border"
                }`}
              >
                ${t}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold flex justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Feedback"
          )}
        </button>

        <button
          onClick={() => router.push("/")}
          className="w-full mt-3 text-muted-foreground"
        >
          Skip
        </button>
      </div>
    </div>
  );
}