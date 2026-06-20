"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  Phone,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { authAPI } from "@/services/auth.api";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState("email"); // "email" or "phone"
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Phone OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/');
    }
  }, [router]);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleLoginSuccess = (response, message) => {
    localStorage.setItem('token', response.data?.token || response.token);
    localStorage.setItem('user', JSON.stringify(response.data?.user || response.user));
    
    window.dispatchEvent(new Event('authChange'));
    
    toast.success(message || `Welcome back!`, {
      icon: '👋',
    });
    
    setTimeout(() => {
      router.push("/");
    }, 1000);
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsGoogleLoading(true);
        // Fetch user profile from Google
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        
        if (!userInfoRes.ok) {
          throw new Error("Failed to fetch Google profile");
        }
        
        const userInfo = await userInfoRes.json();

        // Send required data to our backend
        const res = await authAPI.googleLogin({ 
          email: userInfo.email,
          fullname: userInfo.name,
          googleId: userInfo.sub
        });

        if (res.success || res.token || res.data?.token) {
          handleLoginSuccess(res, "Google Login Successful!");
        } else {
          toast.error("Google login failed on server");
        }
      } catch (error) {
        console.error('Google Auth error:', error);
        toast.error(error.message || "An error occurred during Google authentication");
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error("Google login was unsuccessful");
    }
  });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    if (!isLogin && (!formData.fullname.trim() || !formData.email.trim())) {
      toast.error("Full name and email are required for registration");
      return;
    }

    setIsLoading(true);
    try {
      const payload = { phone: formData.phone };
      if (!isLogin) {
        payload.fullname = formData.fullname;
        payload.email = formData.email;
      }

      const response = await authAPI.sendOTP(payload);
      
      if (response.success || response.data?.success) {
        toast.success("OTP sent successfully to " + formData.phone);
        setOtpSent(true);
      } else {
        toast.error(response.message || response.data?.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.verifyOTP({ phone: formData.phone, otp });
      if (response.success || response.token || response.data?.token) {
        handleLoginSuccess(response, "OTP Verified successfully!");
      } else {
        toast.error(response.message || response.data?.message || "Invalid OTP");
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error(error.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Email Login
        const response = await authAPI.login({ email: formData.email, password: formData.password });
        handleLoginSuccess(response, `Welcome back, ${response.user?.name || response.data?.user?.name || 'User'}!`);
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

        if (!formData.fullname.trim() || !formData.phone.trim()) {
          toast.error("Full name and phone are required");
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

        if (response.token || response.data?.token) {
          localStorage.setItem('token', response.token || response.data?.token);
          localStorage.setItem('user', JSON.stringify(response.user || response.data?.user));
          window.dispatchEvent(new Event('authChange'));
        }

        toast.success("Account created successfully!", { icon: '🎉' });

        setTimeout(() => {
          if (response.requiresOTP || response.requiresVerification || response.data?.requiresOTP) {
            router.push("/otp-verification");
          } else {
            router.push("/");
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Auth error:', error);
      if (error.message) {
        const message = error.message;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/20 flex flex-col relative overflow-hidden">
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-3xl opacity-50 mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-secondary/30 blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-blue-300/20 blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      {/* Back */}
      <div className="container mx-auto px-4 py-4 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-border/50 transition-all hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium text-sm">Back to Home</span>
        </Link>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md">
          
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-16 h-16 bg-gradient-to-tr from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/20 transform transition-transform hover:scale-105">
              <span className="text-3xl font-bold text-primary-foreground">
                G
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>

            <p className="text-muted-foreground mt-2">
              {isLogin
                ? "Sign in to continue shopping"
                : "Join GroFast for fresh groceries"}
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl bg-background/80 backdrop-blur-xl p-8 animate-slide-up shadow-2xl border border-white/20">
            
            {/* Auth Method Tabs */}
            <div className="flex p-1 mb-6 space-x-1 bg-muted/50 rounded-xl">
              <button
                onClick={() => setAuthMethod("email")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  authMethod === "email"
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                Email
              </button>
              <button
                onClick={() => {
                  setAuthMethod("phone");
                  setOtpSent(false);
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  authMethod === "phone"
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                Phone OTP
              </button>
            </div>

            {/* Email / Register Form */}
            {authMethod === "email" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {!isLogin && (
                  <>
                    <div className="animate-fade-in">
                      <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={formData.fullname}
                          onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                          className="w-full pl-10 py-2.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="animate-fade-in">
                      <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Phone Number</label>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-10 py-2.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="animate-fade-in">
                  <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 py-2.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="animate-fade-in">
                  <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="animate-fade-in">
                    <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Confirm Password</label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full pl-10 py-2.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        required
                      />
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="text-right mt-1 mb-4">
                    <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                      Forgot Password?
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
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
            )}

            {/* Phone OTP Login Form */}
            {authMethod === "phone" && (
              <div className="space-y-4 animate-fade-in">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    
                    {!isLogin && (
                      <>
                        <div className="animate-fade-in">
                          <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Full Name</label>
                          <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                              type="text"
                              placeholder="John Doe"
                              value={formData.fullname}
                              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                              className="w-full pl-10 py-2.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              required
                            />
                          </div>
                        </div>

                        <div className="animate-fade-in">
                          <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Email</label>
                          <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                              type="email"
                              placeholder="you@example.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full pl-10 py-2.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Phone Number</label>
                      <div className="relative group">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-10 py-2.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !formData.phone || (!isLogin && (!formData.fullname || !formData.email))}
                      className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin w-5 h-5" />
                          Sending...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4 animate-slide-up">
                    <div>
                      <label className="text-sm font-medium text-foreground/80 mb-1.5 block">
                        Enter 6-digit OTP sent to {formData.phone}
                      </label>
                      <input
                        type="text"
                        maxLength="6"
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center tracking-[0.5em] text-2xl py-3 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp("");
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
                      >
                        Change Number
                      </button>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isLoading}
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        Resend OTP
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || otp.length < 6}
                      className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin w-5 h-5" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Login"
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Social Login Separator */}
            <div className="mt-8 mb-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background/80 text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google Auth Button */}
            <button
              type="button"
              onClick={() => handleGoogleLogin()}
              disabled={isGoogleLoading}
              className="w-full bg-white text-gray-800 border border-gray-200 py-3 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-gray-50 hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {isGoogleLoading ? (
                <Loader2 className="animate-spin w-5 h-5 text-gray-500" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Google
            </button>

            {/* Switch Mode */}
            <p className="text-center mt-8 text-sm text-muted-foreground">
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setOtpSent(false); // Reset OTP state when switching
                }}
                className="text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
