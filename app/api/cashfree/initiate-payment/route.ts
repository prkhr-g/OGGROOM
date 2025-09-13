import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { orderDetails } = await request.json();
    const { orderId, amount, currency, customerDetails, shopId } = orderDetails;

    const supabase = createServerClient();
    const { data: shopData, error: shopError } = await supabase
      .from('shops')
      .select('vendor_id')
      .eq('id', shopId)
      .single();

    if (shopError || !shopData) {
      console.error('Error fetching shop data:', shopError);
      return NextResponse.json({ success: false, error: 'Shop not found or error fetching shop details.' }, { status: 404 });
    }

    const vendorId = shopData.vendor_id;

    let requestBody: any = {
      order_id: orderId,
      order_amount: amount,
      order_currency: currency,
      customer_details: customerDetails,
    };

    if (vendorId) {
      requestBody.split = [
        {
          vendor_id: vendorId,
          amount: amount,
        },
      ];
    }

    const cashfreeResponse = await fetch(`${process.env.CASHFREE_API_URL}/pg/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_CLIENT_ID as string,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET as string,
        'x-api-version': '2022-09-01',
      },
      body: JSON.stringify(requestBody),
    });

    if (!cashfreeResponse.ok) {
      const errorData = await cashfreeResponse.json();
      console.error('Cashfree API Error:', errorData);
      return NextResponse.json({ success: false, error: errorData }, { status: cashfreeResponse.status });
    }

    const cashfreeData = await cashfreeResponse.json();
    return NextResponse.json({ success: true, ...cashfreeData });
  } catch (error: any) {
    console.error('Error initiating Cashfree payment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
