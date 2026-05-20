import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, billing, email, name } = await req.json();

    // 🔴 FORCED EMAIL FOR TESTING - REMOVE AFTER
    const forcedEmail = "test@vurapet.com";

    const domain = "https://vurapet.vercel.app";
    const merchant_id = "34840035";
    const merchant_key = "ikm9j75hs0xno";
    const passphrase = "Mason3009Blake";
    
    const amount = "1.00";
    const item_name = `VuraPet ${plan} Plan - ${billing}`;
    const first_name = name?.split(" ")[0]?.trim() || "Test";
    const last_name = name?.split(" ").slice(1).join(" ")?.trim() || "User";

    const pfData = {
      merchant_id: merchant_id,
      merchant_key: merchant_key,
      return_url: `${domain}/payment/success`,
      cancel_url: `${domain}/pricing`,
      notify_url: `${domain}/api/payfast/notify`,
      name_first: first_name,
      name_last: last_name,
      email_address: forcedEmail, // 🔴 USING FORCED EMAIL
      m_payment_id: `ORDER_${userId}_${Date.now()}`,
      amount: amount,
      item_name: item_name
    };

    // Build signature
    const signatureString = Object.keys(pfData)
      .sort()
      .map(key => `${key}=${pfData[key]}`)
      .join("&") + `&passphrase=${passphrase}`;

    const signature = crypto.createHash("md5").update(signatureString).digest("hex");

    // Encode for form
    const formData: Record<string, string> = {};
    for (const [key, value] of Object.entries(pfData)) {
      formData[key] = encodeURIComponent(value).replace(/%20/g, "+");
    }
    formData.signature = signature;

    console.log("Sending email:", forcedEmail);

    return NextResponse.json({
      payfastUrl: "https://www.payfast.co.za/eng/process",
      data: formData
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Payment initiation failed" },
      { status: 500 }
    );
  }
}