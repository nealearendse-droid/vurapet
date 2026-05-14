"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

function UpgradeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const plan = searchParams.get("plan") || "pro";
  const billing = searchParams.get("billing") || "monthly";

  useEffect(() => {
    const initiatePayment = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push(`/auth/login?redirectTo=/upgrade?plan=${plan}&billing=${billing}`);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        const res = await fetch("/api/payfast/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            plan,
            billing,
            email: user.email,
            name: profile?.full_name || "VuraPet User",
          }),
        });

        const { payfastUrl, data, error: apiError } = await res.json();

        if (apiError) {
          setError(apiError);
          setLoading(false);
          return;
        }

        const form = document.createElement("form");
        form.method = "POST";
        form.action = payfastUrl;
        Object.entries(data).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      } catch (err) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      }
    };

    initiatePayment();
  }, [plan, billing, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => router.push("/pricing")} className="bg-emerald-600 text-white px-6 py-2 rounded-xl">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Taking you to secure payment...</p>
        <p className="text-slate-400 text-sm mt-2">Powered by Payfast 🔒</p>
      </div>
    </div>
  );
}

export default function SearchWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <UpgradeContent />
    </Suspense>
  );
}