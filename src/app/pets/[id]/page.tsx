'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';

// Import only the components you want on the pet profile
import WellnessScore from '@/components/WellnessScore';
import WellnessPassport from '@/components/WellnessPassport';
import WeightTracker from '@/components/WeightTracker';
import GuardianSystem from '@/components/GuardianSystem';
import EmergencyActionPanel from '@/components/EmergencyActionPanel';
import PetAvatarUpload from '@/components/PetAvatarUpload';

export default function PetProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState('free');
  const [petId, setPetId] = useState<string>('');

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params;
      setPetId(resolvedParams.id);
    }
    getParams();
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
      
      const { data: petData } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();
      
      setPet(petData);
      setLoading(false);
    }
    
    fetchPet();
  }, [petId, router]);

  const hasPro = userPlan === 'pro' || userPlan === 'family';

  if (loading) {
    return <div className="text-center py-12">Loading pet profile...</div>;
  }
  
  if (!pet) {
    return (
      <div className="text-center py-12">
        <p>❌ Pet not found</p>
        <Link href="/dashboard" className="text-emerald-600 mt-4 inline-block">← Back</Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      
      {/* Back button */}
      <Link href="/dashboard" className="text-emerald-600 mb-4 inline-block">
        ← Back to Dashboard
      </Link>
      
      {/* Pet Header with Photo */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-2xl p-6 text-center">
        <PetAvatarUpload petId={pet.id} currentPhotoUrl={pet.profile_photo_url} />
        <h1 className="text-2xl font-bold text-white mt-3">{pet.name}</h1>
        <p className="text-orange-100">{pet.breed} • {pet.species}</p>
      </div>
      
      {/* Pet Basic Info */}
      <div className="bg-white p-6 border-x">
        <h2 className="text-lg font-bold mb-4">About {pet.name}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <span className="text-gray-500 text-sm">Age</span>
            <p className="font-medium">{pet.age || 'Not specified'} years</p>
          </div>
          <div>
            <span className="text-gray-500 text-sm">Weight</span>
            <p className="font-medium">{pet.weight || 'Not specified'} kg</p>
          </div>
          <div>
            <span className="text-gray-500 text-sm">Microchip</span>
            <p className="font-medium">{pet.microchip || 'Not registered'}</p>
          </div>
          <div>
            <span className="text-gray-500 text-sm">Colour</span>
            <p className="font-medium">{pet.colour || 'Not specified'}</p>
          </div>
        </div>
      </div>
      
      {/* Wellness Score */}
      <div className="bg-white p-6 border-x">
        <WellnessScore petId={pet.id} />
      </div>
      
      {/* Wellness Passport */}
      <div className="bg-white p-6 border-x">
        <WellnessPassport petId={pet.id} />
      </div>
      
      {/* Weight Tracker */}
      <div className="bg-white p-6 border-x">
        <WeightTracker petId={pet.id} />
      </div>
      
      {/* Guardian System */}
      <div className="bg-white p-6 border-x">
        <GuardianSystem petId={pet.id} />
      </div>
      
      {/* Emergency Action Panel */}
      <div className="bg-white p-6 border-x">
        <EmergencyActionPanel petId={pet.id} />
      </div>
      
      {/* SOS Button */}
      <div className="bg-red-50 p-6 border rounded-b-2xl text-center">
        <h2 className="text-lg font-bold text-red-700 mb-2">🚨 Emergency SOS</h2>
        <button
          onClick={() => {
            const url = `https://vurapet.vercel.app/sos/${pet.id}`;
            navigator.clipboard.writeText(url);
            alert('✅ SOS link copied!');
          }}
          className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 transition"
        >
          Generate SOS Link
        </button>
      </div>
      
    </div>
  );
}