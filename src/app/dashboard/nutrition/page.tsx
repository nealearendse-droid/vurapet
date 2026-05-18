'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import NutritionArchitect from '@/components/NutritionArchitect';

export default function NutritionPage() {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkProStatus() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();
        
        if (profile?.plan === 'pro') {
          setIsPro(true);
        }
      }
      setLoading(false);
    }
    
    checkProStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Pro Feature</h1>
          <p className="text-gray-600 mb-6">
            Nutrition planning is available exclusively for Pro members.
            Upgrade to unlock personalized meal plans, portion calculators, 
            and breed-specific recommendations!
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition w-full"
          >
            Upgrade to Pro → R99/month
          </button>
          <button
            onClick={() => router.back()}
            className="mt-3 text-gray-500 text-sm hover:text-gray-700"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto">
        <NutritionArchitect />
      </div>
    </main>
  );
}