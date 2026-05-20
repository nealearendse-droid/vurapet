// /api/payfast/notify/route.ts
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log("📦 LIVE Webhook received");
    console.log("Raw data:", JSON.stringify(data, null, 2));

    // CRITICAL: Verify signature for LIVE
    // Build string from all fields EXCEPT signature
    const signatureData = { ...data };
    delete signatureData.signature;

    const pfString = Object.keys(signatureData)
      .sort()
      .map(key => {
        const value = signatureData[key];
        const encodedValue = encodeURIComponent(value)
          .replace(/%20/g, "+")
          .replace(/!/g, "%21")
          .replace(/'/g, "%27")
          .replace(/\(/g, "%28")
          .replace(/\)/g, "%29")
          .replace(/\*/g, "%2A");
        return `${key}=${encodedValue}`;
      })
      .join("&");

    const generatedSignature = crypto
      .createHash("md5")
      .update(pfString)
      .digest("hex");

    console.log("Expected signature:", generatedSignature);
    console.log("Received signature:", data.signature);

    if (generatedSignature !== data.signature) {
      console.error("❌ Signature verification FAILED!");
      console.log("String used:", pfString);
      return new Response("Invalid signature", { status: 400 });
    }

    console.log("✅ Signature verified for LIVE");

    if (data.payment_status !== "COMPLETE") {
      console.log("Payment not complete:", data.payment_status);
      return new Response("OK", { status: 200 });
    }

    // Process payment (same as before)
    const email = data.email_address;
    const itemName = data.item_name?.toLowerCase() || "";
    const plan = itemName.includes("family") ? "family" : "pro";
    const billing = itemName.includes("annual") ? "annual" : "monthly";

    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (fetchError || !profile) {
      console.error("❌ User not found:", email);
      return new Response("User not found", { status: 404 });
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + (billing === "annual" ? 12 : 1));

    await supabase
      .from("profiles")
      .update({
        plan: plan,
        subscription_plan: plan,
        plan_status: "active",
        plan_billing: billing,
        plan_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    console.log(`🎉 Upgraded ${email} to ${plan}! R${data.amount} payment`);
    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("❌ Webhook error:", error);
    return new Response("Server error", { status: 500 });
  }
}