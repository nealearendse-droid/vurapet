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

  useEffect(() => {
    async function fetchPet() {
      const supabase = getSupabaseClient();
      
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }
      
      // Get user's plan
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', session.user.id)
        .single();
      
      setUserPlan(profile?.subscription_plan || 'free');
      
      // Get pet data using the ID from params
      console.log('Looking for pet with ID:', params.id);
      
      const { data: petData, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', params.id)
        .single();
      
      if (error) {
        console.error('Error fetching pet:', error);
        setPet(null);
      } else {
        setPet(petData);
      }
      
      setLoading(false);
    }
    
    fetchPet();
  }, [params.id, router]);

  const hasPro = userPlan === 'pro' || userPlan === 'family';

  if (loading) {
    return (
      <div className="text-center py-12">
        <p>Loading pet profile...</p>
      </div>
    );
  }
  
  if (!pet) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-xl">❌ Pet not found</p>
        <p className="text-gray-500 mt-2">The pet ID might be incorrect.</p>
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
          {pet.profile_photo_url ? (
            <img 
              src={pet.profile_photo_url} 
              alt={pet.name}
              className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 rounded-full mx-auto bg-white/20 flex items-center justify-center border-4 border-white shadow-lg">
              <span className="text-5xl">🐾</span>
            </div>
          )}
          
          <h1 className="text-2xl font-bold text-white mt-3">{pet.name}</h1>
          <p className="text-orange-100">{pet.breed} • {pet.species}</p>
        </div>
        
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">About {pet.name}</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-b pb-2">
              <span className="text-gray-500 text-sm">Age</span>
              <p className="font-medium">{pet.age || 'Not specified'} years</p>
            </div>
            <div className="border-b pb-2">
              <span className="text-gray-500 text-sm">Weight</span>
              <p className="font-medium">{pet.weight || 'Not specified'} kg</p>
            </div>
            <div className="border-b pb-2">
              <span className="text-gray-500 text-sm">Microchip</span>
              <p className="font-medium">{pet.microchip || 'Not registered'}</p>
            </div>
            <div className="border-b pb-2">
              <span className="text-gray-500 text-sm">Colour</span>
              <p className="font-medium">{pet.colour || 'Not specified'}</p>
            </div>
          </div>
        </div>
        
        {/* SOS Button */}
        <div className="bg-red-50 p-6 border-t border-red-200">
          <h2 className="text-lg font-bold text-red-700 mb-2">🚨 Emergency SOS</h2>
          <p className="text-sm text-red-600 mb-3">
            Generate a shareable emergency card with your pet's vital information.
          </p>
          <button
            onClick={() => {
              const url = `https://vurapet.vercel.app/sos/${pet.id}`;
              navigator.clipboard.writeText(url);
              alert('SOS link copied! Share with vets, pet sitters, or emergency contacts.');
            }}
            className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 transition w-full"
          >
            🚨 Generate SOS Link
          </button>
        </div>
        
        {/* Upgrade Banner */}
        {!hasPro && (
          <div className="bg-orange-50 p-6 border-t border-orange-200 text-center">
            <p className="text-orange-700 mb-2">🔒 Upgrade to Pro for medical records</p>
            <Link href="/upgrade?plan=pro" className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold inline-block">
              Upgrade →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}