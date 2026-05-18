import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from '@supabase/supabase-js';

// Lazy-load Supabase client (only creates it when needed)
let supabaseClient: any = null;

function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      throw new Error("Supabase configuration missing");
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

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
      const userEmail = data.email_address;
      
      if (userEmail) {
        try {
          const supabase = getSupabase();
          
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);
          
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
        } catch (supabaseError) {
          console.error('Supabase error:', supabaseError);
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