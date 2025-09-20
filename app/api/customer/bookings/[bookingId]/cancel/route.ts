import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function PATCH(
  request: Request,
  { params }: { params: { bookingId: string } },
) {
  const supabase = createServerClient();
  const { bookingId } = params;

  if (!bookingId) {
    return NextResponse.json(
      { error: "Booking ID is required" },
      { status: 400 },
    );
  }

  try {
    // The RLS policy will ensure that only the customer who owns the booking can update it.
    const { data, error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) {
      console.error("Error cancelling booking:", error);
      if (error.code === "PGRST116") {
        // PostgREST error for no rows found
        return NextResponse.json(
          {
            error:
              "Booking not found or you do not have permission to cancel it.",
          },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: "Failed to cancel booking." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, cancelledBooking: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
