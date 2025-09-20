import { createServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { shopId: string } },
) {
  const supabase = createServerClient();
  const { shopId } = params;

  if (!shopId) {
    return NextResponse.json({ error: "Shop ID is required" }, { status: 400 });
  }

  try {
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("shop_id", shopId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
