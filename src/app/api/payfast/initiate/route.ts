import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, billing, email, name } = await req.json();

    const amount = plan === "pro" ? "99.00" : "149.00";
    const itemName = `VuraPet ${plan} plan - ${billing}`;

    // YOUR CURRENT CREDENTIALS
    const data: Record<string, string> = {
      merchant_id: "10048910",
      merchant_key: "223uc7n6ytl4n",
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payfast/notify`,
      name_first: name?.split(" ")[0] || "Test",
      name_last: name?.split(" ")[1] || "User",
      email_address: email,
      m_payment_id: `TEST_${Date.now()}`,
      amount: amount,
      item_name: itemName,
    };

    const passphrase = "Test1234578";
    
    // Method 1: Standard PayFast signature method
    const sortedKeys = Object.keys(data).sort();
    let sigString = "";
    for (const key of sortedKeys) {
      if (data[key] && data[key] !== "") {
        sigString += `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}&`;
      }
    }
    sigString = sigString.slice(0, -1);
    
    // Add passphrase if it exists
    if (passphrase) {
      sigString += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`;
    }
    
    const signature1 = crypto.createHash("md5").update(sigString).digest("hex");
    
    // Method 2: Without encoding (some versions work better)
    let sigString2 = "";
    for (const key of sortedKeys) {
      if (data[key] && data[key] !== "") {
        sigString2 += `${key}=${data[key]}&`;
      }
    }
    sigString2 = sigString2.slice(0, -1);
    if (passphrase) {
      sigString2 += `&passphrase=${passphrase}`;
    }
    const signature2 = crypto.createHash("md5").update(sigString2).digest("hex");
    
    // Method 3: Exactly like PayFast PHP example
    function getSignature($data, $passPhrase = null) {
      $pfOutput = '';
      foreach ($data as $key => $val) {
        if ($val !== '') {
          $pfOutput .= $key . '=' . urlencode(trim($val)) . '&';
        }
      }
      $getString = substr($pfOutput, 0, -1);
      if ($passPhrase !== null) {
        $getString .= '&passphrase=' . urlencode(trim($passPhrase));
      }
      return md5($getString);
    }
    
    // Convert to JavaScript equivalent
    let pfOutput = '';
    for (const key of sortedKeys) {
      const val = data[key];
      if (val !== '') {
        pfOutput += key + '=' + encodeURIComponent(val.trim()) + '&';
      }
    }
    let getString = pfOutput.slice(0, -1);
    if (passphrase) {
      getString += '&passphrase=' + encodeURIComponent(passphrase.trim());
    }
    const signature3 = crypto.createHash("md5").update(getString).digest("hex");
    
    // LOG EVERYTHING
    console.log("========== PAYFAST DEBUG INFO ==========");
    console.log("Merchant ID:", data.merchant_id);
    console.log("Merchant Key:", data.merchant_key);
    console.log("Amount:", data.amount);
    console.log("Passphrase:", passphrase);
    console.log("");
    console.log("Method 1 (encoded):", signature1);
    console.log("Method 2 (raw):", signature2);
    console.log("Method 3 (PHP style):", signature3);
    console.log("");
    console.log("Signature String Method 1:", sigString);
    console.log("Signature String Method 2:", sigString2);
    console.log("Signature String Method 3:", getString);
    console.log("========================================");
    
    // Try using Method 3 (most compatible)
    data.signature = signature3;
    
    return NextResponse.json({ 
      payfastUrl: "https://sandbox.payfast.co.za/eng/process", 
      data: data,
      debug: {
        method1: signature1,
        method2: signature2,
        method3: signature3
      }
    });
    
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}