import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Get the form data from PayFast
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    // Verify the signature
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";
    
    // Remove signature from data for verification
    const receivedSignature = data.signature;
    delete data.signature;
    
    // Sort keys and build signature string
    const sortedKeys = Object.keys(data).sort();
    let sigString = "";
    for (const key of sortedKeys) {
      if (data[key] && data[key] !== "") {
        sigString += `${key}=${data[key]}&`;
      }
    }
    sigString = sigString.slice(0, -1);
    
    if (passphrase) {
      sigString += `&passphrase=${passphrase}`;
    }
    
    const calculatedSignature = crypto.createHash("md5").update(sigString).digest("hex");
    
    if (calculatedSignature !== receivedSignature) {
      console.error("Invalid signature from PayFast");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    
    // Payment is verified!
    const paymentStatus = data.payment_status;
    const userId = data.custom_str1;
    const plan = data.custom_str2;
    const billing = data.custom_str3;
    
    console.log(`Payment received from user ${userId}: ${paymentStatus} - ${plan} plan`);
    
    // TODO: Update user's subscription in your database
    // You'll need to add Supabase update code here later
    
    return NextResponse.json({ status: "success" });
    
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}