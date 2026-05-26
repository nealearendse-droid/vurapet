'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as React from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import TravelPlanner from '@/components/TravelPlanner';

export default function PetTravelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const [pet, setPet] = useState<{
    id: string;
    name: string;
    species: string;
    breed?: string | null;
    weight?: number | string | null;
    microchip?: string | null;
  } | null>(null);
  const [hasPro, setHasPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', session.user.id)
        .single();

      const plan = profile?.subscription_plan || 'free';
      setHasPro(plan === 'pro' || plan === 'family');

      const { data } = await supabase.from('pets').select('*').eq('id', id).single();
      if (!data) {
        setLoading(false);
        return;
      }
      setPet(data);
      setLoading(false);
    }
    load();
  }, [id, router]);

  if (loading) {
    return <div className="max-w-3xl mx-auto p-6 text-center text-gray-400">Loading…</div>;
  }

  if (!pet) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p className="text-[#f0ebe4]">Pet not found.</p>
        <Link href="/dashboard" className="text-emerald-500 mt-4 inline-block">← Dashboard</Link>
      </div>
    );
  }

  if (!hasPro) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <Link href={`/pets/${id}`} className="text-emerald-500 text-sm mb-4 inline-block hover:underline font-medium">
          ← Back to {pet.name}
        </Link>
        <div className="rounded-2xl border border-gray-700 bg-[#181411] p-8 text-center">
          <div className="text-5xl mb-4">✈️</div>
          <h1 className="text-xl font-bold text-[#f0ebe4] mb-2">Travel Planner</h1>
          <p className="text-[#7a6050] text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Plan international trips for {pet.name} with country requirements, timelines, airline rules, and export checklists. Available on Pro and Family plans.
          </p>
          <span className="inline-block bg-[#c47a3a] text-white text-xs font-bold px-3 py-1 rounded-full mb-6">PRO FEATURE</span>
          <div>
            <Link
              href="/upgrade?plan=pro"
              className="inline-block bg-[#0F6E56] hover:bg-[#085041] text-white font-semibold px-6 py-3 rounded-lg text-sm"
            >
              Upgrade to Pro →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 text-gray-900">
      <Link href={`/pets/${id}`} className="text-emerald-500 text-sm mb-4 inline-block hover:underline font-medium">
        ← Back to {pet.name}
      </Link>
      <TravelPlanner petId={id} pet={pet} />
    </div>
  );
}
