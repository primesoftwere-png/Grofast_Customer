"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  Phone,
} from "lucide-react";
import { authAPI } from "@/lib/api";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await authAPI.login(formData.email, formData.password);
        
        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Dispatch custom event for auth change
        window.dispatchEvent(new Event('authChange'));
        
        // Show success toast
        toast.success(`Welcome back, ${response.user.name || 'User'}!`, {
          icon: '👋',
        });
        
        // Redirect to home
        setTimeout(() => {
          router.push("/");
        }, 1000);
        
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          setIsLoading(false);
          return;
        }

        if (!formData.fullname.trim()) {
          toast.error("Full name is required");
          setIsLoading(false);
          return;
        }

        if (!formData.phone.trim()) {
          toast.error("Phone number is required");
          setIsLoading(false);
          return;
        }

        const response = await authAPI.register({
          fullname: formData.fullname,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: 'user', // Customer role
          roleDetails: {},
        });

        // Store token and user data if registration returns them
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Dispatch custom event for auth change
          window.dispatchEvent(new Event('authChange'));
        }

        toast.success("Account created successfully!", {
          icon: '🎉',
        });

        // Redirect based on whether OTP verification is needed
        setTimeout(() => {
          if (response.requiresOTP || response.requiresVerification) {
            router.push("/otp-verification");
          } else {
            router.push("/");
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Auth error:', error);
      
      // Handle different error types
      if (error.response) {
        // Server responded with error
        const message = error.response.data?.message || error.response.data?.error || 'Authentication failed';
        toast.error(message);
      } else if (error.request) {
        // Request made but no response
        toast.error('Unable to connect to server. Please check your connection.');
      } else {
        // Other errors
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/30 flex flex-col">
      
      {/* Back */}
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-card-lg">
              <span className="text-3xl font-bold text-primary-foreground">
                G
              </span>
            </div>

            <h1 className="text-2xl font-bold">
              {isLogin ? "Welcome Back!" : "Create Account"}
            </h1>

            <p className="text-muted-foreground mt-1">
              {isLogin
                ? "Sign in to continue shopping"
                : "Join GroFast for fresh groceries"}
            </p>
          </div>

          {/* Card */}
          <div className="rounded-xl bg-background p-6 animate-slide-up shadow-card">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!isLogin && (
                <>
                  {/* Full Name */}
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={formData.fullname}
                        onChange={(e) =>
                          setFormData({ ...formData, fullname: e.target.value })
                        }
                        className="w-full pl-10 py-2 rounded-md border border-border bg-background"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-sm font-medium">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full pl-10 py-2 rounded-md border border-border"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-10 py-2 rounded-md border border-border"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-10 pr-10 py-2 rounded-md border border-border"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full py-2 px-3 rounded-md border border-border"
                    required
                  />
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-md font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Switch */}
            <p className="text-center mt-6 text-sm text-muted-foreground">
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-medium hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>

            {isLogin && (
              <div className="text-center mt-4">
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
