'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    
    // Check if someone is logged in
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    getUser();

    // Listen for logins and logouts
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md p-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap gap-4">
        
        {/* LEFT SIDE: Logo */}
        <Link href="/" className="text-2xl font-bold text-orange-600 flex items-center gap-2">
          🐾 VuraPet
        </Link>

        {/* MIDDLE: App Links */}
        <div className="flex gap-4 items-center flex-wrap justify-center">
          {user && (
            <>
              <Link href="/dashboard" className="text-gray-600 hover:text-orange-600 font-medium">
                🏠 Dashboard
              </Link>
              
              {/* NEW: Nutrition Plan Link */}
              <Link 
                href="/dashboard/nutrition" 
                className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg font-bold hover:bg-orange-100 border-2 border-orange-200 transition shadow-sm"
              >
                🥗 Nutrition Plan
              </Link>

              {/* NEW: Food Checker Link */}
              <Link 
                href="/pets/safe-food" 
                className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-bold hover:bg-green-100 border-2 border-green-200 transition shadow-sm"
              >
                🍖 Food Checker
              </Link>
            </>
          )}
        </div>

        {/* RIGHT SIDE: Login / Logout */}
        <div className="flex gap-3 items-center">
          {user ? (
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-md transition"
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/auth/login" className="px-4 py-2 text-gray-600 font-medium hover:text-orange-600 transition">
                Login
              </Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 transition shadow-sm">
                Sign Up Free
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}