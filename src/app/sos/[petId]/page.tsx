'use client';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function SOSPage({ params }: { params: { petId: string } }) {
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPet = async () => {
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from('pets')
        .select('*')
        .eq('id', params.petId)
        .single();
      setPet(data);
      setLoading(false);
    };
    fetchPet();
  }, [params.petId]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!pet) return <div className="p-8 text-center">Pet not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-orange-500 text-white p-6 text-center">
          <h1 className="text-2xl font-bold">🚨 EMERGENCY SOS</h1>
          <p className="text-orange-100">Important health information for {pet.name}</p>
        </div>

        {/* Pet Photo */}
        {pet.photo_url && (
          <img src={pet.photo_url} alt={pet.name} className="w-full h-48 object-cover" />
        )}

        {/* Basic Info - Always visible */}
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{pet.name}</h2>
          <div className="grid gap-3">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Species:</span>
              <span>{pet.species}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Breed:</span>
              <span>{pet.breed}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Microchip:</span>
              <span>{pet.microchip || 'Not registered'}</span>
            </div>
          </div>

          {/* Medical Records - Show blurred for free, clear for Pro */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl relative">
            <h3 className="font-bold mb-2">🏥 Medical Records</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Vaccinations:</span>
                <span className="text-gray-500">Rabies, Distemper (up to date)</span>
              </div>
              <div className="flex justify-between">
                <span>Allergies:</span>
                <span className="text-gray-500">None reported</span>
              </div>
              <div className="flex justify-between">
                <span>Current Medications:</span>
                <span className="text-gray-500">None</span>
              </div>
            </div>
            
            {/* Blur overlay for free users - This is just a demo, you'll need to check actual plan */}
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
              <div className="text-center">
                <span className="text-orange-500 text-2xl mb-2 block">🔒</span>
                <p className="text-sm font-bold">Full medical records locked</p>
                <p className="text-xs text-gray-500">Ask owner to upgrade to Pro</p>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-gray-400">
            This SOS card was generated on {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}