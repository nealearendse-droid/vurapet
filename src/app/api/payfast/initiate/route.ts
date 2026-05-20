// /api/payfast/initiate/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, billing, email, name } = await req.json();

    const amount = "1.00"; // Your R1 test amount
    const itemName = `VuraPet ${plan} Plan - ${billing}`;

    // CRITICAL: For LIVE, fields must be in EXACT order and NO extra fields
    const pfData = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID!.trim(),
      merchant_key: process.env.PAYFAST_MERCHANT_KEY!.trim(),
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payfast/notify`,
      name_first: name?.split(" ")[0]?.substring(0, 50) || "User",
      name_last: name?.split(" ").slice(1).join(" ")?.substring(0, 50) || "",
      email_address: email?.substring(0, 100) || "",
      m_payment_id: `ORDER_${userId}_${Date.now()}`.substring(0, 100),
      amount: amount,
      item_name: itemName.substring(0, 100),
    };

    // CRITICAL: Remove ANY undefined or empty values
    const cleanedData: Record<string, string> = {};
    Object.keys(pfData).forEach(key => {
      const value = pfData[key as keyof typeof pfData];
      if (value && value !== "") {
        cleanedData[key] = value;
      }
    });

    // CRITICAL: Build string in EXACT order PayFast expects
    const pfString = Object.keys(cleanedData)
      .sort() // Sort alphabetically as PayFast requires
      .map(key => {
        // Encode values correctly for LIVE
        const encodedValue = encodeURIComponent(cleanedData[key])
          .replace(/%20/g, "+")
          .replace(/!/g, "%21")
          .replace(/'/g, "%27")
          .replace(/\(/g, "%28")
          .replace(/\)/g, "%29")
          .replace(/\*/g, "%2A");
        return `${key}=${encodedValue}`;
      })
      .join("&");

    // MD5 signature - NO passphrase for LIVE
    const signature = crypto
      .createHash("md5")
      .update(pfString)
      .digest("hex");

    console.log("🔐 LIVE Signature String:", pfString);
    console.log("🔑 Generated Signature:", signature);
    console.log("💰 Amount:", amount);
    console.log("🏪 Merchant ID:", cleanedData.merchant_id);

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