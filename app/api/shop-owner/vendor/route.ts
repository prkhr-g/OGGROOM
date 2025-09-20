import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // console.log('User in vendor API:', user);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { upi_id, account_holder, pan } = await request.json();

    // Fetch shop owner details and shop_id for the current user from shop_owners table
    const { data: shopOwnerDetails, error: fetchShopOwnerError } =
      await supabase
        .from("shop_owners")
        .select("name, email, phone, shop_id, vendor_id") // Added vendor_id
        .eq("id", user.id) // 'id' in shop_owners table is user.id
        .single();

    if (fetchShopOwnerError || !shopOwnerDetails) {
      console.error("Error fetching shop owner details:", fetchShopOwnerError);
      return NextResponse.json(
        {
          success: false,
          error: "Shop owner profile not found for the current user.",
        },
        { status: 404 },
      );
    }

    const { name, email, phone, shop_id, vendor_id } = shopOwnerDetails; // Destructure vendor_id
    const sanitizedShopId = shop_id.replace(/-/g, "_"); // Replace hyphens with underscores

    // If vendor_id already exists, return it
    if (vendor_id) {
      return NextResponse.json({ success: true, vendor_id: vendor_id });
    }

    const cashfreeRequestBody: any = {
      vendor_id: sanitizedShopId, // Using sanitizedShopId as vendor_id as per user's instruction
      status: "ACTIVE",
      name: name,
      email: email,
      phone: phone,
      verify_account: true,
      dashboard_access: true,
      schedule_option: 1, // Fixed value
      upi: {
        // From request body
        vpa: upi_id,
        account_holder: account_holder,
      },
      kyc_details: {
        account_type: "BUSINESS", // Fixed value
        business_type:
          "Professional Services (Doctors, Lawyers, Architects, CAs, and other Professionals)", // Fixed value
        pan: pan, // From request body
      },
    };

    const cashfreeResponse = await fetch(
      `${process.env.CASHFREE_API_URL}/pg/easy-split/vendors`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": process.env.CASHFREE_CLIENT_ID as string,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET as string,
          "x-api-version": "2025-01-01",
          "x-request-id": `req_${Date.now()}`,
        },
        body: JSON.stringify(cashfreeRequestBody),
      },
    );

    if (!cashfreeResponse.ok) {
      const errorText = await cashfreeResponse.text();
      console.error("Cashfree API Raw Error Response:", errorText);
      try {
        const errorData = JSON.parse(errorText);
        console.error("Cashfree API Error (Parsed):", errorData);

        // Check if the error is "vendor already exists"
        if (
          errorData.message &&
          errorData.message.includes("vendor already exists")
        ) {
          // If vendor already exists, assume the vendor_id is the sanitizedShopId
          const existing_vendor_id = sanitizedShopId;
          console.warn(
            `Vendor with ID ${existing_vendor_id} already exists in Cashfree. Updating database with this ID.`,
          );

          // Proceed to update shop_owners and shops tables with the existing_vendor_id
          const { error: ownerError } = await supabase
            .from("shop_owners")
            .update({ vendor_id: existing_vendor_id })
            .eq("id", user.id);

          if (ownerError) {
            console.error(
              "Error updating shop_owners table with existing vendor ID:",
              ownerError,
            );
            return NextResponse.json(
              {
                success: false,
                error:
                  "Failed to update shop owner profile with existing vendor ID.",
              },
              { status: 500 },
            );
          }

          const { error: shopError } = await supabase
            .from("shops")
            .update({ vendor_id: existing_vendor_id })
            .eq("id", shop_id);

          if (shopError) {
            console.error(
              "Error updating shops table with existing vendor ID:",
              shopError,
            );
            return NextResponse.json(
              {
                success: false,
                error: "Failed to update shop profile with existing vendor ID.",
              },
              { status: 500 },
            );
          }

          return NextResponse.json({
            success: true,
            vendor_id: existing_vendor_id,
          });
        }

        return NextResponse.json(
          { success: false, error: errorData },
          { status: cashfreeResponse.status },
        );
      } catch (parseError) {
        console.error(
          "Failed to parse Cashfree API error response as JSON:",
          parseError,
        );
        return NextResponse.json(
          {
            success: false,
            error: "Cashfree API returned non-JSON error: " + errorText,
          },
          { status: cashfreeResponse.status },
        );
      }
    }

    const cashfreeData = await cashfreeResponse.json();
    const created_vendor_id = cashfreeData.vendor_id;

    // Update shop_owners table
    const { error: ownerError } = await supabase
      .from("shop_owners")
      .update({ vendor_id: created_vendor_id })
      .eq("id", user.id); // Corrected to use 'id' column

    if (ownerError) {
      console.error("Error updating shop_owners table:", ownerError);
      // Note: You might want to handle this error more gracefully,
      // maybe by deleting the vendor from Cashfree if the DB update fails.
      return NextResponse.json(
        { success: false, error: "Failed to update shop owner profile." },
        { status: 500 },
      );
    }

    // Update shops table
    const { error: shopError } = await supabase
      .from("shops")
      .update({ vendor_id: created_vendor_id })
      .eq("id", shopId); // Use shopId to update the correct shop

    if (shopError) {
      console.error("Error updating shops table:", shopError);
      // Similar error handling consideration as above
      return NextResponse.json(
        { success: false, error: "Failed to update shop profile." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, vendor_id: created_vendor_id });
  } catch (error: any) {
    console.error("Error creating vendor:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
