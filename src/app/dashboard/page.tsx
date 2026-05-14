'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [pets, setPets] = useState<any[]>([]);
  const [guardians, setGuardians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const supabase = getSupabaseClient();

    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login');
        return;
      }

      const name = session.user.user_metadata?.full_name
        || session.user.email?.split('@')[0]
        || 'there';
      setUserName(name.split(' ')[0]);

      const { data: petsData } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      const { data: guardiansData } = await supabase
        .from('guardians')
        .select('id, pet_id');

      setPets(petsData || []);
      setGuardians(guardiansData || []);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const petHasGuardian = (petId: string) =>
    guardians.some((g: any) => g.pet_id === petId);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
    'Good evening';

  if (loading) {
    return (
      <div className="vp-loading">
        <div className="vp-loading-inner">
          <img
            src="/logo.white.png"
            alt="VuraPet"
            style={{ width: 56, height: 56, objectFit: 'contain' }}
            className="vp-loading-logo"
          />
          <p className="vp-loading-text">Loading your pets…</p>
        </div>
        <style>{loadingStyles}</style>
      </div>
    );
  }

  const isProtected = guardians.length > 0;

  return (
    <div className="vp-dash">
      <style>{dashStyles}</style>

      {/* ── Hero greeting ── */}
      <div className="vp-hero">
        <div className="vp-hero-glow" />
        <div className="vp-hero-content">
          <div className="vp-hero-left">
            <p className="vp-greeting-label">
              {greeting}, <span className="vp-name">{userName}</span>
            </p>
            <h1 className="vp-hero-title">Your pets are{' '}
              <span className={isProtected ? 'vp-accent-green' : 'vp-accent-amber'}>
                {isProtected ? 'protected' : 'waiting'}
              </span>
            </h1>
            <p className="vp-hero-sub">
              {isProtected
                ? `${guardians.length} guardian${guardians.length > 1 ? 's' : ''} ready to step in if you ever need them.`
                : 'Add a guardian so someone always knows how to care for your pet.'}
            </p>
          </div>

          {/* Protection status pill */}
          {isProtected ? (
            <Link href="/pets/guardian" className="vp-status-pill vp-status-green">
              <span className="vp-status-dot vp-dot-green" />
              <span>All pets safe</span>
              <span className="vp-status-arrow">›</span>
            </Link>
          ) : (
            <Link href="/pets/guardian/add" className="vp-status-pill vp-status-amber">
              <span className="vp-status-dot vp-dot-amber" />
              <span>Add a guardian now</span>
              <span className="vp-status-arrow">›</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── Main body ── */}
      <div className="vp-body">

        {/* ── Upgrade Banner ── */}
        <div className="vp-upgrade-banner">
          <div className="vp-upgrade-left">
            <p className="vp-upgrade-tag">🔒 Free Plan</p>
            <h3 className="vp-upgrade-title">Unlock Full Protection</h3>
            <p className="vp-upgrade-sub">
              Vet records · Health journal · Emergency care doc · Vaccine reminders · Custom meal plans
            </p>
          </div>
          <Link href="/upgrade?plan=pro&billing=monthly" className="vp-upgrade-btn">
            Upgrade to Pro →
          </Link>
        </div>

        {/* ── Pets section ── */}
        <section className="vp-section">
          <div className="vp-section-header">
            <h2 className="vp-section-title">My Pets</h2>
            <Link href="/dashboard/add-pet" className="vp-btn-primary">
              + Add Pet
            </Link>
          </div>

          {pets.length === 0 ? (
            <div className="vp-empty">
              <div className="vp-empty-icon">🐾</div>
              <h3 className="vp-empty-title">No pets yet</h3>
              <p className="vp-empty-sub">Add your first pet to start their lifetime care plan.</p>
              <Link href="/dashboard/add-pet" className="vp-btn-primary">
                + Add My First Pet
              </Link>
            </div>
          ) : (
            <div className="vp-pet-list">
              {pets.map((pet, i) => {
                const hasGuardian = petHasGuardian(pet.id);
                const photoUrl = pet.profile_photo_url || pet.photo_url;

                return (
                  <div
                    key={pet.id}
                    className="vp-pet-card"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {/* Photo */}
                    <div className="vp-pet-avatar">
                      {photoUrl ? (
                        <img src={photoUrl} alt={pet.name} className="vp-pet-photo" />
                      ) : (
                        <span className="vp-pet-fallback">🐾</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="vp-pet-info">
                      <h3 className="vp-pet-name">{pet.name}</h3>
                      <p className="vp-pet-meta">
                        {[pet.breed, pet.species].filter(Boolean).join(' · ')}
                      </p>
                      {hasGuardian ? (
                        <span className="vp-badge vp-badge-green">🛡️ Protected</span>
                      ) : (
                        <span className="vp-badge vp-badge-amber">⚠️ No guardian yet</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="vp-pet-actions">
                      <Link href={`/pets/${pet.id}`} className="vp-link-primary">
                        View Profile →
                      </Link>
                      {!hasGuardian && (
                        <Link href="/pets/guardian/add" className="vp-link-muted">
                          + Add Guardian
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Quick Actions ── */}
        <section className="vp-section">
          <h2 className="vp-section-title" style={{ marginBottom: '1rem' }}>Quick Actions</h2>
          <div className="vp-actions-grid">
            {[
              { href: '/dashboard/nutrition',          icon: '🥗', label: 'Nutrition Plan',     sub: 'Custom meal plans',   color: '#c47a3a' },
              { href: '/pets/safe-food',               icon: '🍎', label: 'Food Checker',       sub: 'Safe or unsafe?',     color: '#1d9e75' },
              { href: '/pets/guardian',                icon: '🛡️', label: 'Guardians',          sub: 'Protect your pet',    color: '#378add' },
              { href: '/pets/memories',                icon: '📸', label: 'Memory Book',        sub: 'Capture moments',     color: '#d4537e' },
              { href: '/dashboard/breed-intelligence', icon: '🧠', label: 'Breed Intelligence', sub: 'Know your breed',     color: '#8b6dd4' },
            ].map((action, i) => (
              <Link
                key={action.href}
                href={action.href}
                className="vp-action-card"
                style={{ animationDelay: `${i * 50 + 100}ms` }}
              >
                <div
                  className="vp-action-icon"
                  style={{ background: `${action.color}22`, border: `0.5px solid ${action.color}44` }}
                >
                  <span style={{ fontSize: 22 }}>{action.icon}</span>
                </div>
                <p className="vp-action-label">{action.label}</p>
                <p className="vp-action-sub">{action.sub}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Styles
───────────────────────────────────────────── */

const loadingStyles = `
  .vp-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
  }
  .vp-loading-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }
  .vp-loading-logo {
    animation: vp-pulse 1.4s ease-in-out infinite;
    object-fit: contain;
  }
  .vp-loading-text {
    font-size: 14px;
    color: #a08060;
    letter-spacing: 0.04em;
  }
  @keyframes vp-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.92); }
  }
`;

const dashStyles = `
  /* ── Reset & base ── */
  .vp-dash {
    font-family: 'Geist', 'Inter', sans-serif;
    background: #0c0a08;
    min-height: 100vh;
    color: #f0ebe4;
  }

  /* ── Hero ── */
  .vp-hero {
    position: relative;
    overflow: hidden;
    background: linear-gradient(160deg, #1a1410 0%, #120f0c 100%);
    border-bottom: 0.5px solid rgba(196,122,58,0.15);
    padding: 36px 24px 32px;
  }
  .vp-hero-glow {
    position: absolute;
    top: -60px;
    right: -60px;
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, rgba(196,122,58,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .vp-hero-content {
    position: relative;
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
  }
  .vp-greeting-label {
    font-size: 13px;
    color: #a08060;
    letter-spacing: 0.04em;
    margin-bottom: 8px;
    text-transform: uppercase;
  }
  .vp-name { color: #c47a3a; }
  .vp-hero-title {
    font-size: clamp(22px, 4vw, 32px);
    font-weight: 600;
    color: #f0ebe4;
    line-height: 1.2;
    margin-bottom: 8px;
    letter-spacing: -0.02em;
  }
  .vp-accent-green { color: #5dcaa5; }
  .vp-accent-amber { color: #c47a3a; }
  .vp-hero-sub {
    font-size: 14px;
    color: #887060;
    max-width: 420px;
    line-height: 1.6;
  }

  /* ── Status pill ── */
  .vp-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition: opacity 0.2s, transform 0.2s;
    white-space: nowrap;
  }
  .vp-status-pill:hover { opacity: 0.85; transform: translateY(-1px); }
  .vp-status-green {
    background: rgba(29,158,117,0.14);
    border: 0.5px solid rgba(29,158,117,0.4);
    color: #5dcaa5;
  }
  .vp-status-amber {
    background: rgba(196,122,58,0.14);
    border: 0.5px solid rgba(196,122,58,0.4);
    color: #c47a3a;
  }
  .vp-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .vp-dot-green { background: #1d9e75; }
  .vp-dot-amber { background: #c47a3a; }
  .vp-status-arrow { opacity: 0.6; font-size: 16px; }

  /* ── Body ── */
  .vp-body {
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 24px 64px;
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  /* ── Upgrade Banner ── */
  .vp-upgrade-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
    background: linear-gradient(135deg, #1f1508, #2a1a0a);
    border: 1px solid rgba(196,122,58,0.5);
    border-radius: 20px;
    padding: 28px 28px;
  }
  .vp-upgrade-tag {
    font-size: 11px;
    font-weight: 700;
    color: #c47a3a;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 6px;
  }
  .vp-upgrade-title {
    font-size: 20px;
    font-weight: 700;
    color: #f0ebe4;
    margin-bottom: 6px;
  }
  .vp-upgrade-sub {
    font-size: 13px;
    color: #7a6050;
    line-height: 1.6;
  }
  .vp-upgrade-btn {
    display: inline-flex;
    align-items: center;
    background: #c47a3a;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    padding: 14px 28px;
    border-radius: 14px;
    text-decoration: none;
    white-space: nowrap;
    transition: background 0.2s, transform 0.15s;
    flex-shrink: 0;
  }
  .vp-upgrade-btn:hover {
    background: #d48a46;
    transform: translateY(-1px);
  }

  /* ── Section ── */
  .vp-section {}
  .vp-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .vp-section-title {
    font-size: 18px;
    font-weight: 600;
    color: #f0ebe4;
    letter-spacing: -0.01em;
  }

  /* ── Buttons ── */
  .vp-btn-primary {
    display: inline-flex;
    align-items: center;
    background: #c47a3a;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    padding: 9px 18px;
    border-radius: 10px;
    text-decoration: none;
    transition: background 0.2s, transform 0.15s;
    letter-spacing: 0.01em;
  }
  .vp-btn-primary:hover {
    background: #d48a46;
    transform: translateY(-1px);
  }

  /* ── Pet list ── */
  .vp-pet-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .vp-pet-card {
    display: flex;
    align-items: center;
    gap: 16px;
    background: #181411;
    border: 0.5px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 16px 20px;
    transition: border-color 0.2s, transform 0.2s;
    animation: vp-fade-in 0.4s ease both;
  }
  .vp-pet-card:hover {
    border-color: rgba(196,122,58,0.3);
    transform: translateY(-1px);
  }
  @keyframes vp-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .vp-pet-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(196,122,58,0.12);
    border: 0.5px solid rgba(196,122,58,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
  }
  .vp-pet-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .vp-pet-fallback { font-size: 26px; }

  .vp-pet-info { flex: 1; min-width: 0; }
  .vp-pet-name {
    font-size: 16px;
    font-weight: 600;
    color: #f0ebe4;
    margin-bottom: 3px;
  }
  .vp-pet-meta {
    font-size: 13px;
    color: #7a6050;
    margin-bottom: 8px;
  }

  /* ── Badges ── */
  .vp-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 999px;
  }
  .vp-badge-green {
    background: rgba(29,158,117,0.15);
    color: #5dcaa5;
    border: 0.5px solid rgba(29,158,117,0.3);
  }
  .vp-badge-amber {
    background: rgba(196,122,58,0.15);
    color: #c47a3a;
    border: 0.5px solid rgba(196,122,58,0.3);
  }

  /* ── Pet action links ── */
  .vp-pet-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;
  }
  .vp-link-primary {
    font-size: 13px;
    font-weight: 600;
    color: #c47a3a;
    text-decoration: none;
    transition: color 0.15s;
  }
  .vp-link-primary:hover { color: #e8963d; }
  .vp-link-muted {
    font-size: 12px;
    color: #6a5040;
    text-decoration: none;
    transition: color 0.15s;
  }
  .vp-link-muted:hover { color: #c47a3a; }

  /* ── Empty state ── */
  .vp-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 56px 24px;
    background: #181411;
    border: 1px dashed rgba(255,255,255,0.1);
    border-radius: 20px;
    gap: 12px;
  }
  .vp-empty-icon { font-size: 48px; }
  .vp-empty-title {
    font-size: 18px;
    font-weight: 600;
    color: #f0ebe4;
  }
  .vp-empty-sub {
    font-size: 14px;
    color: #7a6050;
    max-width: 300px;
    line-height: 1.6;
  }

  /* ── Quick actions grid ── */
  .vp-actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
  .vp-action-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 10px;
    background: #181411;
    border: 0.5px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 20px 14px;
    text-decoration: none;
    transition: border-color 0.2s, transform 0.2s, background 0.2s;
    animation: vp-fade-in 0.4s ease both;
    cursor: pointer;
  }
  .vp-action-card:hover {
    border-color: rgba(196,122,58,0.3);
    background: #1e1812;
    transform: translateY(-2px);
  }
  .vp-action-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .vp-action-label {
    font-size: 13px;
    font-weight: 600;
    color: #d0b898;
  }
  .vp-action-sub {
    font-size: 11px;
    color: #6a5040;
    line-height: 1.4;
  }

  /* ── Responsive ── */
  @media (max-width: 600px) {
    .vp-hero { padding: 24px 16px 20px; }
    .vp-body { padding: 24px 16px 48px; }
    .vp-pet-card { flex-wrap: wrap; }
    .vp-pet-actions { align-items: flex-start; flex-direction: row; gap: 12px; }
    .vp-hero-title { font-size: 22px; }
    .vp-status-pill { font-size: 12px; padding: 8px 12px; }
    .vp-upgrade-banner { flex-direction: column; align-items: flex-start; }
    .vp-upgrade-btn { width: 100%; justify-content: center; }
  }
`;