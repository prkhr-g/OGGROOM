import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key for admin operations
export const createAdminClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!supabaseServiceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for admin operations")
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function get_booked_time_slots(shop_id: string, booking_date: string, service_ids: number[]) {
  const { data, error } = await supabase
    .from('bookings')
    .select('booking_time')
    .eq('shop_id', shop_id)
    .eq('booking_date', booking_date)
    .in('service_ids', service_ids);

  if (error) {
    console.error('Error fetching booked time slots:', error);
    return [];
  }

  return data.map(booking => booking.booking_time);
}