import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, billing, email, name } = await req.json();

    const amount = plan === "pro" ? "99.00" : "149.00";
    const itemName = `VuraPet ${plan} plan - ${billing}`;

    const pfData = {
      merchant_id: "34840035",
      merchant_key: "ikm9j75hs0xno",
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payfast/notify`,
      name_first: name?.split(" ")[0] || "Test User",
      name_last: name?.split(" ")[1] || "",
      email_address: email,
      m_payment_id: "TEST_" + Date.now(),  // ← FIXED THIS LINE
      amount: amount,
      item_name: itemName,
    };

    let pfOutput = "";
    for (let key in pfData) {
      if (pfData.hasOwnProperty(key) && pfData[key] !== "") {
        pfOutput += key + "=" + encodeURIComponent(pfData[key].trim()).replace(/%20/g, "+") + "&";
      }
    }
    
    let pfString = pfOutput.slice(0, -1);
    pfString = pfString + "&passphrase=Test12345678";
    
    const signature = crypto.createHash("md5").update(pfString).digest("hex");
    
    pfData["signature"] = signature;

    return NextResponse.json({ 
      payfastUrl: "https://www.payfast.co.za/eng/process", 
      data: pfData 
    });
    
  } catch (error) {
    console.error("PayFast error:", error);
    return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 });
  }
}