// import { createClient } from "@supabase/supabase-js"
import { add } from "date-fns"
import { supabase } from "./supabase"

export interface CustomerSignupData {
  name: string
  email: string
  age: string
  sex: string
  phone: string
  password: string
  location:string
}

export interface ShopOwnerSignupData {
  shopName: string
  ownerName: string
  shopType: string
  email: string
  phone: string
  password: string
  location: string
}

export async function signUpCustomer(data: CustomerSignupData) {
  try {
    // const supabase = createClient()

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
    })

    if (authError) {
      return { error: authError.message }
    }

    // Return success - user will need to verify email before profile is created
    return {
      success: true,
      user: authData.user,
      needsVerification: !authData.user?.email_confirmed_at,
    }
  } catch (error: any) {
    return { error: "An unexpected error occurred during customer signup: " + error.message }
  }
}

export async function signUpShopOwner(data: ShopOwnerSignupData) {
  try {
    // const supabase = createClientComponentClient()

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
    })

    if (authError) {
      return { error: authError.message }
    }

    // Return success - user will need to verify email before profile is created
    return {
      success: true,
      user: authData.user,
      needsVerification: !authData.user?.email_confirmed_at,
    }
  } catch (error: any) {
    return { error: "An unexpected error occurred during shop owner signup: " + error.message }
  }
}

export async function verifyOTP(email: string, token: string) {
  try {
    // const supabase = createClientComponentClient()

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    })

    if (error) {
      return { error: error.message }
    }

    if (data.user) {
      // Now create the user profile after successful verification
      await createUserProfile(data.user)
    }

    return { success: true, user: data.user }
  } catch (error: any) {
    return { error: "An unexpected error occurred during verification: " + error.message }
  }
}

export async function resendOTP(email: string) {
  try {
    // const supabase = createClientComponentClient()

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { error: "An unexpected error occurred while resending code: " + error.message }
  }
}

// Helper function to create user profile after email verification
async function createUserProfile(user: any) {
  try {
    const supabaseAdmin = createAdminClient()
    const userType = user.user_metadata?.user_type

    if (userType === "customer") {
      // Create customer profile
      const { error } = await supabaseAdmin.from("customers").insert({
        id: user.id,
        name: user.user_metadata.name,
        email: user.email,
        age: user.user_metadata.age,
        sex: user.user_metadata.sex,
        phone: user.user_metadata.phone,
        location: user.user_metadata.location, // Add location to customer profile
      })

      if (error) {
        console.error("Failed to create customer profile:", error)
      }
    } else if (userType === "shop-owner") {
      // Create shop first
      const { data: shopData, error: shopError } = await supabaseAdmin
        .from("shops")
        .insert({
          name: user.user_metadata.shopName,
          type: user.user_metadata.shopType,
          email: user.email,
          phone: user.user_metadata.phone,
          address: user.user_metadata.location, // Add location to shop
        })
        .select()
        .single()

      if (shopError) {
        console.error("Failed to create shop:", shopError)
        return
      }

      // Create shop owner profile
      const { error: ownerError } = await supabaseAdmin.from("shop_owners").insert({
        id: user.id,
        name: user.user_metadata.name,
        email: user.email,
        shop_id: shopData.id,
        phone: user.user_metadata.phone,
      })

      if (ownerError) {
        console.error("Failed to create shop owner profile:", ownerError)
      }
    }
  } catch (error) {
    console.error("Error creating user profile:", error)
  }
}

export async function signInUser(email: string, password: string) {
  try {
    // const supabase = createClientComponentClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    // Check if email is verified
    if (!data.user?.email_confirmed_at) {
      return { error: "Please verify your email address before signing in." }
    }

    return { success: true, user: data.user }
  } catch (error: any) {
    return { error: "An unexpected error occurred during sign-in: " + error.message }
  }
}

export async function signOutUser() {
  // const supabase = createClientComponentClient()
  const { error } = await supabase.auth.signOut()
  return { error: error?.message }
}

export async function getCurrentUser() {
  // const supabase = createClientComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
