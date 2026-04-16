'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) alert(error.message);
    else router.push('/dashboard');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form onSubmit={handleLogin} className="p-8 bg-white shadow-md rounded-2xl w-96">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="VuraPet" width={180} height={50} className="h-12 w-auto" priority />
        </div>

        <h1 className="text-2xl font-bold mb-1 text-center">Welcome Back</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Login to manage your pets</p>

        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 p-3 mb-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 p-3 mb-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="mt-4 text-center text-sm">
          <Link href="/auth/signup" className="text-blue-600 hover:underline">
            Need an account? Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}