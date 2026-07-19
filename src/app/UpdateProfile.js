"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Camera,
  Loader2,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { userAPI } from "@/services/user.api";

export default function UpdateProfile() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
  });

  const [imageError, setImageError] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http") || imagePath.startsWith("blob:")) return imagePath;
    const cleanPath = imagePath.replace(/^[/\\]+/, "");
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const baseUrl = apiBase.replace(/\/api\/?$/, "");
    return `${baseUrl}/${cleanPath.startsWith("uploads/") ? cleanPath : `uploads/${cleanPath}`}`;
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setFormData({
      name: user.fullname || user.name || "John Doe",
      email: user.email || "john.doe@email.com",
      phone: user.phone || "+1 (555) 123-4567",
      avatar: user.profileImage || user.avatar || "",
    });
  }, []);

  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedUser = {
      ...currentUser,
      fullname: formData.name,
      email: formData.email,
      phone: formData.phone,
      avatar: formData.avatar,
      profileImage: formData.avatar,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    toast.success("Profile updated successfully!");
    router.push("/profile");
  };

  const handleAvatarChange = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, avatar: imageUrl });
      setImageError(false);
      
      try {
        setIsUploadingAvatar(true);
        const toastId = toast.loading("Uploading profile picture...");
        
        const response = await userAPI.uploadAvatar(file);
        const backendAvatarUrl = response.profileImage || response.user?.profileImage || response.avatar || response.url || response.data?.avatar || response.user?.avatar || imageUrl;
        
        toast.success("Profile picture updated successfully!", { id: toastId });
        
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...currentUser,
          avatar: backendAvatarUrl,
          profileImage: backendAvatarUrl,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
      } catch (error) {
        console.error("Failed to upload avatar:", error);
        toast.error("Failed to upload profile picture. Please try again.");
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6 max-w-md">
        
        {/* Back */}
        <Link
          href="/profile"
          className="flex items-center gap-2 text-muted-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>

        <h1 className="text-2xl font-bold mb-6">
          Update Profile
        </h1>

        {/* Avatar */}
        <div className="flex justify-center mb-8">
          
          <div className="relative">
            
            <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              {formData.avatar && !imageError ? (
                <img
                  src={getImageUrl(formData.avatar)}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <User className="w-14 h-14 text-primary" />
              )}
            </div>

            <button
              type="button"
              onClick={handleAvatarChange}
              disabled={isUploadingAvatar}
              className={`absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center transition-opacity ${
                isUploadingAvatar ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary'
              }`}
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-background p-6 space-y-5 shadow"
        >
          
          {/* Name */}
          <div>
            <label className="text-sm font-medium">
              Full Name
            </label>

            <div className="relative mt-2">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                className="w-full pl-10 py-2 border border-border rounded-md"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium">
              Email Address
            </label>

            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />

              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                className="w-full pl-10 py-2 border border-border rounded-md"
                required
              />
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              Changing email will require verification
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium">
              Phone Number
            </label>

            <div className="relative mt-2">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />

              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value,
                  })
                }
                className="w-full pl-10 py-2 border border-border rounded-md"
                required
              />
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              Changing phone will require OTP verification
            </p>
          </div>

          {/* Buttons */}
          <div className="pt-4 flex gap-3">
            
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="flex-1 border border-border py-3 rounded-md"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary text-white py-3 rounded-md flex justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>

          </div>

        </form>
      </main>
    </div>
  );
}