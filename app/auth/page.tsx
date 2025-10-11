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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Store, User, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signUpCustomer,
  signUpShopOwner,
  signInUser,
} from "@/lib/auth-supabase";

export default function AuthScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUserType = searchParams.get("type") || "customer";
  const [currentUserType, setCurrentUserType] = useState(initialUserType);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Form state for customer signup
  const [customerSignupData, setCustomerSignupData] = useState({
    name: "",
    email: "",
    age: "",
    sex: "",
    phone: "",
    password: "",
  });

  const [shopOwnerSignupData, setShopOwnerSignupData] = useState({
    shopName: "",
    ownerName: "",
    shopType: "",
    email: "",
    phone: "",
    password: "",
  });

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    setCurrentUserType(initialUserType);
  }, [initialUserType]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signInUser(loginData.email, loginData.password);

      if (result.error) {
        setError(result.error);
      } else {
        // Redirect based on user type (we'll determine this from user metadata)
        const userType = result.user?.user_metadata?.user_type;
        if (userType === "customer") {
          router.push("/customer/home");
        } else {
          router.push("/shop-owner/dashboard");
        }
      }
    } catch (error) {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (parseInt(customerSignupData.age, 10) < 18) {
      setError("You must be at least 18 years old to register.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUpCustomer(customerSignupData);

      if (result.error) {
        setError(result.error);
      } else if (result.needsVerification) {
        // Redirect to OTP verification page
        router.push(
          `/auth/verify-otp?email=${encodeURIComponent(customerSignupData.email)}&type=customer`,
        );
      } else {
        // User is already verified (shouldn't happen with email confirmation enabled)
        router.push("/customer/home");
      }
    } catch (error) {
      setError("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShopOwnerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signUpShopOwner(shopOwnerSignupData);

      if (result.error) {
        setError(result.error);
      } else if (result.needsVerification) {
        // Redirect to OTP verification page
        router.push(
          `/auth/verify-otp?email=${encodeURIComponent(shopOwnerSignupData.email)}&type=shop-owner`,
        );
      } else {
        // User is already verified (shouldn't happen with email confirmation enabled)
        router.push("/shop-owner/dashboard");
      }
    } catch (error) {
      setError("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Link href="/">
          <Button variant="ghost" className="text-foreground hover:bg-accent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary-foreground rounded-full flex items-center justify-center mb-4">
              {currentUserType === "customer" ? (
                <User className="h-8 w-8 text-primary" />
              ) : (
                <Store className="h-8 w-8 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {currentUserType === "customer"
                ? "Customer Portal"
                : "Shop Owner Portal"}
            </CardTitle>
            <CardDescription>
              {currentUserType === "customer"
                ? "Sign in or create an account"
                : "Manage your salon/barbershop"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-login">Email</Label>
                    <Input
                      id="email-login"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-login">Password</Label>
                    <div className="relative">
                      <Input
                        id="password-login"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 right-0 h-full px-3 py-2 text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Log In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form
                  onSubmit={
                    currentUserType === "customer"
                      ? handleCustomerSignup
                      : handleShopOwnerSignup
                  }
                  className="space-y-4 pt-4"
                >
                  {currentUserType === "customer" ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name-signup">Full Name</Label>
                        <Input
                          id="name-signup"
                          placeholder="Enter your full name"
                          value={customerSignupData.name}
                          onChange={(e) =>
                            setCustomerSignupData({
                              ...customerSignupData,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-signup-customer">Email</Label>
                        <Input
                          id="email-signup-customer"
                          type="email"
                          placeholder="Enter your email"
                          value={customerSignupData.email}
                          onChange={(e) =>
                            setCustomerSignupData({
                              ...customerSignupData,
                              email: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age-signup">Age</Label>
                        <Input
                          id="age-signup"
                          type="number"
                          placeholder="Enter your age"
                          value={customerSignupData.age}
                          onChange={(e) =>
                            setCustomerSignupData({
                              ...customerSignupData,
                              age: e.target.value,
                            })
                          }
                          min="18"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sex-signup">Sex</Label>
                        <Select
                          value={customerSignupData.sex}
                          onValueChange={(value) =>
                            setCustomerSignupData({
                              ...customerSignupData,
                              sex: value,
                            })
                          }
                          required
                        >
                          <SelectTrigger id="sex-signup">
                            <SelectValue placeholder="Select your sex" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="unisex">
                              Prefer not to say
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone-signup-customer">
                          Phone Number
                        </Label>
                        <Input
                          id="phone-signup-customer"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={customerSignupData.phone}
                          onChange={(e) =>
                            setCustomerSignupData({
                              ...customerSignupData,
                              phone: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password-signup-customer">
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="password-signup-customer"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            value={customerSignupData.password}
                            onChange={(e) =>
                              setCustomerSignupData({
                                ...customerSignupData,
                                password: e.target.value,
                              })
                            }
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute inset-y-0 right-0 h-full px-3 py-2 text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Please remember your password.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="shop-name-signup">Shop Name</Label>
                        <Input
                          id="shop-name-signup"
                          placeholder="Enter your shop name"
                          value={shopOwnerSignupData.shopName}
                          onChange={(e) =>
                            setShopOwnerSignupData({
                              ...shopOwnerSignupData,
                              shopName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="owner-name-signup">Owner Name</Label>
                        <Input
                          id="owner-name-signup"
                          placeholder="Enter owner name"
                          value={shopOwnerSignupData.ownerName}
                          onChange={(e) =>
                            setShopOwnerSignupData({
                              ...shopOwnerSignupData,
                              ownerName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-signup-shop">
                          Business Email
                        </Label>
                        <Input
                          id="email-signup-shop"
                          type="email"
                          placeholder="Enter business email"
                          value={shopOwnerSignupData.email}
                          onChange={(e) =>
                            setShopOwnerSignupData({
                              ...shopOwnerSignupData,
                              email: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-signup-shop">Password</Label>
                        <div className="relative">
                          <Input
                            id="password-signup-shop"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            value={shopOwnerSignupData.password}
                            onChange={(e) =>
                              setShopOwnerSignupData({
                                ...shopOwnerSignupData,
                                password: e.target.value,
                              })
                            }
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute inset-y-0 right-0 h-full px-3 py-2 text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Please remember your password.
                        </p>
                      </div>
                    </>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
