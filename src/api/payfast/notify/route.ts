import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const data: Record<string, string> = {};
    params.forEach((value, key) => { data[key] = value; });

    // Verify signature from Payfast
    const receivedSignature = data.signature;
    delete data.signature;

    const pfParamString = Object.entries(data)
      .map(([k, v]) => `${k}=${encodeURIComponent(v.trim()).replace(/%20/g, "+")}`)
      .join("&");

    const signatureString = process.env.PAYFAST_PASSPHRASE
      ? `${pfParamString}&passphrase=${encodeURIComponent(process.env.PAYFAST_PASSPHRASE!.trim()).replace(/%20/g, "+")}`
      : pfParamString;

    const expectedSignature = crypto
      .createHash("md5")
      .update(signatureString)
      .digest("hex");

    if (expectedSignature !== receivedSignature) {
      console.error("Invalid Payfast signature");
      return new NextResponse("Invalid signature", { status: 400 });
    }

    // Only process completed payments
    if (data.payment_status !== "COMPLETE") {
      return new NextResponse("OK", { status: 200 });
    }

    // Extract our custom data
    const userId = data.custom_str1;
    const plan = data.custom_str2;
    const billing = data.custom_str3;
    const payfastToken = data.token; // subscription token

    // Set expiry date
    const expiresAt = billing === "annual"
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Update user's plan in Supabase
    const { error } = await supabase
      .from("profiles")
      .update({
        plan: plan,
        plan_status: "active",
        plan_billing: billing,
        plan_expires_at: expiresAt.toISOString(),
        payfast_token: payfastToken || null,
      })
      .eq("id", userId);

    if (error) {
      console.error("Supabase update error:", error);
      return new NextResponse("DB error", { status: 500 });
    }

    console.log(`✅ Plan updated for user ${userId}: ${plan} (${billing})`);
    return new NextResponse("OK", { status: 200 });

  } catch (err) {
    console.error("Notify error:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}