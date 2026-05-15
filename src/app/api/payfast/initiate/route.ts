import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, billing, email, name } = await req.json();

    const amount = plan === "pro" ? "99.00" : "149.00";
    const itemName = `VuraPet ${plan} plan - ${billing}`;

    // PUBLIC TEST CREDENTIALS - These ALWAYS work!
    const data: Record<string, string> = {
      merchant_id: "10000100",
      merchant_key: "46f0cd694581a",
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payfast/notify`,
      name_first: name?.split(" ")[0] || "Test",
      name_last: name?.split(" ")[1] || "User",
      email_address: email,
      m_payment_id: `TEST_${Date.now()}`,
      amount: amount,
      item_name: itemName,
    };

    // Generate signature (NO passphrase for public test)
    const sortedKeys = Object.keys(data).sort();
    let pfOutput = '';
    for (const key of sortedKeys) {
      if (data[key] !== '') {
        pfOutput += key + '=' + encodeURIComponent(data[key].trim()) + '&';
      }
    }
    let getString = pfOutput.substring(0, pfOutput.length - 1);
    const signature = crypto.createHash('md5').update(getString).digest('hex');
    data.signature = signature;

    return NextResponse.json({ 
      payfastUrl: "https://sandbox.payfast.co.za/eng/process", 
      data: data 
    });
    
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}