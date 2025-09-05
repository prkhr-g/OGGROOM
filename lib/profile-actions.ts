'use server'

import { createServerClient } from "@/lib/supabase-server"

// Customer Profile Functions
export async function getCustomerProfile(userId: string) {
  const supabase = createServerClient()
  try {
    const { data, error } = await supabase.from("customers").select("*").eq("id", userId).single()

    if (error) {
      return { error: error.message }
    }

    return { profile: data }
  } catch (error: any) {
    return { error: "Failed to fetch customer profile: " + error.message }
  }
}

export async function updateCustomerProfile(
  userId: string,
  profileData: {
    name: string
    age: number
    sex: string
    phone: string
    location: string
    latitude: number | null
    longitude: number | null
  },
) {
  const supabase = createServerClient()
  try {
    // Basic validation
    if (!profileData.name || profileData.name.trim() === "") {
      return { error: "Name cannot be empty." }
    }
    if (!profileData.age || profileData.age <= 0) {
      return { error: "Age must be a positive number." }
    }
    if (!profileData.sex || profileData.sex.trim() === "") {
      return { error: "Sex cannot be empty." }
    }
    if (!profileData.phone || profileData.phone.trim() === "") {
      return { error: "Phone number cannot be empty." }
    }
    // Simple phone number regex (can be improved)
    if (!/^[0-9]{10,15}$/.test(profileData.phone)) {
      return { error: "Invalid phone number format." }
    }
    if (!profileData.location || profileData.location.trim() === "") {
      return { error: "Location cannot be empty." }
    }

    const { error } = await supabase
      .from("customers")
      .update({
        name: profileData.name,
        age: profileData.age,
        sex: profileData.sex,
        phone: profileData.phone,
        location: profileData.location,
        latitude: profileData.latitude,
        longitude: profileData.longitude,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { error: "Failed to update customer profile: " + error.message }
  }
}

// Shop Owner Profile Functions
export async function getShopOwnerProfile(userId: string) {
  const supabase = createServerClient()
  try {
    const { data, error } = await supabase
      .from("shop_owners")
      .select(`
        *,
        shop:shops(*)
      `)
      .eq("id", userId)
      .order("created_at", { foreignTable: "shops", ascending: true })
      .maybeSingle()

    if (error) {
      return { error: error.message }
    }

    return { profile: data }
  } catch (error: any) {
    return { error: "Failed to fetch shop owner profile: " + error.message }
  }
}

export async function updateShopOwnerProfile(
  userId: string,
  shopId: string,
  profileData: {
    ownerName: string
    ownerPhone: string
    shopName: string
    shopType: string
    shopEmail: string
    shopPhone: string
    shopAddress: string
    shopLatitude: number | null
    shopLongitude: number | null
    openingTime: string
    closingTime: string
  },
) {
  const supabase = createServerClient()
  try {
    // Basic validation
    if (!profileData.ownerName || profileData.ownerName.trim() === "") {
      return { error: "Owner name cannot be empty." }
    }
    if (!profileData.ownerPhone || profileData.ownerPhone.trim() === "") {
      return { error: "Owner phone number cannot be empty." }
    }
    if (!/^[0-9]{10,15}$/.test(profileData.ownerPhone)) {
      return { error: "Invalid owner phone number format." }
    }
    if (!profileData.shopName || profileData.shopName.trim() === "") {
      return { error: "Shop name cannot be empty." }
    }
    if (!profileData.shopType || profileData.shopType.trim() === "") {
      return { error: "Shop type cannot be empty." }
    }
    if (!profileData.shopEmail || profileData.shopEmail.trim() === "") {
      return { error: "Shop email cannot be empty." }
    }
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(profileData.shopEmail)) {
      return { error: "Invalid shop email format." }
    }
    if (!profileData.shopPhone || profileData.shopPhone.trim() === "") {
      return { error: "Shop phone number cannot be empty." }
    }
    if (!/^[0-9]{10,15}$/.test(profileData.shopPhone)) {
      return { error: "Invalid shop phone number format." }
    }
    if (!profileData.shopAddress || profileData.shopAddress.trim() === "") {
      return { error: "Shop address cannot be empty." }
    }
    if (!profileData.openingTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(profileData.openingTime)) {
      return { error: "Invalid opening time format (HH:MM)." }
    }
    if (!profileData.closingTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(profileData.closingTime)) {
      return { error: "Invalid closing time format (HH:MM)." }
    }

    // Update shop owner info
    const { error: updateOwnerError } = await supabase
      .from("shop_owners")
      .update({
        name: profileData.ownerName,
        phone: profileData.ownerPhone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateOwnerError) {
      return { error: updateOwnerError.message }
    }

    // Update shop info
    const { error: updateShopError } = await supabase
      .from("shops")
      .update({
        name: profileData.shopName,
        type: profileData.shopType,
        email: profileData.shopEmail,
        phone: profileData.shopPhone,
        address: profileData.shopAddress,
        opening_time: profileData.openingTime,
        closing_time: profileData.closingTime,
        shop_latitude: profileData.shopLatitude,
        shop_longitude: profileData.shopLongitude,
        updated_at: new Date().toISOString(),
      })
      .eq("id", shopId)

    if (updateShopError) {
      return { error: updateShopError.message }
    }

    return { success: true }
  } catch (error: any) {
    return { error: "Failed to update shop owner profile: " + error.message }
  }
}

export async function updateShopStatus(
  shopId: string,
  statusData: {
    is_open: boolean
    opening_time: string
    closing_time: string
  },
) {
  const supabase = createServerClient()
  try {
    const { error } = await supabase
      .from("shops")
      .update({
        is_open: statusData.is_open,
        opening_time: statusData.opening_time,
        closing_time: statusData.closing_time,
        updated_at: new Date().toISOString(),
      })
      .eq("id", shopId)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { error: "Failed to update shop status: " + error.message }
  }
}

export async function createShopOwnerProfile(
  userId: string,
  profileData: {
    ownerName: string
    ownerEmail: string
    ownerPhone: string
    shopName: string
    shopType: string
    shopEmail: string
    shopPhone: string
    shopAddress: string
    shopLatitude: number | null
    shopLongitude: number | null
    openingTime: string
    closingTime: string
  },
) {
  const supabase = createServerClient()
  try {
    // Basic validation
    if (!profileData.ownerName || profileData.ownerName.trim() === "") {
      return { error: "Owner name cannot be empty." }
    }
    if (!profileData.ownerEmail || profileData.ownerEmail.trim() === "") {
      return { error: "Owner email cannot be empty." }
    }
    if (!/^\S+@\S+\.\S+$/.test(profileData.ownerEmail)) {
      return { error: "Invalid owner email format." }
    }
    if (!profileData.ownerPhone || profileData.ownerPhone.trim() === "") {
      return { error: "Owner phone number cannot be empty." }
    }
    if (!/^[0-9]{10,15}$/.test(profileData.ownerPhone)) {
      return { error: "Invalid owner phone number format." }
    }
    if (!profileData.shopName || profileData.shopName.trim() === "") {
      return { error: "Shop name cannot be empty." }
    }
    if (!profileData.shopType || profileData.shopType.trim() === "") {
      return { error: "Shop type cannot be empty." }
    }
    if (!profileData.shopEmail || profileData.shopEmail.trim() === "") {
      return { error: "Shop email cannot be empty." }
    }
    if (!/^\S+@\S+\.\S+$/.test(profileData.shopEmail)) {
      return { error: "Invalid shop email format." }
    }
    if (!profileData.shopPhone || profileData.shopPhone.trim() === "") {
      return { error: "Shop phone number cannot be empty." }
    }
    if (!/^[0-9]{10,15}$/.test(profileData.shopPhone)) {
      return { error: "Invalid shop phone number format." }
    }
    if (!profileData.shopAddress || profileData.shopAddress.trim() === "") {
      return { error: "Shop address cannot be empty." }
    }
    if (!profileData.openingTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(profileData.openingTime)) {
      return { error: "Invalid opening time format (HH:MM)." }
    }
    if (!profileData.closingTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(profileData.closingTime)) {
      return { error: "Invalid closing time format (HH:MM)." }
    }

    const { error } = await supabase.rpc('create_shop_and_owner', {
        owner_name: profileData.ownerName,
        owner_email: profileData.ownerEmail,
        owner_phone: profileData.ownerPhone,
        shop_name: profileData.shopName,
        shop_type: profileData.shopType,
        shop_email: profileData.shopEmail,
        shop_phone: profileData.shopPhone,
        shop_address: profileData.shopAddress,
        shop_latitude: profileData.shopLatitude,
        shop_longitude: profileData.shopLongitude,
        opening_time: profileData.openingTime,
        closing_time: profileData.closingTime,
    });

    if (error) {
      return { error: "Failed to create profile: " + error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { error: "Failed to create profile: " + error.message }
  }
}

export async function addService(
  shopId: string,
  serviceData: {
    name: string
    duration: number
    price: number
    description: string
  },
) {
  const supabase = createServerClient()
  try {
    const { error } = await supabase.from("services").insert({
      shop_id: shopId,
      ...serviceData,
    })

    if (error) {
      return { error: "Failed to add service: " + error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { error: "Failed to add service: " + error.message }
  }
}

export async function addBarber(
  shopId: string,
  barberData: {
    name: string
    experience: string
    phone: string
    email: string
    specialties: string[]
  },
) {
  const supabase = createServerClient()
  try {
    const { error } = await supabase.from("barbers").insert({
      shop_id: shopId,
      ...barberData,
    })

    if (error) {
      return { error: "Failed to add barber: " + error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { error: "Failed to add barber: " + error.message }
  }
}

export async function deleteService(serviceId: number) {
  const supabase = createServerClient()
  try {
    const { error } = await supabase.from("services").delete().eq("id", serviceId)

    if (error) {
      return { error: "Failed to delete service: " + error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { error: "Failed to delete service: " + error.message }
  }
}

export async function deleteBarber(barberId: number) {
  const supabase = createServerClient()
  try {
    const { error } = await supabase.from("barbers").delete().eq("id", barberId)

    if (error) {
      return { error: "Failed to delete barber: " + error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { error: "Failed to delete barber: " + error.message }
  }
}

export async function updateService(
  serviceId: number,
  serviceData: {
    name: string
    duration: number
    price: number
    description: string
  },
) {
  const supabase = createServerClient()
  try {
    const { error } = await supabase.from("services").update(serviceData).eq("id", serviceId)

    if (error) {
      return { error: "Failed to update service: " + error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { error: "Failed to update service: " + error.message }
  }
}

export async function updateBarber(
  barberId: number,
  barberData: {
    name: string
    experience: string
    phone: string
    email: string
    specialties: string[]
  },
) {
  const supabase = createServerClient()
  try {
    const { error } = await supabase.from("barbers").update(barberData).eq("id", barberId)

    if (error) {
      return { error: "Failed to update barber: " + error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { error: "Failed to update barber: " + error.message }
  }
}

export async function createBooking(
  bookingData: {
    customer_id: string
    shop_id: string
    barber_id: number
    service_ids: number[]
    booking_date: string
    booking_time: string
    total_price: number
    total_duration: number
    customer_notes?: string
  },
) {
  const supabase = createServerClient()
  try {
    const { error } = await supabase.from("bookings").insert({
      ...bookingData,
    })

    if (error) {
      return { error: "Failed to create booking: " + error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { error: "Failed to create booking: " + error.message }
  }
}

export async function getAvailableTimeSlots(
  shopId: string,
  barberId: number,
  date: string,
  serviceDuration: number,
) {
  const supabase = createServerClient()
  try {
    const { data, error } = await supabase.rpc('get_available_time_slots', {
      p_shop_id: shopId,
      p_barber_id: barberId,
      p_date: date,
      p_service_duration: serviceDuration,
    })

    if (error) {
      return { error: "Failed to get available time slots: " + error.message }
    }

    const timeSlots = data.map((slot: { time_slot: string }) => slot.time_slot);

    return { timeSlots: timeSlots, bookedSlots: [] };
  } catch (error: any) {
    return { error: "Failed to get available time slots: " + error.message };
  }
}

export async function getAvailableShops() {
  const supabase = createServerClient()
  try {
    const { data, error } = await supabase
      .from("shops")
      .select("id, name, type, address, email, phone, is_open, opening_time, closing_time")

    if (error) {
      return { error: "Failed to fetch available shops: " + error.message }
    }

    return { shops: data }
  } catch (error: any) {
    return { error: "Failed to fetch available shops: " + error.message }
  }
}

export async function getShopDetailsForCustomer(shopId: string) {
  const supabase = createServerClient()
  try {
    const { data, error } = await supabase
      .from("shops")
      .select(
        `
        *,
        services(*),
        barbers(*)
      `,
      )
      .eq("id", shopId)
      .maybeSingle()

    if (error) {
      return { error: "Failed to fetch shop details: " + error.message }
    }

    return { shop: data }
  } catch (error: any) {
    return { error: "Failed to fetch shop details: " + error.message }
  }
}



export async function getShopOwnerDashboard(shopId: string) {
  const supabase = createServerClient()
  try {
    const { data, error } = await supabase
      .from("shops")
      .select(
        `
        *,
        bookings:bookings(*, customer:customers(name, phone, email)),
        services:services(*),
        barbers:barbers(*)
      `,
      )
      .eq("id", shopId)
      .maybeSingle()

    if (error) {
      return { error: error.message }
    }

    return { data }
  } catch (error: any) {
    return { error: "Failed to fetch dashboard data: " + error.message }
  }
}

export async function getShopBookings(shopId: string) {
  const supabase = createServerClient()
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        customer:customers(name, phone, email),
        barber:barbers(name)
      `)
      .eq("shop_id", shopId)
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true });

    if (error) {
      return { error: error.message };
    }

    return { bookings: data };
  } catch (error: any) {
    return { error: "Failed to fetch shop bookings: " + error.message };
  }
}

export async function getAllData() {
  const supabase = createServerClient()
  try {
    const { data: shops, error: shopsError } = await supabase.from("shops").select("*");
    const { data: services, error: servicesError } = await supabase.from("services").select("*");
    const { data: barbers, error: barbersError } = await supabase.from("barbers").select("*");

    if (shopsError || servicesError || barbersError) {
      return {
        error: `Shops: ${shopsError?.message}, Services: ${servicesError?.message}, Barbers: ${barbersError?.message}`,
      };
    }

    return { shops, services, barbers };
  } catch (error: any) {
    return { error: "Failed to fetch all data: " + error.message };
  }
}

export async function getNearbyShops(latitude: number, longitude: number, radiusMeters: number = 10000) {
  const supabase = createServerClient()
  try {
    const { data, error } = await supabase.rpc('get_nearby_shops', {
      p_latitude: latitude,
      p_longitude: longitude,
      p_radius_meters: radiusMeters,
    })

    if (error) {
      return { error: error.message }
    }

    return { shops: data }
  } catch (error: any) {
    return { error: "Failed to fetch nearby shops: " + error.message }
  }
}

