"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => router.push("/dashboard"), 4000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8 max-w-md">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Welcome to VuraPet Pro!
        </h1>
        <p className="text-slate-500 mb-6">
          Your payment was successful. Your pet is now fully protected.
        </p>
        <p className="text-slate-400 text-sm">
          Taking you to your dashboard...
        </p>
      </div>
    </div>
  );
}