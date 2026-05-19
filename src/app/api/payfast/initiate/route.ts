import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, billing, email, name } = await req.json();

    const amount = "1.00";
    const itemName = `VuraPet ${plan} Plan - ${billing}`;

    const pfData: Record<string, string> = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID!,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payfast/notify`,
      name_first: name?.split(" ")[0] || "User",
      name_last: name?.split(" ").slice(1).join(" ") || "",
      email_address: email || "",
      m_payment_id: "ORDER_" + Date.now(),
      amount: amount,
      item_name: itemName,
    };

    // 👇 THIS IS THE KEY FIX - skip empty fields for live PayFast
    const pfString = Object.keys(pfData)
      .filter((key) => {
        const value = pfData[key];
        return value !== undefined && value !== null && value !== "";
      })
      .map((key) => {
        return `${key}=${encodeURIComponent(pfData[key]).replace(/%20/g, "+")}`;
      })
      .join("&");

    // No passphrase for live accounts
    const signature = crypto.createHash("md5").update(pfString).digest("hex");

    console.log("Signature string:", pfString);
    console.log("Signature:", signature);

    return NextResponse.json({
      payfastUrl: "https://www.payfast.co.za/eng/process",
      data: { ...pfData, signature },
    });

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