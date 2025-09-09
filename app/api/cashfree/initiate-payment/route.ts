import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { orderDetails } = await request.json();

    // In a real application, you would:
    // 1. Validate orderDetails
    // 2. Call Cashfree API to create an order and get a payment link
    //    (e.g., using Cashfree SDK or direct HTTP request)
    // 3. Handle Cashfree API response (success/failure)

    const { orderId, amount, currency, customerDetails } = orderDetails;

    const requestBody = {
      order_id: orderId,
      order_amount: amount,
      order_currency: currency,
      customer_details: customerDetails,
    };

    const cashfreeResponse = await fetch(`${process.env.CASHFREE_API_URL}/pg/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_CLIENT_ID as string,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET as string,
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