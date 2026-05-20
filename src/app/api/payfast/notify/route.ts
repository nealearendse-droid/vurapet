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

    console.log("📦 Webhook received");

    // VERIFY SIGNATURE WITH PASSPHRASE
    const signatureData = { ...data };
    delete signatureData.signature;

    // Sort keys alphabetically
    const sortedKeys = Object.keys(signatureData).sort();
    
    const pfString = sortedKeys
      .filter(key => signatureData[key] && signatureData[key] !== "")
      .map(key => `${key}=${encodeURIComponent(signatureData[key]).replace(/%20/g, "+")}`)
      .join("&");

    // CRITICAL: Add the passphrase
    const passphrase = process.env.PAYFAST_PASSPHRASE?.trim();
    const pfStringWithPassphrase = pfString + "&passphrase=" + passphrase;
    const expectedSignature = crypto.createHash("md5").update(pfStringWithPassphrase).digest("hex");

    console.log("Expected signature:", expectedSignature);
    console.log("Received signature:", data.signature);

    if (expectedSignature !== data.signature) {
      console.error("❌ Signature mismatch!");
      return new Response("Invalid signature", { status: 400 });
    }

    console.log("✅ Signature verified with passphrase");

    if (data.payment_status !== "COMPLETE") {
      console.log("Payment status:", data.payment_status);
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

    console.log(`🎉 Upgraded ${email} to ${plan}!`);
    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("❌ Webhook error:", error);
    return new Response("Server error", { status: 500 });
  }
}