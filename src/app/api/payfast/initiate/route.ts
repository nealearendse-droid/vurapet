// /api/payfast/initiate/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, billing, email, name } = await req.json();

    // CRITICAL FIX: Use hardcoded URL for now
    const APP_URL = "https://vurapet.vercel.app"; // Your actual domain

    const amount = "1.00";
    const itemName = `VuraPet ${plan} Plan - ${billing}`;

    const merchantId = process.env.PAYFAST_MERCHANT_ID?.trim();
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY?.trim();
    const passphrase = process.env.PAYFAST_PASSPHRASE?.trim();

    // Make SURE email exists
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
      email_address: email, // Use email directly
      m_payment_id: `ORDER_${userId}_${Date.now()}`.slice(0, 100),
      amount: amount,
      item_name: itemName.slice(0, 100),
    };

    console.log("Sending to PayFast:", {
      email: pfData.email_address,
      return_url: pfData.return_url,
      cancel_url: pfData.cancel_url,
      notify_url: pfData.notify_url,
    });

    // Remove empty values
    const cleanedData: Record<string, string> = {};
    for (const [key, value] of Object.entries(pfData)) {
      if (value && value !== "") {
        cleanedData[key] = value;
      }
    }

    // Create signature with RAW values (no encoding)
    const pfString = Object.keys(cleanedData)
      .sort()
      .map(key => `${key}=${cleanedData[key]}`)
      .join("&");

    const signatureString = pfString + "&passphrase=" + passphrase;
    const signature = crypto.createHash("md5").update(signatureString).digest("hex");

    // URL encode values for form submission
    const encodedData: Record<string, string> = {};
    for (const [key, value] of Object.entries(cleanedData)) {
      encodedData[key] = encodeURIComponent(value).replace(/%20/g, "+");
    }

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