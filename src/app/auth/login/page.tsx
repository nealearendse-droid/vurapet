'use client';

import { useState, Suspense } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      // ── MOBILE FIX ──
      // router.push alone doesn't always work on mobile Chrome because
      // the session cookie hasn't propagated yet when the page loads.
      // Using window.location.href forces a full page reload so the
      // middleware picks up the session correctly on all devices.
      window.location.href = redirectTo || '/dashboard';

    } catch (error: any) {
      setErrorMsg(error.message || 'Login failed. Please check your email and password.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: 16,
      background: '#0c0a08',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <img
          src="/logo.white.png"
          alt="VuraPet"
          style={{ width: 56, height: 56, objectFit: 'contain', margin: '0 auto 12px' }}
        />
        <div style={{ fontSize: 20, fontWeight: 700, color: '#f0ebe4', letterSpacing: '-0.02em' }}>VuraPet</div>
        <div style={{ fontSize: 12, color: '#7a6050', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Lifetime Companion</div>
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: '#181411',
        border: '0.5px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: '32px 28px',
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f0ebe4', marginBottom: 24, textAlign: 'center' }}>
          Welcome back 🐾
        </h1>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#7a6050', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#0c0a08',
                border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: '#f0ebe4',
                fontSize: 16,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#7a6050', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#0c0a08',
                border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: '#f0ebe4',
                fontSize: 16,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Error message */}
          {errorMsg && (
            <div style={{
              background: 'rgba(220,38,38,0.1)',
              border: '1px solid rgba(220,38,38,0.3)',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 16,
              fontSize: 13,
              color: '#fca5a5',
            }}>
              {errorMsg}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#7a4020' : '#c47a3a',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer',
              transition: 'background 0.2s',
              letterSpacing: '0.02em',
            }}
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        {/* Links */}
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#7a6050', margin: '0 0 8px' }}>
            Don't have an account?{' '}
            <Link href="/auth/signup" style={{ color: '#c47a3a', textDecoration: 'none', fontWeight: 600 }}>
              Sign Up Free
            </Link>
          </p>
          <Link href="/auth/reset-password" style={{ fontSize: 12, color: '#5a4030', textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p style={{ marginTop: 24, fontSize: 11, color: '#3a2a1a', textAlign: 'center' }}>
        🇿🇦 Built in South Africa for pet parents everywhere
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0c0a08' }} />}>
      <LoginForm />
    </Suspense>
  );
}