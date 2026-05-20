import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("=== DEBUG PAYFAST REQUEST ===");
  console.log("Received body:", body);
  console.log("Email:", body.email);
  console.log("Email type:", typeof body.email);
  console.log("Email length:", body.email?.length);
  console.log("==============================");
  
  return NextResponse.json({ 
    message: "Debug received", 
    email: body.email,
    isValid: body.email && body.email.includes("@") 
  });
}