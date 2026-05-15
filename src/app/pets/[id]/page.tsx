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
    const supabase = getSupabaseClient();
    
    const fetchData = async () => {
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
  
  if (loading) {
    return <div className="p-8 text-center">Loading pet profile...</div>;
  }
  
  if (!pet) {
    return <div className="p-8 text-center">Pet not found</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Show user's plan */}
      <div className="bg-gray-800 text-white p-2 rounded mb-4 text-center text-sm">
        Your plan: {userPlan} {!hasPro && '🔒 Upgrade to unlock Pro features'}
      </div>
      
      {/* Pet basic info - Always visible */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{pet.name}</h1>
        <p className="text-gray-600">{pet.breed} • {pet.species}</p>
        {pet.age && <p className="text-gray-600">Age: {pet.age}</p>}
      </div>
      
      {/* Basic Features - Always visible */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Link href={`/pets/${pet.id}/weight`} className="bg-gray-50 p-4 rounded-xl border hover:shadow-md transition">
          <div className="text-2xl mb-2">⚖️</div>
          <h3 className="font-bold">Weight Tracker</h3>
          <p className="text-sm text-gray-500">Track your pet's weight</p>
        </Link>
        
        <Link href={`/pets/${pet.id}/food`} className="bg-gray-50 p-4 rounded-xl border hover:shadow-md transition">
          <div className="text-2xl mb-2">🍎</div>
          <h3 className="font-bold">Food Checker</h3>
          <p className="text-sm text-gray-500">Check if food is safe</p>
        </Link>
      </div>
      
      {/* PRO Features - Only show if user has Pro/Family plan */}
      <h2 className="text-xl font-bold mb-3">Premium Features</h2>
      <div className="grid md:grid-cols-2 gap-4">
        
        {/* Vet Records - Pro only */}
        {hasPro ? (
          <Link href={`/pets/${pet.id}/vet-records`} className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200 hover:shadow-md transition">
            <div className="text-2xl mb-2">🏥</div>
            <h3 className="font-bold text-emerald-800">Vet Records</h3>
            <p className="text-sm text-emerald-600">Medical history, vaccines</p>
          </Link>
        ) : (
          <div onClick={() => router.push('/upgrade?plan=pro')} className="bg-gray-100 p-4 rounded-xl border cursor-pointer opacity-70 hover:opacity-100 transition">
            <div className="text-2xl mb-2">🏥</div>
            <h3 className="font-bold">Vet Records <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">PRO</span></h3>
            <p className="text-sm text-gray-500">Upgrade to unlock</p>
            <p className="text-xs text-orange-500 mt-1">Tap to upgrade →</p>
          </div>
        )}
        
        {/* Health Journal - Pro only */}
        {hasPro ? (
          <Link href={`/pets/${pet.id}/health-journal`} className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200 hover:shadow-md transition">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-bold text-emerald-800">Health Journal</h3>
            <p className="text-sm text-emerald-600">Track symptoms and health</p>
          </Link>
        ) : (
          <div onClick={() => router.push('/upgrade?plan=pro')} className="bg-gray-100 p-4 rounded-xl border cursor-pointer opacity-70 hover:opacity-100 transition">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-bold">Health Journal <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">PRO</span></h3>
            <p className="text-sm text-gray-500">Upgrade to unlock</p>
            <p className="text-xs text-orange-500 mt-1">Tap to upgrade →</p>
          </div>
        )}
        
        {/* Vaccine Calendar - Pro only */}
        {hasPro ? (
          <Link href={`/pets/${pet.id}/vaccines`} className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200 hover:shadow-md transition">
            <div className="text-2xl mb-2">💉</div>
            <h3 className="font-bold text-emerald-800">Vaccine Calendar</h3>
            <p className="text-sm text-emerald-600">Never miss a shot</p>
          </Link>
        ) : (
          <div onClick={() => router.push('/upgrade?plan=pro')} className="bg-gray-100 p-4 rounded-xl border cursor-pointer opacity-70 hover:opacity-100 transition">
            <div className="text-2xl mb-2">💉</div>
            <h3 className="font-bold">Vaccine Calendar <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">PRO</span></h3>
            <p className="text-sm text-gray-500">Upgrade to unlock</p>
            <p className="text-xs text-orange-500 mt-1">Tap to upgrade →</p>
          </div>
        )}
        
        {/* Emergency Document - Pro only */}
        {hasPro ? (
          <Link href={`/pets/${pet.id}/emergency`} className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200 hover:shadow-md transition">
            <div className="text-2xl mb-2">🚑</div>
            <h3 className="font-bold text-emerald-800">Emergency Care Document</h3>
            <p className="text-sm text-emerald-600">Vet-ready information</p>
          </Link>
        ) : (
          <div onClick={() => router.push('/upgrade?plan=pro')} className="bg-gray-100 p-4 rounded-xl border cursor-pointer opacity-70 hover:opacity-100 transition">
            <div className="text-2xl mb-2">🚑</div>
            <h3 className="font-bold">Emergency Care <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">PRO</span></h3>
            <p className="text-sm text-gray-500">Upgrade to unlock</p>
            <p className="text-xs text-orange-500 mt-1">Tap to upgrade →</p>
          </div>
        )}
        
      </div>
      
      {/* Upgrade banner for free users */}
      {!hasPro && (
        <div className="mt-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl text-center">
          <h3 className="text-xl font-bold mb-2">🐾 Unlock Full Protection</h3>
          <p className="mb-4">Get vet records, health journal, vaccine reminders and more!</p>
          <Link href="/upgrade?plan=pro" className="bg-white text-orange-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-100">
            Upgrade Now →
          </Link>
        </div>
      )}
    </div>
  );
}