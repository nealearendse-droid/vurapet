import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const PAYFAST_URL = "https://sandbox.payfast.co.za/eng/process";

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, billing, email, name } = await req.json();

    const prices: Record<string, Record<string, string>> = {
      pro: { monthly: "99.00", annual: "799.00" },
      family: { monthly: "149.00", annual: "1199.00" },
    };

    const amount = prices[plan]?.[billing];
    if (!amount) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const nameParts = (name && !name.includes("@")) ? name.split(" ") : ["VuraPet", "User"];
    const firstName = nameParts[0] || "VuraPet";
    const lastName = nameParts.slice(1).join(" ") || "User";
    const itemName = `VuraPet ${plan === "pro" ? "Full Protection" : "Family Plan"} - ${billing}`;

    // IMPORTANT: Do NOT encode values when building signature string
    const data: Record<string, string> = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID!,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payfast/notify`,
      name_first: firstName,
      name_last: lastName,
      email_address: email,
      m_payment_id: `${userId}_${plan}_${billing}`,
      amount: amount,
      item_name: itemName,
      subscription_type: "1",
      billing_date: new Date().toISOString().split("T")[0],
      recurring_amount: amount,
      frequency: billing === "monthly" ? "3" : "6",
      cycles: "0",
      custom_str1: userId,
      custom_str2: plan,
      custom_str3: billing,
    };

    // Generate signature correctly - NO encoding for signature string
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";
    
    // Sort the data alphabetically by key
    const sortedKeys = Object.keys(data).sort();
    let sigString = "";
    for (const key of sortedKeys) {
      if (data[key] && data[key] !== "") {
        sigString += `${key}=${data[key]}&`;
      }
    }
    // Remove trailing &
    sigString = sigString.slice(0, -1);
    
    // Add passphrase if it exists
    if (passphrase) {
      sigString += `&passphrase=${passphrase}`;
    }
    
    // Generate MD5 hash
    const signature = crypto.createHash("md5").update(sigString).digest("hex");

    // Log for debugging
    console.log("=== PAYFAST DEBUG ===");
    console.log("Merchant ID:", data.merchant_id);
    console.log("Merchant Key:", data.merchant_key);
    console.log("Amount:", data.amount);
    console.log("Signature String:", sigString);
    console.log("Generated Signature:", signature);
    console.log("Passphrase used:", passphrase ? "YES" : "NO");
    console.log("===================");

    // Create data for PayFast form (this gets URL-encoded when submitted)
    const formData = { ...data, signature };

    return NextResponse.json({ payfastUrl: PAYFAST_URL, data: formData });
  } catch (err) {
    console.error("Payfast initiate error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}