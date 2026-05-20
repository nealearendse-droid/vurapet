import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, billing, email, name } = await req.json();

    const formData = {
      merchant_id: "34840035",
      merchant_key: "ikm9j75hs0xno",
      return_url: "https://vurapet.vercel.app/payment/success",
      cancel_url: "https://vurapet.vercel.app/pricing",
      notify_url: "https://vurapet.vercel.app/api/payfast/notify",
      name_first: "Shireen",
      name_last: "Arendse",
      email_address: "shireen.arendse80@gmail.com", // PLAIN EMAIL - NO ENCODING
      m_payment_id: "TEST_" + Date.now(),
      amount: "20.00",
      item_name: "VuraPet Test Payment"
    };

    // Create signature string with PLAIN values (NO encoding)
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

    // Send values as-is - DO NOT ENCODE!
    const dataToSend = { ...formData, signature };

    console.log("Sending to PayFast (NOT ENCODED):", dataToSend);

    return NextResponse.json({
      payfastUrl: "https://www.payfast.co.za/eng/process",
      data: dataToSend  // ← SEND AS IS, NO ENCODING
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}