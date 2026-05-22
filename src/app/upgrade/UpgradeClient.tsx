"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function UpgradeClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");
  const plan = searchParams.get("plan") || "pro";
  const billing = searchParams.get("billing") || "monthly";

  useEffect(() => {
    async function startPayment() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push(`/auth/login?redirectTo=/upgrade?plan=${plan}&billing=${billing}`);
          return;
        }

        const response = await fetch("/api/payfast/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            plan: plan,
            billing: billing,
            email: user.email,
            name: user.user_metadata?.full_name || "VuraPet User",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Payment failed");
          return;
        }

        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.payfastUrl;
        
        Object.entries(data.data).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
        
      } catch (err) {
        console.error(err);
        setError("Something went wrong");
      }
    }

    startPayment();
  }, [plan, billing, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => router.push("/pricing")} className="bg-emerald-600 text-white px-4 py-2 rounded">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p>Redirecting to PayFast...</p>
      </div>
    </div>
  );
}