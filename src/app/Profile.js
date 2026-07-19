"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  MapPin,
  CreditCard,
  HelpCircle,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Edit,
  Plus,
  Lock,
  Pencil,
  Settings,
  X,
  Check,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import EcommerceLoader from "@/components/common/EcommerceLoader";
import { authAPI, userAPI } from "@/lib/api";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http") || imagePath.startsWith("blob:")) return imagePath;
    const cleanPath = imagePath.replace(/^[/\\]+/, "");
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const baseUrl = apiBase.replace(/\/api\/?$/, "");
    return `${baseUrl}/${cleanPath.startsWith("uploads/") ? cleanPath : `uploads/${cleanPath}`}`;
  };

  // Fetch user profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const profileData = await userAPI.getProfile();
      setUser(profileData.user || profileData);
      
      // Update localStorage with fresh data
      localStorage.setItem('user', JSON.stringify(profileData.user || profileData));
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        authAPI.logout();
        router.push('/auth');
      } else {
        toast.error('Failed to load profile');
        // Fallback to localStorage data
        const localUser = authAPI.getCurrentUser();
        if (localUser) {
          setUser(localUser);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAddress = async () => {
    if (!newAddress.trim()) {
      toast.error('Please enter an address');
      return;
    }

    setIsSavingAddress(true);

    try {
      const response = await userAPI.updateAddress(newAddress);
      
      // Update local state
      const updatedUser = response.user || response;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Address updated successfully!');
      setIsEditingAddress(false);
      setNewAddress("");
    } catch (error) {
      console.error('Failed to update address:', error);
      const message = error.response?.data?.message || 'Failed to update address';
      toast.error(message);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      window.dispatchEvent(new Event('authChange'));
      toast.success('Logged out successfully');
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      toast.success('Logged out successfully');
      router.push('/auth');
    }
  };

  const menuItems = [
    { icon: Pencil, label: "Edit Profile", description: "Update your info", href: "/update-profile" },
    { icon: CreditCard, label: "Payment Methods", description: "Manage cards", href: "#" },
    { icon: Lock, label: "Change Password", description: "Update password", href: "/change-password" },
    { icon: Bell, label: "Notifications", description: "Manage preferences", href: "#" },
    { icon: Shield, label: "Privacy & Security", description: "Password, 2FA", href: "#" },
    { icon: HelpCircle, label: "Help & Support", description: "FAQ, Contact us", href: "#" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <EcommerceLoader fullScreen={false} message="Loading your profile..." />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <User className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Please Login</h2>
          <p className="text-muted-foreground mb-4">You need to login to view your profile</p>
          <Link href="/auth" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        
        {/* Back */}
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground mb-6 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Profile Card */}
        <div className="rounded-xl bg-card border border-border p-6 mb-6 shadow-card">
          
          <div className="flex gap-4 items-center">
            
            <div className="relative">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden">
                {(user.profileImage || user.avatar) && !imageError ? (
                  <img 
                    src={getImageUrl(user.profileImage || user.avatar)} 
                    className="w-full h-full object-cover" 
                    alt="Profile"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <User className="w-10 h-10 text-primary" />
                )}
              </div>

              <Link
                href="/update-profile"
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Edit className="w-4 h-4 text-white" />
              </Link>
            </div>

            <div className="flex-1">
              <h1 className="text-xl font-bold">{user.fullname || user.name || 'User'}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground">
                {user.phone || 'No phone number'}
              </p>
            </div>

          </div>
        </div>

        {/* Address Section */}
        <div className="rounded-xl bg-card border border-border p-4 mb-6 shadow-card">
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Delivery Addresss</h2>

            {!isEditingAddress && (
              <button 
                onClick={() => {
                  setIsEditingAddress(true);
                  setNewAddress(user.address || "");
                }}
                className="text-primary flex items-center gap-1 text-sm hover:underline"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>

          {isEditingAddress ? (
            <div className="space-y-3">
              <textarea
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Enter your delivery address"
                className="w-full border border-border rounded-lg px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateAddress}
                  disabled={isSavingAddress}
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSavingAddress ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setIsEditingAddress(false);
                    setNewAddress("");
                  }}
                  disabled={isSavingAddress}
                  className="px-4 border border-border rounded-lg hover:bg-muted/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                {user.address ? (
                  <p className="text-sm text-foreground">{user.address}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No address added yet. Click Edit to add your delivery address.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Menu */}
        <div className="rounded-xl bg-card border border-border divide-y shadow-card">
          
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
              >
                
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>

                <div className="flex-1">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            );
          })}

        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full mt-6 border border-red-500 text-red-500 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>

        <p className="text-center text-sm text-muted-foreground mt-6">
          GroFast v1.0.0
        </p>

      </main>
    </div>
  );
}