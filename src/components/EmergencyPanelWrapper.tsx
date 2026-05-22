'use client';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import EmergencyActionPanel from './EmergencyActionPanel';

export default function EmergencyPanelWrapper({ petId }: { petId: string }) {
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPet() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.from('pets').select('*').eq('id', petId).single();
      setPet(data);
      setLoading(false);
    }
    loadPet();
  }, [petId]);

  if (loading) {
    return <div className="p-4 text-center text-gray-400">Loading emergency info...</div>;
  }

  if (!pet) {
    return <div className="p-4 text-center text-red-400">Pet not found</div>;
  }

  return (
    <EmergencyActionPanel
      petName={pet.name}
      petSpecies={pet.species}
      ownerName={pet.name + "'s owner"}
      ownerPhone={pet.owner_phone || undefined}
      vetName={pet.vet_clinic || undefined}
      vetPhone={pet.vet_phone || undefined}
    />
  );
}