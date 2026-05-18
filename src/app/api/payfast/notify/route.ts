import { createClient } from "@supabase/supabase-js";

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

    console.log("✅ PayFast webhook received");
    console.log("Full data:", JSON.stringify(data));

    // Signature check skipped for sandbox testing
    
    if (data.payment_status !== "COMPLETE") {
      console.log("Not complete, status:", data.payment_status);
      return new Response("OK", { status: 200 });
    }

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
      console.error("❌ User not found:", email, fetchError);
      return new Response("User not found", { status: 404 });
    }

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
      console.error("❌ Update failed:", updateError);
      return new Response("DB update failed", { status: 500 });
    }

    console.log(`🎉 Upgraded ${email} to ${plan}!`);
    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("❌ Crashed:", error);
    return new Response("Server error", { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ status: "webhook is working" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}