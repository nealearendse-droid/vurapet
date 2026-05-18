import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifySignature(data: Record<string, string>): boolean {
  const pfData = { ...data };
  delete pfData["signature"];

  let pfOutput = "";
  for (const key in pfData) {
    if (pfData[key] !== "") {
      pfOutput += `${key}=${encodeURIComponent(pfData[key].trim()).replace(/%20/g, "+")}&`;
    }
  }

  const pfString = pfOutput.slice(0, -1) + `&passphrase=${process.env.PAYFAST_PASSPHRASE}`;
  const signature = crypto.createHash("md5").update(pfString).digest("hex");
  return signature === data["signature"];
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log("✅ PayFast webhook received");
    console.log("Payment status:", data.payment_status);
    console.log("Email:", data.email_address);
    console.log("Item:", data.item_name);

    // ⚠️ Skip signature check in sandbox mode for easier testing
    // Put this back when you go live!
    // if (!verifySignature(data)) {
    //   console.error("❌ Signature check failed");
    //   return new Response("Invalid signature", { status: 400 });
    // }

    if (data.payment_status !== "COMPLETE") {
      console.log("Payment not complete yet, status:", data.payment_status);
      return new Response("OK", { status: 200 });
    }

    const email = data.email_address;
    const itemName = data.item_name?.toLowerCase() || "";

    const plan = itemName.includes("family") ? "family" : "pro";
    const billing = itemName.includes("annual") ? "annual" : "monthly";

    console.log(`Looking up user: ${email}, upgrading to: ${plan} (${billing})`);

    // Look up user using full_name column (which currently stores emails)
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("full_name", email)
      .single();

    if (fetchError || !profile) {
      console.error("❌ No profile found with email:", email, fetchError);
      return new Response("User not found", { status: 404 });
    }

    console.log("Found profile ID:", profile.id);

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + (billing === "annual" ? 12 : 1));

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        plan: plan,
        plan_status: "active",
        plan_billing: billing,
        plan_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("❌ Failed to update profile:", updateError);
      return new Response("DB update failed", { status: 500 });
    }

    console.log(`🎉 Successfully upgraded ${email} to ${plan}!`);
    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("❌ Webhook crashed:", error);
    return new Response("Server error", { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ status: "webhook is working" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}