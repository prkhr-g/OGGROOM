"use server";

import { createServerClient } from "@/lib/supabase-server";

export async function getUpcomingBookings() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { bookings: [] };
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: bookingsData, error: bookingsError } = await supabase
    .from("bookings")
    .select(
      `
      id,
      booking_date,
      booking_time,
      status,
      service_ids,
      shops (
        id,
        name,
        address
      ),
      barbers ( name )
    `,
    )
    .eq("customer_id", user.id)
    .in("status", ["confirmed", "pending"])
    .gte("booking_date", today)
    .order("booking_date", { ascending: true })
    .order("booking_time", { ascending: true });

  if (bookingsError) {
    return { error: bookingsError.message };
  }

  if (!bookingsData || bookingsData.length === 0) {
    return { bookings: [] };
  }

  const serviceIds = [
    ...new Set(bookingsData.flatMap((b) => b.service_ids || [])),
  ];

  if (serviceIds.length === 0) {
    const bookingsWithEmptyServices = bookingsData.map((b) => ({
      ...b,
      services: [],
    }));
    return { bookings: bookingsWithEmptyServices };
  }

  const { data: servicesData, error: servicesError } = await supabase
    .from("services")
    .select("id, name, price, duration")
    .in("id", serviceIds);

  if (servicesError) {
    return { error: servicesError.message };
  }

  const servicesMap = new Map(servicesData.map((s) => [s.id, s]));

  const enrichedBookings = bookingsData.map((booking) => {
    const services = (booking.service_ids || [])
      .map((id) => servicesMap.get(id))
      .filter(Boolean);
    return { ...booking, services };
  });

  return { bookings: enrichedBookings };
}

export async function getPreviousBookings() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { bookings: [] };
  }

  // Step 1: Fetch previous bookings without the direct service join
  const { data: bookingsData, error: bookingsError } = await supabase
    .from("bookings")
    .select(
      `
      id,
      booking_date,
      booking_time,
      status,
      service_ids, 
      shops (
        id,
        name,
        address
      ),
      barbers ( name )
    `,
    )
    .eq("customer_id", user.id)
    .lt("booking_date", new Date().toISOString().split("T")[0])
    .order("booking_date", { ascending: false })
    .order("booking_time", { ascending: false });

  if (bookingsError) {
    return { error: bookingsError.message };
  }

  if (!bookingsData || bookingsData.length === 0) {
    return { bookings: [] };
  }

  // Step 2: Collect all unique service IDs from the bookings
  const serviceIds = [
    ...new Set(bookingsData.flatMap((b) => b.service_ids || [])),
  ];

  if (serviceIds.length === 0) {
    // If no services, just return bookings as is (with empty services array)
    const bookingsWithEmptyServices = bookingsData.map((b) => ({
      ...b,
      services: [],
    }));
    return { bookings: bookingsWithEmptyServices };
  }

  // Step 3: Fetch the details for all collected service IDs
  const { data: servicesData, error: servicesError } = await supabase
    .from("services")
    .select("id, name, price, duration")
    .in("id", serviceIds);

  if (servicesError) {
    return { error: servicesError.message };
  }

  // Step 4: Create a map of services for easy lookup
  const servicesMap = new Map(servicesData.map((s) => [s.id, s]));

  // Step 5: Combine the bookings with their service details
  const enrichedBookings = bookingsData.map((booking) => {
    const services = (booking.service_ids || [])
      .map((id) => servicesMap.get(id))
      .filter(Boolean);
    return { ...booking, services };
  });

  return { bookings: enrichedBookings };
}

export async function updateBookingStatusInDb(
  bookingId: number,
  newStatus: string,
) {
  const supabase = createServerClient();
  try {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { error: "Failed to update booking status: " + error.message };
  }
}
