import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const { orderId } = await request.json();

  if (!orderId) {
    return NextResponse.json(
      { success: false, error: "Order ID is required." },
      { status: 400 },
    );
  }

  const supabase = createServerClient();

  try {
    
    const cashfreeResponse = await fetch(
      `${process.env.CASHFREE_API_URL}/pg/orders/${orderId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": process.env.CASHFREE_CLIENT_ID as string,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET as string,
          "x-api-version": "2025-01-01",
        },
      },
    );

    if (!cashfreeResponse.ok) {
      const errorData = await cashfreeResponse.json();
      console.error("Cashfree API Error on verification:", errorData);
      throw new Error("Failed to verify payment with Cashfree.");
    }

    const cashfreeData = await cashfreeResponse.json();

    
    if (cashfreeData.order_status !== "PAID") {
      return NextResponse.json(
        {
          success: false,
          error: `Payment status is ${cashfreeData.order_status}`,
        },
        { status: 400 },
      );
    }

    
    const { data: pendingBooking, error: fetchError } = await supabase
      .from("pending_bookings")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (fetchError || !pendingBooking) {
      console.error("Error fetching pending booking:", fetchError);
      throw new Error("Pending booking not found.");
    }

    // 4. Check if the booking is still pending to prevent replay attacks
    if (pendingBooking.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "Booking has already been processed." },
        { status: 409 },
      );
    }

    
    const completionOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const { error: bookingError } = await supabase.from("bookings").insert([
      {
        customer_id: pendingBooking.customer_id,
        shop_id: pendingBooking.shop_id,
        barber_id: pendingBooking.barber_id,
        service_ids: pendingBooking.service_ids,
        booking_date: pendingBooking.booking_date,
        booking_time: pendingBooking.booking_time,
        total_price: pendingBooking.total_price,
        total_duration: pendingBooking.total_duration,
        customer_notes: pendingBooking.customer_notes,
        status: "confirmed", // Set status to confirmed
        completion_otp: completionOtp,
      },
    ]);

    if (bookingError) {
      console.error("Error creating final booking:", bookingError);
     
      throw new Error("Failed to create the final booking.");
    }

    
    const { error: updateError } = await supabase
      .from("pending_bookings")
      .update({ status: "COMPLETED" })
      .eq("order_id", orderId);

    if (updateError) {
     
      console.error(
        "CRITICAL: Failed to update pending booking status after creation:",
        updateError,
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in payment verification process:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
