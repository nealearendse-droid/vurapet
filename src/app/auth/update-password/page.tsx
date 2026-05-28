'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirm) {
      setErrorMsg('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 3000);
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
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f0ebe4', marginBottom: 12 }}>
              Password updated!
            </h1>
            <p style={{ fontSize: 14, color: '#7a6050', lineHeight: 1.7, marginBottom: 8 }}>
              Your password has been changed successfully.
            </p>
            <p style={{ fontSize: 13, color: '#5a4030' }}>
              Taking you to your dashboard in a moment… 🐾
            </p>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f0ebe4', marginBottom: 8, textAlign: 'center' }}>
              Set new password
            </h1>
            <p style={{ fontSize: 14, color: '#7a6050', textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
              Choose a strong password for your VuraPet account.
            </p>

            <form onSubmit={handleUpdate}>
              {/* New Password */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#7a6050', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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

              {/* Confirm Password */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#7a6050', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Type it again"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
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
                {/* Password match indicator */}
                {confirm.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: 12, color: password === confirm ? '#5dcaa5' : '#f87171' }}>
                    {password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}
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
                {loading ? 'Updating…' : 'Update Password'}
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