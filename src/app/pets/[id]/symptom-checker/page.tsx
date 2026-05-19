'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import SymptomChecker from '@/components/SymptomChecker';

export default function SymptomCheckerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [pet, setPet] = React.useState<any>(null);
  const [isPro, setIsPro] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    async function checkProAndFetchPet() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Check if user is Pro or Family
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_plan')
          .eq('id', user.id)
          .single();
        
        // Allow both 'pro' AND 'family' plans
        if (profile?.subscription_plan === 'pro' || profile?.subscription_plan === 'family') {
          setIsPro(true);
        }
      }
      
      // Fetch pet details
      const { data } = await supabase.from('pets').select('*').eq('id', id).single();
      setPet(data);
      
      setLoading(false);
    }
    
    checkProAndFetchPet();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  // If not Pro or Family, show upgrade message
  if (!isPro) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Pro Feature</h1>
          <p className="text-gray-600 mb-6">
            Symptom checker is available exclusively for Pro and Family members.
            Upgrade to get AI-powered symptom analysis, emergency guidance, 
            and personalized health recommendations for {pet?.name || 'your pet'}!
          </p>
          <button
            onClick={() => router.push('/upgrade?plan=pro')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition w-full"
          >
            Upgrade to Pro → R99/month
          </button>
          <button
            onClick={() => router.back()}
            className="mt-3 text-gray-500 text-sm hover:text-gray-700"
          >
            ← Go back to {pet?.name || 'pet'} profile
          </button>
        </div>
      </div>
    );
  }

  // Pro or Family user - show the symptom checker
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href={`/pets/${id}`} className="text-emerald-600 mb-4 inline-block">
        ← Back to {pet?.name || 'Pet'} Profile
      </Link>
      <SymptomChecker petId={id} petName={pet?.name || 'your pet'} petSpecies={pet?.species || 'pet'} />
    </div>
  );
}