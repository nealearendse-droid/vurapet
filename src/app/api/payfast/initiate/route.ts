import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, billing, email, name } = await req.json();

    const amount = plan === "pro" ? "99.00" : "149.00";
    const itemName = `VuraPet ${plan} plan - ${billing}`;

    // USE PAYFAST TEST CREDENTIALS (these are public test credentials)
    const data: Record<string, string> = {
      merchant_id: "10000100",  // PayFast's public test merchant ID
      merchant_key: "46f0cd694581a",  // PayFast's public test key
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

    // NO passphrase needed for test mode
    const sortedKeys = Object.keys(data).sort();
    let sigString = "";
    
    for (const key of sortedKeys) {
      const value = data[key];
      if (value && value !== "") {
        sigString += `${key}=${value}&`;
      }
    }
    
    sigString = sigString.slice(0, -1);
    // No passphrase for test mode
    
    const signature = crypto.createHash("md5").update(sigString).digest("hex");
    data.signature = signature;

    console.log("TEST MODE - Using PayFast public test credentials");
    
    return NextResponse.json({ 
      payfastUrl: "https://sandbox.payfast.co.za/eng/process", 
      data: data 
    });
    
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}