'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function PetProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState('free');
  const [petId, setPetId] = useState<string | null>(null);

  useEffect(() => {
    // Get the pet ID from params safely
    async function getPetId() {
      const resolvedParams = await params;
      setPetId(resolvedParams.id);
    }
    getPetId();
  }, [params]);

  useEffect(() => {
    async function fetchPet() {
      if (!petId) return;
      
      const supabase = getSupabaseClient();
      
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
      
      setUserPlan(profile?.subscription_plan || 'free');
      
      console.log('Looking for pet with ID:', petId);
      
      const { data: petData, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();
      
      if (error) {
        console.error('Error:', error);
        setPet(null);
      } else {
        setPet(petData);
      }
      
      setLoading(false);
    }
    
    fetchPet();
  }, [petId, router]);

  const hasPro = userPlan === 'pro' || userPlan === 'family';

  if (loading) {
    return (
      <div className="text-center py-12">
        <p>Loading pet profile...</p>
        <p className="text-xs text-gray-400 mt-2">Pet ID: {petId || 'loading...'}</p>
      </div>
    );
  }
  
  if (!pet) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-xl">❌ Pet not found</p>
        <p className="text-gray-500 mt-2">Pet ID: {petId}</p>
        <p className="text-gray-500">Make sure you own this pet.</p>
        <Link href="/dashboard" className="text-emerald-600 mt-4 inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/dashboard" className="text-emerald-600 mb-4 inline-block">
        ← Back to Dashboard
      </Link>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">{pet.name}</h1>
          <p className="text-orange-100">{pet.breed} • {pet.species}</p>
        </div>
        
        <div className="p-6">
          <p><strong>Age:</strong> {pet.age || 'Not specified'}</p>
          <p><strong>Weight:</strong> {pet.weight || 'Not specified'} kg</p>
          <p><strong>Microchip:</strong> {pet.microchip || 'Not registered'}</p>
        </div>
        
        <div className="bg-red-50 p-6">
          <button
            onClick={() => {
              const url = `https://vurapet.vercel.app/sos/${pet.id}`;
              navigator.clipboard.writeText(url);
              alert('SOS link copied!');
            }}
            className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold w-full"
          >
            🚨 Generate SOS Link
          </button>
        </div>
      </div>
    </div>
  );
}