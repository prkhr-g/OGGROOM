"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOTP, resendOTP } from "@/lib/auth-supabase";

export default function VerifyOTPScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const userType = searchParams.get("type") || "customer";

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [showAccountExistsMessage, setShowAccountExistsMessage] =
    useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      setIsLoading(false);
      return;
    }

    try {
      const result = await verifyOTP(email, otp);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Email verified successfully! Redirecting...");
        setTimeout(() => {
          if (userType === "customer") {
            router.push("/customer/home");
          } else {
            router.push("/shop-owner/dashboard");
          }
        }, 2000);
      }
    } catch (error) {
      setError("An error occurred during verification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError(""); // Clear previous errors
    setSuccess(""); // Clear previous success messages
    setShowAccountExistsMessage(false); // Clear previous "account exists" message

    try {
      const result = await resendOTP(email);

      // Always show the "Account already exists" message if the button is clicked
      // This overrides any other success message
      setShowAccountExistsMessage(true);

      if (result.error) {
        if (result.type === "account_exists") {
          // The "Account already exists" message is already set to be shown.
          // Do not set a generic error message.
        } else {
          // It's a different error, so display it.
          setError(result.error);
          setShowAccountExistsMessage(false); // Don't show "account exists" if there's another error
        }
      } else {
        // If resendOTP was successful, we still don't show the "Verification code sent!" message
        // because the user explicitly requested not to, and we are showing "Account already exists".
        // No action needed here for success message.
      }
    } catch (error) {
      setError("Failed to resend verification code");
      setShowAccountExistsMessage(false); // Don't show "account exists" if there's a catch error
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Invalid verification link</p>
            <Link href="/auth">
              <Button>Back to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Link href={userType === "shop-owner" ? "/auth?type=shop-owner" : "/auth"}>
          <Button variant="ghost" className="text-foreground hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              {success ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <Mail className="h-8 w-8 text-primary" />
              )}
            </div>

            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a 6-digit verification code to <br />
              <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          {showAccountExistsMessage && (
            <div className="mb-4 p-3 mx-5 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              Account already exists, please login with your credentials.
            </div>
          )}
          {/* <CardContent> */}
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* <form onSubmit={handleVerifyOTP} className="space-y-4"></form> */}

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(value);
                  }}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the code?
              </p>
              <Button
                variant="outline"
                onClick={handleResendOTP}
                disabled={isResending || countdown > 0}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  "Resend Code"
                )}
              </Button>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>Check your spam folder if you don't see the email.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
