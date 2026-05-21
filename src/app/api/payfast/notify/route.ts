import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const data: Record<string, string> = {};
    params.forEach((value, key) => { data[key] = value; });

    console.log("📦 Webhook received:", data.payment_status);

    const signatureString =
      body
        .split("&")
        .filter((pair) => !pair.startsWith("signature="))
        .join("&") +
      `&passphrase=${encodeURIComponent(process.env.PAYFAST_PASSPHRASE!).replace(/%20/g, "+")}`;

    const expectedSignature = crypto
      .createHash("md5")
      .update(signatureString)
      .digest("hex");

    if (expectedSignature !== data.signature) {
      console.error("❌ Signature mismatch");
      return new Response("Invalid signature", { status: 400 });
    }

    console.log("✅ Signature verified");

    if (data.payment_status !== "COMPLETE") {
      return new Response("OK", { status: 200 });
    }

    const email = data.email_address;
    const itemName = data.item_name?.toLowerCase() ?? "";
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

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        plan,
        subscription_plan: plan,
        plan_status: "active",
        plan_billing: billing,
        plan_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("❌ DB update failed:", updateError);
      return new Response("DB update failed", { status: 500 });
    }

    console.log(`🎉 Upgraded ${email} to ${plan} (${billing})`);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return new Response("Server error", { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ status: "Webhook active" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}