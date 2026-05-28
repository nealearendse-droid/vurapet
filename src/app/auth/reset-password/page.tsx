'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;
      setSent(true);
    } catch (error: any) {
      setErrorMsg(error.message || 'Something went wrong. Please try again.');
    } finally {
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

        {/* Success state */}
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f0ebe4', marginBottom: 12 }}>
              Check your email
            </h1>
            <p style={{ fontSize: 14, color: '#7a6050', lineHeight: 1.7, marginBottom: 24 }}>
              We sent a password reset link to <strong style={{ color: '#c47a3a' }}>{email}</strong>.
              Click the link in the email to set a new password.
            </p>
            <p style={{ fontSize: 12, color: '#5a4030', marginBottom: 24 }}>
              Don't see it? Check your spam folder.
            </p>
            <Link href="/auth/login" style={{
              display: 'block',
              padding: '12px',
              background: '#c47a3a',
              color: '#fff',
              borderRadius: 10,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600,
              textAlign: 'center',
            }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f0ebe4', marginBottom: 8, textAlign: 'center' }}>
              Forgot your password?
            </h1>
            <p style={{ fontSize: 14, color: '#7a6050', textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
              No worries! Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleReset}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#7a6050', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Email address
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
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <Link href="/auth/login" style={{ fontSize: 13, color: '#7a6050', textDecoration: 'none' }}>
                ← Back to Login
              </Link>
            </div>
          </>
        )}
      </div>

      <p style={{ marginTop: 24, fontSize: 11, color: '#3a2a1a', textAlign: 'center' }}>
        🇿🇦 Built in South Africa for pet parents everywhere
      </p>
    </div>
  );
}