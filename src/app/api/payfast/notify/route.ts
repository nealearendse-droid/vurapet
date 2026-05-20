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
    console.log("Payment status:", data.payment_status);

    // IMPORTANT: For signature verification, use raw values (not URL decoded)
    const signatureData = { ...data };
    delete signatureData.signature;

    // Create string with raw values (PayFast sends them URL encoded, but we use as-is)
    const pfString = Object.keys(signatureData)
      .sort()
      .filter(key => signatureData[key] && signatureData[key] !== "")
      .map(key => `${key}=${signatureData[key]}`)
      .join("&");

    const passphrase = process.env.PAYFAST_PASSPHRASE?.trim();
    const signatureString = pfString + "&passphrase=" + passphrase;
    const expectedSignature = crypto.createHash("md5").update(signatureString).digest("hex");

    console.log("Expected signature:", expectedSignature);
    console.log("Received signature:", data.signature);

    if (expectedSignature !== data.signature) {
      console.error("❌ Signature mismatch!");
      console.log("String used:", signatureString);
      return new Response("Invalid signature", { status: 400 });
    }

    console.log("✅ Signature verified!");

    if (data.payment_status !== "COMPLETE") {
      console.log("Payment not complete, ignoring");
      return new Response("OK", { status: 200 });
    }

    // Process the successful payment
    const email = data.email_address;
    const itemName = data.item_name?.toLowerCase() || "";
    const plan = itemName.includes("family") ? "family" : "pro";
    const billing = itemName.includes("annual") ? "annual" : "monthly";

    console.log(`Upgrading ${email} to ${plan} (${billing})`);

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

    const { error: updateError } = await supabase
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

    if (updateError) {
      console.error("❌ Update failed:", updateError);
      return new Response("DB update failed", { status: 500 });
    }

    console.log(`🎉 Successfully upgraded ${email} to ${plan}!`);
    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("❌ Webhook error:", error);
    return new Response("Server error", { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ status: "Webhook is working" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}