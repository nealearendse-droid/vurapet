'use client';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import Link from 'next/link';
import WeightTracker from '@/components/WeightTracker';

export default function WeightTrackerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [pet, setPet] = React.useState<any>(null);

  React.useEffect(() => {
    async function fetchPet() {
      const supabase = (await import('@/lib/supabase/client')).createSupabaseBrowserClient();
      const { data } = await supabase.from('pets').select('*').eq('id', id).single();
      setPet(data);
    }
    fetchPet();
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href={`/pets/${id}`} className="text-emerald-600 mb-4 inline-block">
        ← Back to {pet?.name || 'Pet'} Profile
      </Link>
      <WeightTracker petId={id} petInfo={pet} />
    </div>
  );
}