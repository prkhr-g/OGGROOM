"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { verifyOTP, resendOTP } from "@/lib/auth-supabase"

export default function VerifyOTPScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const userType = searchParams.get("type") || "customer"

  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [countdown, setCountdown] = useState(0)

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code")
      setIsLoading(false)
      return
    }

    try {
      const result = await verifyOTP(email, otp)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess("Email verified successfully! Redirecting...")
        setTimeout(() => {
          if (userType === "customer") {
            router.push("/customer/home")
          } else {
            router.push("/shop-owner/dashboard")
          }
        }, 2000)
      }
    } catch (error) {
      setError("An error occurred during verification")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsResending(true)
    setError("")
    setSuccess("")

    try {
      const result = await resendOTP(email)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess("Verification code sent! Please check your email.")
        setCountdown(60) // 60 second countdown
      }
    } catch (error) {
      setError("Failed to resend verification code")
    } finally {
      setIsResending(false)
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Invalid verification link</p>
            <Link href="/auth">
              <Button>Back to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Link href="/auth">
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              {success ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <Mail className="h-8 w-8 text-blue-600" />
              )}
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a 6-digit verification code to <br />
              <strong>{email}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                    setOtp(value)
                  }}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
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
              <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
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
  )
}
