
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, email, phone, upi_id } = await request.json();

    // Use the user's ID as the vendor_id for idempotency
    const vendor_id = user.id;

    const cashfreeRequestBody = {
      vendor_id: vendor_id,
      vendor_email: email,
      vendor_phone: phone,
      vendor_name: name,
      upi: {
        vpa: upi_id
      },
      settlement_cycle_id: 1, // T+1 cycle
    };

    const cashfreeResponse = await fetch(`https://sandbox.cashfree.com/easysplit/v1/vendors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_CLIENT_ID as string,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET as string,
        'x-api-version': '2022-09-01',
        'x-request-id': `req_${Date.now()}`,
      },
      body: JSON.stringify(cashfreeRequestBody),
    });

    if (!cashfreeResponse.ok) {
      const errorText = await cashfreeResponse.text();
      console.error('Cashfree API Error Response Text:', errorText);
      try {
          const errorData = JSON.parse(errorText);
          console.error('Cashfree API Error:', errorData);
          return NextResponse.json({ success: false, error: errorData }, { status: cashfreeResponse.status });
      } catch (e) {
          return NextResponse.json({ success: false, error: 'Failed to parse Cashfree error response.' }, { status: cashfreeResponse.status });
      }
    }

    const responseText = await cashfreeResponse.text();
    console.log('Cashfree API Success Response Text:', responseText);
    let cashfreeData;
    try {
        cashfreeData = JSON.parse(responseText);
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Failed to parse Cashfree success response.' }, { status: 500 });
    }
    const created_vendor_id = cashfreeData.vendor_id;

    // Update shop_owners table
    const { error: ownerError } = await supabase
      .from('shop_owners')
      .update({ vendor_id: created_vendor_id })
      .eq('user_id', user.id);

    if (ownerError) {
      console.error('Error updating shop_owners table:', ownerError);
      // Note: You might want to handle this error more gracefully,
      // maybe by deleting the vendor from Cashfree if the DB update fails.
      return NextResponse.json({ success: false, error: 'Failed to update shop owner profile.' }, { status: 500 });
    }

    // Update shops table
    const { error: shopError } = await supabase
      .from('shops')
      .update({ vendor_id: created_vendor_id })
      .eq('owner_id', user.id);

    if (shopError) {
      console.error('Error updating shops table:', shopError);
      // Similar error handling consideration as above
      return NextResponse.json({ success: false, error: 'Failed to update shop profile.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, vendor_id: created_vendor_id });
  } catch (error: any) {
    console.error('Error creating vendor:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
