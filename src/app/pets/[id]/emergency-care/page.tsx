'use client';
import * as React from 'react';
import Link from 'next/link';
import EmergencyPanelWrapper from '@/components/EmergencyPanelWrapper';

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
      <h1 className="text-2xl font-bold text-white mb-4">🚨 Emergency Care</h1>
      <EmergencyPanelWrapper petId={id} />
    </div>
  );
}