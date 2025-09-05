
import { createServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // First, get the shop_id of the logged-in shop owner
    const { data: shopOwnerData, error: shopOwnerError } = await supabase
      .from('shop_owners')
      .select('shop_id')
      .eq('id', user.id)
      .single();

    if (shopOwnerError || !shopOwnerData) {
      console.error('Error fetching shop owner data:', shopOwnerError);
      return NextResponse.json({ error: 'Failed to fetch shop details' }, { status: 500 });
    }

    const { shop_id } = shopOwnerData;

    // Fetch reviews and bookings in parallel
    const [
      { data: reviews, error: reviewsError },
      { data: bookings, error: bookingsError },
    ] = await Promise.all([
      supabase.from('reviews').select('*').eq('shop_id', shop_id),
      supabase.from('bookings').select('*').eq('shop_id', shop_id),
    ]);

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    return NextResponse.json({ reviews, bookings });
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
