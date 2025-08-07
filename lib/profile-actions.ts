// import { createAdminClient } from "./supabase"
import { supabase } from "./supabase"

// Customer Profile Functions
export async function getCustomerProfile(userId: string) {
  try {
    // const supabase = createAdminClient()

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
  },
) {
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
  try {
    // const supabase = createAdminClient()

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
    openingTime: string
    closingTime: string
  },
) {
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

    // const supabase = createAdminClient()

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
  try {
    // const supabase = createAdminClient()

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
    openingTime: string
    closingTime: string
  },
) {
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
    customer_notes?: string
  },
) {
  try {
    const { error } = await supabase.from("bookings").insert({
      ...bookingData,
    })

    if (error) {
      return { error: "Failed to create booking: " + error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { error: "Failed to update barber: " + error.message }
  }
}

export async function getAvailableTimeSlots(
  shopId: string,
  barberId: number,
  date: string,
) {
  try {
    // Fetch shop opening/closing times
    const { data: shopData, error: shopError } = await supabase
      .from("shops")
      .select("opening_time, closing_time")
      .eq("id", shopId)
      .maybeSingle()

    if (shopError) {
      return { error: "Failed to fetch shop hours: " + shopError.message }
    }

    if (!shopData) {
      return { error: "Shop not found." }
    }

    const { opening_time, closing_time } = shopData;

    // Step 1: Fetch existing bookings for the barber on the given date
    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select("booking_time, service_ids") // Fetch service_ids array
      .eq("shop_id", shopId)
      .eq("barber_id", barberId)
      .eq("booking_date", date)

    if (bookingsError) {
      return { error: "Failed to fetch existing bookings: " + bookingsError.message }
    }

    // Step 2: Fetch details for all unique services booked on that day
    const allServiceIds = bookingsData?.flatMap(b => b.service_ids || []) || [];
    const uniqueServiceIds = [...new Set(allServiceIds)];

    let servicesMap = new Map<number, { duration: number }>();

    if (uniqueServiceIds.length > 0) {
        const { data: servicesData, error: servicesError } = await supabase
            .from("services")
            .select("id, duration")
            .in("id", uniqueServiceIds);

        if (servicesError) {
            return { error: "Failed to fetch service details: " + servicesError.message };
        }
        servicesData?.forEach(s => servicesMap.set(s.id, { duration: s.duration }));
    }


    // Step 3: Calculate booked slots with correct durations
    const bookedSlots: { start: string; end: string }[] = [];
    bookingsData?.forEach(booking => {
      const serviceDuration = booking.service_ids
        ? booking.service_ids.reduce((sum: number, s_id: number) => sum + (servicesMap.get(s_id)?.duration || 0), 0)
        : 30; // Default to 30 if no services

      const startTime = booking.booking_time;
      const [hours, minutes, seconds] = startTime.split(':').map(Number);
      const startDateTime = new Date();
      startDateTime.setHours(hours, minutes, seconds, 0);

      const endDateTime = new Date(startDateTime.getTime() + serviceDuration * 60 * 1000);
      bookedSlots.push({
        start: startTime,
        end: `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}:00`
      });
    });

    // Generate all possible time slots for the day (e.g., every 30 minutes)
    const allSlots: string[] = [];
    const [openHour, openMinute] = opening_time.split(':').map(Number);
    const [closeHour, closeMinute] = closing_time.split(':').map(Number);

    let currentTime = new Date();
    currentTime.setHours(openHour, openMinute, 0, 0);

    const closingTimeDate = new Date();
    closingTimeDate.setHours(closeHour, closeMinute, 0, 0);

    while (currentTime.getTime() < closingTimeDate.getTime()) {
      allSlots.push(currentTime.toTimeString().split(' ')[0]);
      currentTime.setMinutes(currentTime.getMinutes() + 30); // 30-minute intervals
    }

    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => {
      const [slotHour, slotMinute] = slot.split(':').map(Number);
      const slotStart = new Date();
      slotStart.setHours(slotHour, slotMinute, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000); // Assuming 30 min slot duration

      for (const booked of bookedSlots) {
        const [bookedStartHour, bookedStartMinute] = booked.start.split(':').map(Number);
        const [bookedEndHour, bookedEndMinute] = booked.end.split(':').map(Number);

        const bookedStartTime = new Date();
        bookedStartTime.setHours(bookedStartHour, bookedStartMinute, 0, 0);
        const bookedEndTime = new Date();
        bookedEndTime.setHours(bookedEndHour, bookedEndMinute, 0, 0);

        // Check for overlap
        if (slotStart.getTime() < bookedEndTime.getTime() && slotEnd.getTime() > bookedStartTime.getTime()) {
          return false; // This slot overlaps with a booked slot
        }
      }
      return true; // This slot is available
    });

    return { timeSlots: availableSlots };
  } catch (error: any) {
    return { error: "Failed to get available time slots: " + error.message };
  }
}

export async function getAvailableShops() {
  try {
    const { data, error } = await supabase
      .from("shops")
      .select("id, name, type, address, email, phone, is_open, opening_time, closing_time")
      .eq("is_open", true)

    console.log("Supabase getAvailableShops data:", data);
    console.log("Supabase getAvailableShops error:", error);

    if (error) {
      return { error: "Failed to fetch available shops: " + error.message }
    }

    return { shops: data }
  } catch (error: any) {
    return { error: "Failed to fetch available shops: " + error.message }
  }
}

export async function getShopDetailsForCustomer(shopId: string) {
  try {
    console.log("Fetching details for shop ID:", shopId); // Log the shopId
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

    console.log("Supabase fetch shop details data:", data)
    console.log("Supabase fetch shop details error:", error)

    if (error) {
      return { error: "Failed to fetch shop details: " + error.message }
    }

    return { shop: data }
  } catch (error: any) {
    return { error: "Failed to fetch shop details: " + error.message }
  }
}

export async function getUpcomingBookings(customerId: string) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        shop:shops(name),
        barber:barbers(name)
      `,
      )
      .eq("customer_id", customerId)
      .gte("booking_date", new Date().toISOString().split('T')[0]) // Greater than or equal to today
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true })

    if (error) {
      return { error: "Failed to fetch upcoming bookings: " + error.message }
    }

    return { bookings: data }
  } catch (error: any) {
    return { error: "Failed to fetch upcoming bookings: " + error.message }
  }
}

export async function getPreviousBookings(customerId: string) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        shop:shops(name),
        barber:barbers(name)
      `,
      )
      .eq("customer_id", customerId)
      .lt("booking_date", new Date().toISOString().split('T')[0]) // Less than today
      .order("booking_date", { ascending: false })
      .order("booking_time", { ascending: false })

    if (error) {
      return { error: "Failed to fetch previous bookings: " + error.message }
    }

    return { bookings: data }
  } catch (error: any) {
    return { error: "Failed to fetch previous bookings: " + error.message }
  }
}

export async function getShopOwnerDashboard(shopId: string) {
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

export async function getAllData() {
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
