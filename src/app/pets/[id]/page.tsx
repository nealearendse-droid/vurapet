'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';

// Import all your components
import WellnessScore from '@/components/WellnessScore';
import WellnessPassport from '@/components/WellnessPassport';
import WeightTracker from '@/components/WeightTracker';
import VaccineCalendar from '@/components/VaccineCalendar';
import SymptomChecker from '@/components/SymptomChecker';
import HealthJournal from '@/components/HealthJournal';
import EmergencyActionPanel from '@/components/EmergencyActionPanel';
import BreedIntelligenceBrief from '@/components/BreedIntelligenceBrief';
import GuardianSystem from '@/components/GuardianSystem';
import MemoryBook from '@/components/MemoryBook';
import NutritionArchitect from '@/components/NutritionArchitect';
import PetSafeFoodChecker from '@/components/PetSafeFoodChecker';
import PetAvatarUpload from '@/components/PetAvatarUpload';

export default function PetProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState('free');
  const [petId, setPetId] = useState<string>('');

  // Get the pet ID from params
  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params;
      setPetId(resolvedParams.id);
    }
    getParams();
  }, [params]);

  // Fetch pet data
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
      
      const { data: petData, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();
      
      if (error) {
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
      </div>
    );
  }
  
  if (!pet) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">❌ Pet not found</p>
        <Link href="/dashboard" className="text-emerald-600 mt-4 inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back button */}
      <Link href="/dashboard" className="text-emerald-600 mb-4 inline-block">
        ← Back to Dashboard
      </Link>
      
      {/* Plan indicator */}
      <div className="bg-gray-800 text-white p-2 rounded mb-4 text-center text-sm">
        Your plan: {userPlan} {!hasPro && '🔒 Upgrade to unlock all features'}
      </div>
      
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
      
      {/* Wellness Score - Always visible */}
      <div className="bg-white p-6 border-x">
        <WellnessScore petId={pet.id} />
      </div>
      
      {/* Wellness Passport - Always visible */}
      <div className="bg-white p-6 border-x">
        <WellnessPassport petId={pet.id} />
      </div>
      
      {/* Weight Tracker - Always visible */}
      <div className="bg-white p-6 border-x">
        <WeightTracker petId={pet.id} />
      </div>
      
      {/* Food Checker - Always visible */}
      <div className="bg-white p-6 border-x">
        <PetSafeFoodChecker petId={pet.id} />
      </div>
      
      {/* Guardian System - Always visible */}
      <div className="bg-white p-6 border-x">
        <GuardianSystem petId={pet.id} />
      </div>
      
      {/* Memory Book - Always visible (with limit for free) */}
      <div className="bg-white p-6 border-x">
        <MemoryBook petId={pet.id} userPlan={userPlan} />
      </div>
      
      {/* PRO FEATURES - Only show if user has Pro or Family */}
      {hasPro ? (
        <>
          <div className="bg-white p-6 border-x">
            <NutritionArchitect petId={pet.id} />
          </div>
          <div className="bg-white p-6 border-x">
            <VaccineCalendar petId={pet.id} />
          </div>
          <div className="bg-white p-6 border-x">
            <HealthJournal petId={pet.id} />
          </div>
          <div className="bg-white p-6 border-x">
            <SymptomChecker petId={pet.id} />
          </div>
          <div className="bg-white p-6 border-x">
            <BreedIntelligenceBrief petId={pet.id} />
          </div>
        </>
      ) : (
        <div className="bg-orange-50 p-6 border-x border-b text-center">
          <p className="text-orange-700">🔒 Upgrade to Pro to unlock:</p>
          <p className="text-sm text-orange-600 mt-1">Nutrition Architect • Vaccine Calendar • Health Journal • Symptom Checker • Breed Intelligence</p>
          <Link href="/upgrade?plan=pro" className="inline-block mt-3 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm">
            Upgrade Now →
          </Link>
        </div>
      )}
      
      {/* Emergency Action Panel - Always visible (this is emergency info) */}
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
            alert('✅ SOS link copied! Share with vets, pet sitters, or emergency contacts.');
          }}
          className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 transition"
        >
          Generate SOS Link
        </button>
        <p className="text-xs text-red-500 mt-2">
          {hasPro ? 'Pro: Full medical records included' : 'Free: Basic info only'}
        </p>
      </div>
      
    </div>
  );
}