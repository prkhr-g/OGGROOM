import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    const cashfreeResponse = await fetch(`${process.env.CASHFREE_API_URL}/pg/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_CLIENT_ID as string,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET as string,
      },
    });

    if (!cashfreeResponse.ok) {
      const errorData = await cashfreeResponse.json();
      console.error('Cashfree API Error:', errorData);
      return NextResponse.json({ success: false, error: errorData }, { status: cashfreeResponse.status });
    }

    const cashfreeData = await cashfreeResponse.json();
    const paymentStatus = cashfreeData.order_status; // Assuming order_status contains the payment status

    return NextResponse.json({ success: true, paymentStatus, orderDetails: cashfreeData });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ success: false, message: 'Internal server error during payment verification.' }, { status: 500 });
  }
}