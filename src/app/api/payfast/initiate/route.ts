import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, billing, email, name } = await req.json();

    // EVERYTHING HARDCODED - NOTHING FANCY
    const formData = {
      merchant_id: "34840035",
      merchant_key: "ikm9j75hs0xno",
      return_url: "https://vurapet.vercel.app/payment/success",
      cancel_url: "https://vurapet.vercel.app/pricing",
      notify_url: "https://vurapet.vercel.app/api/payfast/notify",
      name_first: "Test",
      name_last: "User",
      email_address: "test@vurapet.com",
      m_payment_id: "TEST_" + Date.now(),
      amount: "1.00",
      item_name: "VuraPet Test Payment"
    };

    // Create signature string in EXACT PayFast format
    let signatureString = "";
    const keys = Object.keys(formData).sort();
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = formData[key as keyof typeof formData];
      if (i > 0) signatureString += "&";
      signatureString += `${key}=${value}`;
    }
    signatureString += "&passphrase=Mason3009Blake";
    
    const signature = crypto.createHash("md5").update(signatureString).digest("hex");

    // URL encode for form submission
    const encodedData: any = {};
    for (const key in formData) {
      encodedData[key] = encodeURIComponent(formData[key as keyof typeof formData]).replace(/%20/g, "+");
    }
    encodedData.signature = signature;

    console.log("SENDING:", encodedData);

    return NextResponse.json({
      payfastUrl: "https://www.payfast.co.za/eng/process",
      data: encodedData
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}