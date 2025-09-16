import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  // console.log('User in vendor API:', user);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, email, phone, upi_id, vendor_id } = await request.json();

    const cashfreeRequestBody = {
      vendor_id: vendor_id,
      vendor_email: email,
      vendor_phone: phone,
      vendor_name: name,
      status: 'ACTIVE',
      verify_account: true,
      dashboard_access: true,
      settlement_cycle_id: 1, // T+1 cycle
      kyc_details: {
        account_type: 'BUSINESS',
        business_type: 'Professional Services',
        pan: 'TESTP1234A', // Placeholder PAN
        gst: '11AAAAA1111A1Z0', // Placeholder GST
        cin: 'L00000Aa0000AaA000000', // Placeholder CIN
        uidai: '753624181019', // Placeholder UIDAI
      },
    };

    const cashfreeResponse = await fetch(`${process.env.CASHFREE_API_URL}/pg/easy-split/vendors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_CLIENT_ID as string,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET as string,
        'x-api-version': '2025-01-01',
        'x-request-id': `req_${Date.now()}`,
      },
      body: JSON.stringify(cashfreeRequestBody),
    });

    if (!cashfreeResponse.ok) {
      const errorText = await cashfreeResponse.text();
      console.error('Cashfree API Raw Error Response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        console.error('Cashfree API Error (Parsed):', errorData);
        return NextResponse.json({ success: false, error: errorData }, { status: cashfreeResponse.status });
      } catch (parseError) {
        console.error('Failed to parse Cashfree API error response as JSON:', parseError);
        return NextResponse.json({ success: false, error: 'Cashfree API returned non-JSON error: ' + errorText }, { status: cashfreeResponse.status });
      }
    }

    const cashfreeData = await cashfreeResponse.json();
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