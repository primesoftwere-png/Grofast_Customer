"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (newPassword === currentPassword) {
      alert("New password must be different from current password");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);

    alert("Password changed successfully!");
    router.push("/profile");
  };

  const passwordStrength = (password) => {
    if (password.length === 0) return { level: 0, text: "", color: "" };
    if (password.length < 6)
      return { level: 1, text: "Weak", color: "bg-destructive" };
    if (password.length < 8)
      return { level: 2, text: "Fair", color: "bg-yellow-bright" };
    if (password.length < 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { level: 3, text: "Good", color: "bg-primary" };
    }
    if (
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    ) {
      return { level: 4, text: "Strong", color: "bg-green-dark" };
    }
    return { level: 2, text: "Fair", color: "bg-yellow-bright" };
  };

  const strength = passwordStrength(newPassword);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6 max-w-md">
        
        {/* Back */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-2xl font-bold">
            Change Password
          </h1>

          <p className="text-muted-foreground mt-1">
            Update your password to keep your account secure
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-xl bg-background p-6 space-y-5">
          
          {/* Current Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Current Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

              <input
                type={showPasswords ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-border rounded-md"
                required
              />
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              New Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

              <input
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-border rounded-md"
                required
              />

              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPasswords ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {/* Strength */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full ${
                        level <= strength.level ? strength.color : "bg-muted"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">
                  Password strength:{" "}
                  <span className="font-medium">
                    {strength.text}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Confirm New Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

              <input
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-border rounded-md"
                required
              />

              {confirmPassword && newPassword === confirmPassword && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-md font-semibold flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </>
            ) : (
              "Change Password"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/forgot-password" className="text-primary hover:underline">
            Forgot your current password?
          </Link>
        </p>
      </main>
    </div>
  );
}