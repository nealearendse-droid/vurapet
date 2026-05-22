'use client';
import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function VetHandoverProfile({ petId }: { petId: string }) {
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function loadPet() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.from('pets').select('*').eq('id', petId).single();
      setPet(data);
      setLoading(false);
    }
    loadPet();
  }, [petId]);

  const generatePDF = () => {
    setGenerating(true);
    // This would generate a real PDF
    setTimeout(() => {
      alert(`Emergency Handover Profile for ${pet.name} would be generated here.\n\nIncludes: Name, Breed, Weight, Microchip, Allergies, Medications, Vet Contacts, and current symptoms.`);
      setGenerating(false);
    }, 1500);
  };

  if (loading) return null;

  return (
    <button
      onClick={generatePDF}
      disabled={generating}
      className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
    >
      {generating ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Generating Vet Handover Profile...
        </>
      ) : (
        <>
          📋 Generate Vet Handover Profile
        </>
      )}
    </button>
  );
}