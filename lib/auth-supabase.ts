import { createBrowserClient } from "./supabase-client";

export interface CustomerSignupData {
  name: string;
  email: string;
  age: string;
  sex: string;
  phone: string;
  password: string;
  location: string;
}

export interface ShopOwnerSignupData {
  shopName: string;
  ownerName: string;
  shopType: string;
  email: string;
  phone: string;
  password: string;
  location: string;
}

export async function signUpCustomer(data: CustomerSignupData) {
  const supabase = createBrowserClient();
  try {
    // Sign up with Supabase Auth (this will send OTP email)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          user_type: "customer",
          age: Number.parseInt(data.age),
          sex: data.sex,
          phone: data.phone,
          location: data.location,
        },
      },
    });

    if (authError) {
      if (
        authError.message.includes("User already registered") ||
        authError.message.includes("User already exists")
      ) {
        return {
          error: "Account already exists, please login with your credentials.",
        };
      }
      return { error: authError.message };
    }

    // Return success - user will need to verify email before profile is created
    return {
      success: true,
      user: authData.user,
      needsVerification: !authData.user?.email_confirmed_at,
    };
  } catch (error: any) {
    return {
      error:
        "An unexpected error occurred during customer signup: " + error.message,
    };
  }
}

export async function signUpShopOwner(data: ShopOwnerSignupData) {
  const supabase = createBrowserClient();
  try {
    // Sign up with Supabase Auth (this will send OTP email)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.ownerName,
          user_type: "shop-owner",
          shopName: data.shopName,
          shopType: data.shopType,
          phone: data.phone,
          location: data.location, // Add location to shop owner metadata
        },
      },
    });

    if (authError) {
      if (
        authError.message.includes("User already registered") ||
        authError.message.includes("User already exists")
      ) {
        return {
          error: "Account already exists, please login with your credentials.",
        };
      }
      return { error: authError.message };
    }

    // Return success - user will need to verify email before profile is created
    return {
      success: true,
      user: authData.user,
      needsVerification: !authData.user?.email_confirmed_at,
    };
  } catch (error: any) {
    return {
      error:
        "An unexpected error occurred during shop owner signup: " +
        error.message,
    };
  }
}

export async function verifyOTP(email: string, token: string) {
  const supabase = createBrowserClient();
  try {
    console.log(
      "Attempting to verify OTP for email:",
      email,
      "with token:",
      token,
    );
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });

    if (error) {
      console.error("OTP verification failed:", error.message);
      return { error: error.message };
    }

    console.log("OTP verification successful. User data:", data.user);

    // The manual call to createUserProfile has been removed.
    // Profile creation is now handled by your database trigger.

    return { success: true, user: data.user };
  } catch (error: any) {
    console.error(
      "An unexpected error occurred during verification:",
      error.message,
    );
    return {
      error:
        "An unexpected error occurred during verification: " + error.message,
    };
  }
}

export async function resendOTP(email: string) {
  const supabase = createBrowserClient();
  try {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      if (
        error.message.includes("User already confirmed") ||
        error.message.includes("Email already confirmed")
      ) {
        return {
          error: "Account already exists, please login with your credentials.",
        };
      }
      return { error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return {
      error:
        "An unexpected error occurred while resending code: " + error.message,
    };
  }
}

// Helper function to create user profile after email verification

export async function signInUser(email: string, password: string) {
  const supabase = createBrowserClient();
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    // Check if email is verified
    if (!data.user?.email_confirmed_at) {
      return { error: "Please verify your email address before signing in." };
    }

    return { success: true, user: data.user };
  } catch (error: any) {
    return {
      error: "An unexpected error occurred during sign-in: " + error.message,
    };
  }
}

export async function signOutUser() {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signOut();
  return { error: error?.message };
}

export async function getCurrentUser() {
  const supabase = createBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
