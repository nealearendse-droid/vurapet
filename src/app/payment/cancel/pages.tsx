"use client";
import { useRouter } from "next/navigation";

export default function PaymentCancel() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8 max-w-md">
        <div className="text-6xl mb-4">😔</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-slate-500 mb-6">
          No worries — your free plan is still active.
        </p>
        <button
          onClick={() => router.push("/pricing")}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold"
        >
          View Plans Again
        </button>
      </div>
    </div>
  );
}