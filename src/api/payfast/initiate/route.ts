import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Payfast sandbox URLs for testing
const PAYFAST_URL = "https://sandbox.payfast.co.za/eng/process";

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, billing, email, name } = await req.json();

    // Prices in cents (Payfast uses rands with 2 decimals)
    const prices: Record<string, Record<string, string>> = {
      pro: { monthly: "99.00", annual: "799.00" },
      family: { monthly: "149.00", annual: "1199.00" },
    };

    const amount = prices[plan]?.[billing];
    if (!amount) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const isRecurring = true;
    const itemName = `VuraPet ${plan === "pro" ? "Full Protection" : "Family Plan"} - ${billing}`;

    // Build Payfast data object
    const data: Record<string, string> = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID!,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payfast/notify`,
      email_address: email,
      name_first: name || "VuraPet",
      name_last: "User",
      m_payment_id: `${userId}_${plan}_${billing}_${Date.now()}`,
      amount: amount,
      item_name: itemName,
      subscription_type: isRecurring ? "1" : "0",
      billing_date: new Date().toISOString().split("T")[0],
      recurring_amount: amount,
      frequency: billing === "monthly" ? "3" : "6",
      cycles: "0", // 0 = infinite
      custom_str1: userId,
      custom_str2: plan,
      custom_str3: billing,
    };

    // Generate signature
    const pfParamString = Object.entries(data)
      .map(([k, v]) => `${k}=${encodeURIComponent(v.trim()).replace(/%20/g, "+")}`)
      .join("&");

    const signatureString = process.env.PAYFAST_PASSPHRASE
      ? `${pfParamString}&passphrase=${encodeURIComponent(process.env.PAYFAST_PASSPHRASE!.trim()).replace(/%20/g, "+")}`
      : pfParamString;

    const signature = crypto
      .createHash("md5")
      .update(signatureString)
      .digest("hex");

    data.signature = signature;

    return NextResponse.json({ payfastUrl: PAYFAST_URL, data });
  } catch (err) {
    console.error("Payfast initiate error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}