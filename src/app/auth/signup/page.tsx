'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert('Check your email to confirm, then log in!');
      router.push('/auth/login');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form onSubmit={handleSignup} className="p-8 bg-white shadow-md rounded-2xl w-96">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="VuraPet" width={180} height={50} className="h-12 w-auto" priority />
        </div>

        <h1 className="text-2xl font-bold mb-1 text-center">Create Account</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Start tracking your pet's health</p>

        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 p-3 mb-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          className="w-full border border-gray-300 p-3 mb-4 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          disabled={loading}
          className="w-full bg-orange-500 text-white p-3 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-orange-300 transition"
        >
          {loading ? 'Creating account...' : 'Sign Up Free'}
        </button>
        <div className="mt-4 text-center text-sm">
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Already have an account? Login
          </Link>
        </div>
      </form>
    </div>
  );
}