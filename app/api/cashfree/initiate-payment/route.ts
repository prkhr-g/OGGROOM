import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const { bookingDetails } = await request.json();
    const {
      shop_id,
      customer_id,
      barber_id,
      service_ids,
      booking_date,
      booking_time,
      total_price,
      total_duration,
      customer_notes,
      customer_email,
      customer_phone,
    } = bookingDetails;

    const supabase = createServerClient();

    
    const { data: shopData, error: shopError } = await supabase
      .from("shops")
      .select("vendor_id")
      .eq("id", shop_id)
      .single();

    if (shopError || !shopData) {
      console.error("Error fetching shop data:", shopError);
      return NextResponse.json(
        { success: false, error: "Shop not found." },
        { status: 404 },
      );
    }

   
    const order_id = uuidv4();

    
    const { error: pendingBookingError } = await supabase
      .from("pending_bookings")
      .insert([
        {
          order_id,
          shop_id,
          customer_id,
          barber_id,
          service_ids,
          booking_date,
          booking_time,
          total_price,
          total_duration,
          customer_notes,
          status: "PENDING",
        },
      ]);

    if (pendingBookingError) {
      console.error("Error creating pending booking:", pendingBookingError);
      return NextResponse.json(
        { success: false, error: "Could not create a pending booking." },
        { status: 500 },
      );
    }

    
    const vendorId = shopData.vendor_id;
    const requestBody: any = {
      order_id: order_id,
      order_amount: total_price,
      order_currency: "INR",
      customer_details: {
        customer_id: customer_id,
        customer_email: customer_email,
        customer_phone: customer_phone,
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/confirmation?order_id=${order_id}`,
      },
    };

    if (vendorId) {
      requestBody.split = [
        {
          vendor_id: vendorId,
          amount: total_price,
        },
      ];
    }

    
    const cashfreeResponse = await fetch(
      `${process.env.CASHFREE_API_URL}/pg/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": process.env.CASHFREE_CLIENT_ID as string,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET as string,
          "x-api-version": "2022-09-01", // Using a stable, recent version
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (!cashfreeResponse.ok) {
      const errorData = await cashfreeResponse.json();
      console.error("Cashfree API Error:", errorData);
      return NextResponse.json(
        { success: false, error: errorData },
        { status: cashfreeResponse.status },
      );
    }

    const cashfreeData = await cashfreeResponse.json();
    return NextResponse.json({ success: true, ...cashfreeData });
  } catch (error: any) {
    console.error("Error initiating Cashfree payment:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
