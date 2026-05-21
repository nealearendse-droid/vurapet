import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const PLAN_PRICES: Record<string, Record<string, string>> = {
  pro: { monthly: "49.00", annual: "470.00" },
  family: { monthly: "79.00", annual: "758.00" },
};

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, billing, email, name } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const amount = "1.00";
    const [firstName, ...rest] = (name || "VuraPet User").split(" ");
    const lastName = rest.join(" ") || "User";

    // PayFast requires this specific field order for signature
    const formData: Record<string, string> = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID!,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payfast/notify`,
      name_first: firstName,
      name_last: lastName,
      email_address: email,
      m_payment_id: `${userId}_${Date.now()}`,
      amount,
      item_name: `VuraPet ${plan.charAt(0).toUpperCase() + plan.slice(1)} ${billing}`,
    };

    // Build signature string: URL-encode values, preserve field order
    const signatureString =
      Object.entries(formData)
        .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, "+")}`)
        .join("&") +
      `&passphrase=${encodeURIComponent(process.env.PAYFAST_PASSPHRASE!).replace(/%20/g, "+")}`;

    const signature = crypto
      .createHash("md5")
      .update(signatureString)
      .digest("hex");

    return NextResponse.json({
      payfastUrl: "https://www.payfast.co.za/eng/process",
      data: { ...formData, signature },
    });
  } catch (error) {
    console.error("PayFast initiate error:", error);
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 });
  }
}