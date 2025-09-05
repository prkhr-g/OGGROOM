
import { createServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { booking_id, rating, feedback } = await request.json();

  if (!booking_id || !rating) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // First, get the shop_id from the booking
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('shop_id, customer_id')
      .eq('id', booking_id)
      .single();

    if (bookingError || !bookingData) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if the user is the owner of the booking
    if (bookingData.customer_id !== user.id) {
      return NextResponse.json({ error: 'You are not authorized to review this booking' }, { status: 403 });
    }

    // Insert the review
    const { error: reviewError } = await supabase.from('reviews').insert([
      {
        booking_id,
        rating,
        feedback,
        customer_id: user.id,
        shop_id: bookingData.shop_id,
      },
    ]);

    if (reviewError) {
      return NextResponse.json({ error: reviewError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Review submitted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
