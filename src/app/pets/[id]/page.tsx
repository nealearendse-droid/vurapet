'use client';
import CareProfile from '@/components/CareProfile';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';
import * as React from 'react';
import WellnessScore from '@/components/WellnessScore';
import WellnessPassport from '@/components/WellnessPassport';
import PetAvatarUpload from '@/components/PetAvatarUpload';
import EmergencyPanelWrapper from '@/components/EmergencyPanelWrapper';
export default function PetProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState('free');
  
  const { id } = React.use(params);

  useEffect(() => {
    async function fetchPet() {
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
        .eq('id', id)
        .single();
      
      setPet(petData);
      setLoading(false);
    }
    
    fetchPet();
  }, [id, router]);

  if (loading) {
    return <div className="text-center py-12">Loading pet profile...</div>;
  }
  
  if (!pet) {
    return (
      <div className="text-center py-12">
        <p>❌ Pet not found</p>
        <Link href="/dashboard" className="text-emerald-600 mt-4 inline-block">← Back to Dashboard</Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/dashboard" className="text-emerald-600 mb-4 inline-block">← Back to Dashboard</Link>
      
            {/* Pet Header with Avatar Upload */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-2xl p-6 text-center">
        <PetAvatarUpload 
          petId={pet.id} 
          currentAvatarUrl={pet.profile_photo_url || pet.photo_url}
          petName={pet.name}
          onUploadComplete={(newUrl) => {
            // Update the pet object with the new photo URL
            setPet({ ...pet, profile_photo_url: newUrl });
          }}
        />
        <h1 className="text-2xl font-bold text-white mt-3">{pet.name}</h1>
        <p className="text-orange-100">{pet.breed} • {pet.species}</p>
      </div>
      
           {/* About Section */}
      <div className="bg-[#1a1a2e] p-6 border-x border-gray-800">
        <h2 className="text-lg font-bold mb-4 text-white">About {pet.name}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div><span className="text-gray-400 text-sm">Age</span><p className="font-medium text-white">{pet.age || 'Not specified'} years</p></div>
          <div><span className="text-gray-400 text-sm">Weight</span><p className="font-medium text-white">{pet.weight || 'Not specified'} kg</p></div>
          <div><span className="text-gray-400 text-sm">Microchip</span><p className="font-medium text-white">{pet.microchip || 'Not registered'}</p></div>
          <div><span className="text-gray-400 text-sm">Colour</span><p className="font-medium text-white">{pet.colour || 'Not specified'}</p></div>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
  <h2 className="text-lg font-bold text-white">About {pet.name}</h2>
  <Link href={`/pets/${pet.id}/edit`} className="text-sm text-emerald-400 hover:text-emerald-300">
    ✏️ Edit Pet
  </Link>
</div>
      {/* Wellness Score */}
      <div className="bg-white p-6 border-x mt-6">
        <WellnessScore petId={pet.id} />
      </div>
      
      {/* Wellness Passport */}
      <div className="bg-white p-6 border-x mt-6">
        <WellnessPassport petId={pet.id} pet={pet} />
      </div>
      
      {/* Care Profile */}
      <div className="bg-white p-6 border-x mt-6">
        <CareProfile petId={pet.id} />
      </div>
      
      {/* Upgrade Section for Free Users */}
      {userPlan === 'free' && (
        <div className="bg-orange-50 p-6 border-x text-center mt-6">
          <p className="text-orange-700 font-bold">🔒 Upgrade to Pro</p>
          <p className="text-sm text-orange-600 mt-1">Get full wellness tracking, vaccine calendar, and health journal</p>
          <Link href="/upgrade?plan=pro" className="inline-block mt-3 bg-orange-500 text-white px-4 py-2 rounded-lg">
            Upgrade Now →
          </Link>
        </div>
      )}
            {/* Emergency Action Panel */}
      <div className="bg-[#1a1a2e] p-6 border-x border-gray-800 mt-6">
        <EmergencyPanelWrapper petId={pet.id} />
      </div>
      {/* SOS Button */}
      <div className="bg-red-50 p-6 border rounded-b-2xl text-center mt-6">
        <h2 className="text-lg font-bold text-red-700 mb-2">🚨 Emergency SOS</h2>
        <button
          onClick={() => {
            const url = `https://vurapet.vercel.app/sos/${pet.id}`;
            navigator.clipboard.writeText(url);
            alert('✅ SOS link copied! Share with vets, pet sitters, or emergency contacts.');
          }}
          className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold"
        >
          Generate SOS Link
        </button>
      </div>
    </div>
  );
}