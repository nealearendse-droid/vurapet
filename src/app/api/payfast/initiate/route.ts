import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, billing, email, name } = await req.json();

    const amount = "1.00";
    const itemName = `VuraPet ${plan} Plan - ${billing}`;

    // ✅ IMPORTANT: The ORDER of these fields matters for the signature!
    // PayFast is very picky - fields must be in this exact order.
    const pfData: Record<string, string> = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID!,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payfast/notify`,
      name_first: name?.split(" ")[0] || "User",
      // ✅ FIX 1: Always include name_last, even if empty string
      name_last: name?.split(" ").slice(1).join(" ") || "",
      email_address: email || "",
      m_payment_id: "ORDER_" + Date.now(),
      amount: amount,
      item_name: itemName,
    };

    // ✅ FIX 2: Include ALL fields (even empty ones) when building the signature string
    // PayFast includes empty fields - if you skip them, the signatures won't match!
    const pfString = Object.keys(pfData)
      .map((key) => {
        const value = pfData[key];
        // Only skip if the value is truly undefined or null - NOT empty string
        if (value === undefined || value === null) return null;
        return `${key}=${encodeURIComponent(value).replace(/%20/g, "+")}`;
      })
      .filter(Boolean)
      .join("&");

    // ✅ NO passphrase for live accounts (you got this right!)
    const signature = crypto.createHash("md5").update(pfString).digest("hex");

    // Log it so you can debug in Vercel logs if needed
    console.log("Signature string:", pfString);
    console.log("Signature:", signature);

    return NextResponse.json({
      payfastUrl: "https://www.payfast.co.za/eng/process",
      data: { ...pfData, signature },
    });

  } catch (error) {
    console.error("PayFast initiate error:", error);
    return NextResponse.json(
      { error: "Payment initiation failed" },
      { status: 500 }
    );
  }
}