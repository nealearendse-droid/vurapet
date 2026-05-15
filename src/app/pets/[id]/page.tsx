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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = getSupabaseClient();
      
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
      
      // Get pet data
      const { data: petData } = await supabase
        .from('pets')
        .select('*')
        .eq('id', params.id)
        .single();
      
      setPet(petData);
      setLoading(false);
    };
    
    fetchData();
  }, [params.id, router]);

  const hasPro = userPlan === 'pro' || userPlan === 'family';

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const supabase = getSupabaseClient();
    
    // Upload photo to storage
    const fileName = `${pet.id}/${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from('pet-photos')
      .upload(fileName, file);
    
    if (error) {
      alert('Error uploading photo');
      setUploading(false);
      return;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('pet-photos')
      .getPublicUrl(fileName);
    
    // Update pet profile with photo URL
    await supabase
      .from('pets')
      .update({ profile_photo_url: urlData.publicUrl })
      .eq('id', pet.id);
    
    // Refresh pet data
    setPet({ ...pet, profile_photo_url: urlData.publicUrl });
    setUploading(false);
    alert('Photo updated!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">🐾</div>
          <p className="text-gray-500">Loading pet profile...</p>
        </div>
      </div>
    );
  }
  
  if (!pet) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Pet not found</p>
        <Link href="/dashboard" className="text-emerald-600 mt-2 inline-block">
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
      
      {/* Pet Profile Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        
        {/* Photo Section */}
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
          
          {/* Photo Upload Button */}
          <label className="inline-block mt-3 bg-white/20 hover:bg-white/30 text-white px-4 py-1 rounded-full text-sm cursor-pointer transition">
            {uploading ? 'Uploading...' : '📷 Change Photo'}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
        
        {/* Pet Details */}
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
              <span className="text-gray-500 text-sm">Microchip Number</span>
              <p className="font-medium">{pet.microchip || 'Not registered'}</p>
            </div>
            <div className="border-b pb-2">
              <span className="text-gray-500 text-sm">Colour</span>
              <p className="font-medium">{pet.colour || 'Not specified'}</p>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="border-t p-6">
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/pets/${pet.id}/edit`} className="bg-gray-100 p-3 rounded-lg text-center hover:bg-gray-200 transition">
              ✏️ Edit Profile
            </Link>
            <button className="bg-gray-100 p-3 rounded-lg text-center hover:bg-gray-200 transition">
              📋 Health Records
            </button>
          </div>
        </div>
        
        {/* SOS Button - ALWAYS VISIBLE */}
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
          <p className="text-xs text-red-500 mt-2 text-center">
            {hasPro ? '✅ Pro users: Full medical records included' : '🔒 Free users: Basic info only. Upgrade to include medical records'}
          </p>
        </div>
        
        {/* Pro Features Section - Only shows if user has Pro/Family */}
        {hasPro && (
          <div className="bg-emerald-50 p-6 border-t border-emerald-200">
            <h2 className="text-lg font-bold text-emerald-700 mb-3">✨ Premium Features</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href={`/pets/${pet.id}/vet-records`} className="bg-white p-3 rounded-lg text-center shadow-sm hover:shadow-md transition">
                🏥 Vet Records
              </Link>
              <Link href={`/pets/${pet.id}/vaccines`} className="bg-white p-3 rounded-lg text-center shadow-sm hover:shadow-md transition">
                💉 Vaccine Calendar
              </Link>
              <Link href={`/pets/${pet.id}/health-journal`} className="bg-white p-3 rounded-lg text-center shadow-sm hover:shadow-md transition">
                📋 Health Journal
              </Link>
              <Link href={`/pets/${pet.id}/emergency`} className="bg-white p-3 rounded-lg text-center shadow-sm hover:shadow-md transition">
                🚑 Emergency Document
              </Link>
            </div>
          </div>
        )}
        
        {/* Upgrade Banner for Free Users */}
        {!hasPro && (
          <div className="bg-orange-50 p-6 border-t border-orange-200 text-center">
            <p className="text-orange-700 mb-2">🔒 Unlock all premium features</p>
            <Link href="/upgrade?plan=pro" className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition inline-block">
              Upgrade to Pro →
            </Link>
          </div>
        )}
        
      </div>
    </div>
  );
}