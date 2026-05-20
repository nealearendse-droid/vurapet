// /api/payfast/initiate/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, billing, email, name } = await req.json();

    const amount = "1.00";
    const itemName = `VuraPet ${plan} Plan - ${billing}`;

    const merchantId = process.env.PAYFAST_MERCHANT_ID?.trim();
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY?.trim();
    const passphrase = process.env.PAYFAST_PASSPHRASE?.trim();

    // IMPORTANT: Order matters - use EXACTLY this order
    const pfData = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payfast/notify`,
      name_first: name?.split(" ")[0]?.slice(0, 50) || "User",
      name_last: name?.split(" ").slice(1).join(" ")?.slice(0, 50) || "",
      email_address: email?.slice(0, 100) || "",
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

    // Create the query string WITHOUT encoding the values for signature
    const pfString = Object.keys(cleanedData)
      .sort()
      .map(key => `${key}=${cleanedData[key]}`)
      .join("&");

    // CRITICAL FIX: Add passphrase directly, then MD5
    const signatureString = pfString + "&passphrase=" + passphrase;
    const signature = crypto.createHash("md5").update(signatureString).digest("hex");

    console.log("🔐 Signature string (for verification):", signatureString);
    console.log("🔑 Signature:", signature);

    // For the actual form submission, we need to URL encode the values
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