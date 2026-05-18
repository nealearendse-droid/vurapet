import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);
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
    
        // Update user's subscription in Supabase
    if (paymentStatus === 'COMPLETE') {
      // Find the user by email (PayFast sends email in data.email_address)
      const userEmail = data.email_address;
      
      if (userEmail) {
        // Calculate when Pro expires (30 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        
        // Update the user in Supabase
        const { error: updateError } = await supabase
          .from('users')
          .update({
            is_pro: true,
            pro_plan: plan,
            pro_billing: billing,
            pro_expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('email', userEmail);
        
        if (updateError) {
          console.error('Error updating user:', updateError);
        } else {
          console.log(`✅ User ${userEmail} upgraded to ${plan} plan`);
        }
      } else {
        console.warn('No email found in PayFast notification');
      }
    } else {
      console.log(`Payment status: ${paymentStatus} - not upgrading user`);
    }
    
    return NextResponse.json({ status: "success" });
    
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}