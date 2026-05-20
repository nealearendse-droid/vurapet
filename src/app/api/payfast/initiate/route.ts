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
    const passphrase = process.env.PAYFAST_PASSPHRASE?.trim(); // ADD THIS

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

    // Sort keys alphabetically
    const sortedKeys = Object.keys(cleanedData).sort();
    
    // Build the query string
    const pfString = sortedKeys
      .map(key => `${key}=${encodeURIComponent(cleanedData[key]).replace(/%20/g, "+")}`)
      .join("&");

    // CRITICAL: Add passphrase to the signature string
    const pfStringWithPassphrase = pfString + "&passphrase=" + passphrase;
    const signature = crypto.createHash("md5").update(pfStringWithPassphrase).digest("hex");

    console.log("🔐 Signature created WITH passphrase");
    console.log("Passphrase length:", passphrase?.length);

    return NextResponse.json({
      payfastUrl: "https://www.payfast.co.za/eng/process",
      data: { ...cleanedData, signature },
    });

  } catch (error) {
    console.error("PayFast initiate error:", error);
    return NextResponse.json(
      { error: "Payment initiation failed" },
      { status: 500 }
    );
  }
}