'use client';
import * as React from 'react';
import Link from 'next/link';
import EmergencyAI from '@/components/EmergencyAI';

export default function EmergencyCarePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [pet, setPet] = React.useState<any>(null);

  React.useEffect(() => {
    async function loadPet() {
      const supabase = (await import('@/lib/supabase/client')).getSupabaseClient();
      const { data } = await supabase.from('pets').select('name').eq('id', id).single();
      setPet(data);
    }
    loadPet();
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href={`/pets/${id}`} className="text-emerald-400 mb-4 inline-block">
        ← Back to {pet?.name || 'Pet'} Profile
      </Link>
      <EmergencyAI petId={id} />
    </div>
  );
}