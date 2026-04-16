'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar({ userEmail }: { userEmail?: string }) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image 
            src="/logo.png" 
            alt="VuraPet" 
            width={140} 
            height={40} 
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="text-sm text-gray-500 hidden md:block">
              {userEmail}
            </span>
          )}
          
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            My Pets
          </Link>

          <Link
            href="/pets/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            + Add Pet
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-sm text-gray-500 hover:text-red-600 font-medium transition"
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </nav>
  );
}