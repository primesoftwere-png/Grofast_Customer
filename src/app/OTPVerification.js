"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";

export default function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const inputRefs = useRef([]);
  const router = useRouter();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(
        () => setResendTimer(resendTimer - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit) && index === 5) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pasted)) return;

    const newOtp = [...otp];
    pasted.split("").forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });

    setOtp(newOtp);

    if (newOtp.every((d) => d)) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleVerify = async (code) => {
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 1500));

    if (code.length === 6) {
      setIsVerified(true);
      toast.success("Phone verified successfully!");

      setTimeout(() => router.push("/"), 2000);
    } else {
      toast.error("Invalid OTP");
    }

    setIsLoading(false);
  };

  const handleResend = () => {
    setResendTimer(30);
    toast.success("OTP sent again!");
  };

  // ================= VERIFIED =================
  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/30">
        <div className="text-center">
          
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>

          <h1 className="text-2xl font-bold mb-2">
            Verified!
          </h1>

          <p className="text-muted-foreground">
            Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/30 flex flex-col">
      
      {/* Header */}
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/auth"
          className="flex items-center gap-2 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📱</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">
            Verify Your Phone
          </h1>

          <p className="text-muted-foreground mb-8">
            Enter 6-digit code
          </p>

          {/* OTP */}
          <div className="flex justify-center gap-3 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleChange(index, e.target.value)
                }
                onKeyDown={(e) =>
                  handleKeyDown(index, e)
                }
                onPaste={handlePaste}
                className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 ${
                  digit
                    ? "border-primary bg-primary/10"
                    : "border-border"
                }`}
              />
            ))}
          </div>

          {/* Button */}
          <button
            onClick={() => handleVerify(otp.join(""))}
            disabled={otp.some((d) => !d) || isLoading}
            className="w-full bg-primary text-white py-3 rounded-xl flex justify-center gap-2 mb-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </button>

          {/* Resend */}
          <p className="text-sm text-muted-foreground">
            Didn't receive code?{" "}
            {resendTimer > 0 ? (
              <span>Resend in {resendTimer}s</span>
            ) : (
              <button
                onClick={handleResend}
                className="text-primary"
              >
                Resend OTP
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}