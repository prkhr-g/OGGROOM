
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  const { otp } = await request.json();
  const { bookingId } = params;

  if (!otp) {
    return NextResponse.json({ error: "OTP is required." }, { status: 400 });
  }

  const supabase = createServerClient();

  try {
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("completion_otp, status")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (booking.status !== "confirmed") {
      return NextResponse.json(
        { error: "Booking is not in a confirm status." },
        { status: 400 }
      );
    }

    if (booking.completion_otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "completed" })
      .eq("id", bookingId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
