'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function PetProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPet() {
      const supabase = getSupabaseClient();
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }
      
      const { data: petData } = await supabase
        .from('pets')
        .select('*')
        .eq('id', params.id)
        .single();
      
      setPet(petData);
      setLoading(false);
    }
    
    fetchPet();
  }, [params.id, router]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }
  
  if (!pet) {
    return (
      <div className="text-center py-12">
        <p>Pet not found</p>
        <Link href="/dashboard">← Back</Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/dashboard" className="text-emerald-600">← Back</Link>
      
      <div className="mt-4 bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold">{pet.name}</h1>
        <p>{pet.breed} • {pet.species}</p>
        <p>Age: {pet.age || 'Not specified'}</p>
        <p>Weight: {pet.weight || 'Not specified'} kg</p>
        
        <button
          onClick={() => {
            const url = `https://vurapet.vercel.app/sos/${pet.id}`;
            navigator.clipboard.writeText(url);
            alert('SOS link copied!');
          }}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
        >
          Generate SOS Link
        </button>
      </div>
    </div>
  );
}