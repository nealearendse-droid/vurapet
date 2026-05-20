import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, billing, email, name } = await req.json();

    // HARDCODED - CHANGE THIS TO YOUR ACTUAL URL
    const APP_URL = "https://vurapet.vercel.app";

    const amount = "1.00";
    const itemName = `VuraPet ${plan} Plan - ${billing}`;

    const merchantId = "34840035";
    const merchantKey = "ikm9j75hs0xno";
    const passphrase = "Mason3009Blake";

    if (!email) {
      console.error("No email provided!");
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const pfData = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${APP_URL}/payment/success`,
      cancel_url: `${APP_URL}/pricing`,
      notify_url: `${APP_URL}/api/payfast/notify`,
      name_first: name?.split(" ")[0]?.slice(0, 50) || "User",
      name_last: name?.split(" ").slice(1).join(" ")?.slice(0, 50) || "",
      email_address: email,
      m_payment_id: `ORDER_${userId}_${Date.now()}`.slice(0, 100),
      amount: amount,
      item_name: itemName.slice(0, 100),
    };

    // Remove empty values
    const cleanedData: Record<string, string> = {};
    for (const [key, value] of Object.entries(pfData)) {
      if (value && value !== "") {
        cleanedData[key] = value;
      }
    }

    // Create signature
    const pfString = Object.keys(cleanedData)
      .sort()
      .map(key => `${key}=${cleanedData[key]}`)
      .join("&");

    const signatureString = pfString + "&passphrase=" + passphrase;
    const signature = crypto.createHash("md5").update(signatureString).digest("hex");

    // URL encode for form
    const encodedData: Record<string, string> = {};
    for (const [key, value] of Object.entries(cleanedData)) {
      encodedData[key] = encodeURIComponent(value).replace(/%20/g, "+");
    }

    console.log("Sending to PayFast:", {
      email: encodedData.email_address,
      return_url: encodedData.return_url,
    });

    return NextResponse.json({
      payfastUrl: "https://www.payfast.co.za/eng/process",
      data: { ...encodedData, signature },
    });

  } catch (error) {
    console.error("PayFast initiate error:", error);
    return NextResponse.json(
      { error: "Payment initiation failed" },
      { status: 500 }
    );
  }
}