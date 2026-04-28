"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Mail,
  Loader2,
  CheckCircle,
  KeyRound,
} from "lucide-react";
import { authAPI } from "@/lib/api";

export default function ForgotPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState("email"); // email | sent | reset
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  // Check if token is in URL (from email link)
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setResetToken(token);
      setStep("reset");
    }
  }, [searchParams]);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);
      
      toast.success(response.message || "Reset link sent to your email!", {
        icon: '📧',
        duration: 4000,
      });
      
      setStep("sent");
    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.error || 'Failed to send reset link';
        toast.error(message);
      } else if (error.request) {
        toast.error('Unable to connect to server. Please check your connection.');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!resetToken) {
      toast.error("Invalid or missing reset token");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.resetPassword(resetToken, newPassword);
      
      toast.success(response.message || "Password reset successfully!", {
        icon: '✅',
      });

      // Redirect to login after 1.5 seconds
      setTimeout(() => {
        router.push("/auth");
      }, 1500);
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.error || 'Failed to reset password';
        toast.error(message);
        
        // If token is invalid or expired, go back to email step
        if (error.response.status === 400 || error.response.status === 401) {
          setTimeout(() => {
            setStep("email");
            setResetToken("");
          }, 2000);
        }
      } else if (error.request) {
        toast.error('Unable to connect to server. Please check your connection.');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ================= SENT SCREEN =================
  if (step === "sent") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/20 via-background to-secondary/30">
        
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/auth"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md text-center">
            
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>

            <h1 className="text-2xl font-bold mb-2">
              Check Your Email
            </h1>

            <p className="text-muted-foreground mb-6">
              Reset link sent to <br />
              <span className="font-medium">{email}</span>
            </p>

            <div className="rounded-xl bg-background p-6 mb-6 shadow-card">
              <p className="text-sm text-muted-foreground mb-4">
                Click the link in your email to reset your password. The link will expire in 1 hour.
              </p>

              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                💡 Didn't receive the email? Check your spam folder or try again.
              </div>
            </div>

            <button
              onClick={() => setStep("email")}
              className="text-sm text-primary hover:underline"
            >
              Try another email
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= RESET SCREEN =================
  if (step === "reset") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/20 via-background to-secondary/30">
        
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/auth"
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-card">
                <KeyRound className="text-white w-8 h-8" />
              </div>

              <h1 className="text-2xl font-bold">
                Create New Password
              </h1>
              <p className="text-muted-foreground mt-2">
                Enter your new password below
              </p>
            </div>

            <form
              onSubmit={handleResetPassword}
              className="rounded-xl bg-background p-6 space-y-4 shadow-card"
            >
              
              <div>
                <label className="text-sm font-medium mb-1 block">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-md flex justify-center gap-2 font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ================= EMAIL SCREEN =================
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/20 via-background to-secondary/30">
      
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/auth"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-card">
              <Mail className="text-white w-8 h-8" />
            </div>

            <h1 className="text-2xl font-bold">
              Forgot Password?
            </h1>

            <p className="text-muted-foreground mt-2">
              Enter your email to receive a reset link
            </p>
          </div>

          <form
            onSubmit={handleSendEmail}
            className="rounded-xl bg-background p-6 shadow-card"
          >
            
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-md flex justify-center gap-2 font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <p className="text-center text-sm mt-4 text-muted-foreground">
              Remember password?{" "}
              <Link href="/auth" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}