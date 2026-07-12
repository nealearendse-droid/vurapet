'use client';
import InstallBanner from '@/components/InstallBanner';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

// ── Emergency Card Button ──
 
function ChowStreakWidget({ petId, petName, petPhotoUrl, hasPro }: {
  petId: string;
  petName: string;
  petPhotoUrl?: string;
  hasPro: boolean;
}) {
  const [streak, setStreak] = useState(0);
  const [mood, setMood] = useState({ emoji: '😊', img: '/emoji/smiling_face_3d.png', label: 'Full & Happy', color: '#5dcaa5', bg: 'rgba(93,202,165,0.12)', pulse: false });
  const [loaded, setLoaded] = useState(false);
  const [lastMealHours, setLastMealHours] = useState<number | null>(null);
  const [weekCompliance, setWeekCompliance] = useState<number | null>(null);
 
  useEffect(() => {
    if (!petId) return;
    const supabase = createSupabaseBrowserClient();
    supabase
      .from('chow_logs')
      .select('logged_at, outcome')
      .eq('pet_id', petId)
      .order('logged_at', { ascending: false })
      .limit(60)
      .then(({ data }) => {
        const logs = data || [];
 
        // Calc streak
        const days = [...new Set(logs.map((l: any) => new Date(l.logged_at).toDateString()))];
        let s = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          if (days.includes(d.toDateString())) s++;
          else break;
        }
        setStreak(s);
 
        // Hunger mood
        const lastLog = logs[0] ? new Date((logs[0] as any).logged_at) : null;
        const hours = lastLog ? (Date.now() - lastLog.getTime()) / 3_600_000 : 99;
        setLastMealHours(lastLog ? Math.round(hours) : null);
        if (hours < 4)       setMood({ emoji: '😊', img: '/emoji/smiling_face_3d.png',       label: 'Full & Happy',        color: '#5dcaa5', bg: 'rgba(93,202,165,0.12)',  pulse: false });
        else if (hours < 8)  setMood({ emoji: '😐', img: '/emoji/neutral_face_3d.png',        label: 'Getting Peckish',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',   pulse: false });
        else if (hours < 12) setMood({ emoji: '🥺', img: '/emoji/pleading_face_3d.png',       label: 'Really Hungry',       color: '#f97316', bg: 'rgba(249,115,22,0.15)',   pulse: true  });
        else                 setMood({ emoji: '😭', img: '/emoji/loudly_crying_face_3d.png',  label: 'Starving! Feed me NOW',color: '#ef4444', bg: 'rgba(239,68,68,0.15)',    pulse: true  });

        // Week compliance (bowl cleared %)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const weekLogs = logs.filter((l: any) => new Date(l.logged_at) >= sevenDaysAgo);
        if (weekLogs.length > 0) {
          const cleared = weekLogs.filter((l: any) => l.outcome === 'cleared').length;
          setWeekCompliance(Math.round((cleared / weekLogs.length) * 100));
        }
 
        setLoaded(true);
      });
  }, [petId, hasPro]);
 
 
  if (!loaded) return null;
 
  return (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: '#c47a3a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      <img src="/emoji/fire_3d.png" alt="Fire" style={{ width: 14, height: 14, verticalAlign: 'middle', marginRight: 4 }} /> Chow Streak
    </div>
    <Link href="/dashboard/chow-streak" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '9px 16px', background: mood.bg, border: `1px solid ${mood.color}44`, borderRadius: 10, textDecoration: 'none', transition: 'transform 0.2s, opacity 0.2s', whiteSpace: 'nowrap' }} onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')} onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${mood.color}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, background: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>
        {petPhotoUrl
          ? <img src={petPhotoUrl} alt={petName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <img src="/emoji/paw_prints_3d.png" alt="No photo" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />}
      </div>
      <img
        src={mood.img}
        alt={mood.label}
        style={{
          width: 22,
          height: 22,
          animation: mood.pulse ? 'mood-pulse 1.5s ease-in-out infinite' : 'none',
        }}
      />
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: mood.color, display: 'flex', alignItems: 'center', gap: 4 }}><img src="/emoji/fire_3d.png" alt="Fire" style={{ width: 14, height: 14 }} /> {streak} day streak</div>
        <div style={{ fontSize: 10, color: '#7a6050' }}>{mood.label}</div>
      </div>
      <style>{`
        @keyframes mood-pulse {
          0%,100% { transform:scale(1); }
          50% { transform:scale(1.15); }
        }
      `}</style>
    </Link>
    <div style={{ fontSize: 11, color: '#7a6050' }}>
      {lastMealHours !== null ? `Last meal: ${lastMealHours}h ago` : 'No meals logged yet'}
      {weekCompliance !== null ? ` · ${weekCompliance}% bowl cleared this week` : ''}
    </div>
  </div>
);
}

function TodayCard({ petId, petName, memories }: {
  petId: string;
  petName: string;
  memories: any[];
}) {
  const [loaded, setLoaded] = useState(false);
  const [dinnerLogged, setDinnerLogged] = useState(false);
  const [waterLogged, setWaterLogged] = useState(false);
  const [stoolLogged, setStoolLogged] = useState(false);
  const [weightLogged, setWeightLogged] = useState(false);
  const [waterAlert, setWaterAlert] = useState(false);
  const [todayMemory, setTodayMemory] = useState<any>(null);

  useEffect(() => {
    if (!petId) return;
    const supabase = createSupabaseBrowserClient();
    const todayStr = new Date().toDateString();

    supabase
      .from('chow_logs')
      .select('logged_at, water_intake, stool_quality')
      .eq('pet_id', petId)
      .order('logged_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        const logs = data || [];
        const todayLogs = logs.filter((l: any) => new Date(l.logged_at).toDateString() === todayStr);
        setDinnerLogged(todayLogs.length > 0);
        setWaterLogged(todayLogs.some((l: any) => l.water_intake));
        setStoolLogged(todayLogs.some((l: any) => l.stool_quality));

        const concerning = ['More than usual', 'Much more than usual'];
        const byDay: Record<string, string | null> = {};
        for (const l of logs) {
          const day = new Date(l.logged_at).toDateString();
          if (!byDay[day] && l.water_intake) byDay[day] = l.water_intake;
        }
        const last7Days = Object.values(byDay).slice(0, 7);
        setWaterAlert(last7Days.length === 7 && last7Days.every((v) => v && concerning.includes(v)));
      });

    const todayISO = new Date().toISOString().slice(0, 10);
    supabase
      .from('weight_entries')
      .select('recorded_at')
      .eq('pet_id', petId)
      .eq('recorded_at', todayISO)
      .then(({ data }) => {
        setWeightLogged((data || []).length > 0);
        setLoaded(true);
      });
  }, [petId]);

  useEffect(() => {
    if (!memories?.length) return;
    const today = new Date();
    const match = memories.find((m: any) => {
      const d = new Date(m.date);
      return d.getMonth() === today.getMonth() && d.getDate() === today.getDate() && d.getFullYear() !== today.getFullYear();
    });
    setTodayMemory(match || null);
  }, [memories]);

  if (!loaded) return null;

  const checklistItems = [
    { label: 'Log dinner', done: dinnerLogged, href: '/dashboard/chow-streak' },
    { label: 'Log water intake', done: waterLogged, href: '/dashboard/chow-streak' },
    { label: 'Log stool quality', done: stoolLogged, href: '/dashboard/chow-streak' },
    { label: `Check ${petName}'s weight`, done: weightLogged, href: `/pets/${petId}/weight-tracker` },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#181411', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 22px', marginTop: 16 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#a08060', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          📋 Today's Checklist
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {checklistItems.map(item => (
            <Link key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: item.done ? '#5dcaa5' : '#c47a3a', fontSize: 13 }}>
              <span>{item.done ? '✅' : '⬜'}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {waterAlert && (
        <div style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.05)' }}>
          <p style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>💧 Heads up</p>
          <p style={{ fontSize: 13, color: '#e8d5b7', lineHeight: 1.5 }}>
            {petName} has been drinking more than usual for 7 days in a row. Worth mentioning to your vet.
          </p>
        </div>
      )}

      {todayMemory && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#a08060', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            💛 On This Day
          </div>
          <Link href="/pets/memories" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f0ebe4', marginBottom: 4 }}>{todayMemory.title}</div>
            <div style={{ fontSize: 12, color: '#7a6050' }}>{new Date(todayMemory.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </Link>
        </div>
      )}
    </div>
  );
}

function EmergencyCardButton({ petId, petName, emergencyToken }: {
  petId: string;
  petName: string;
  emergencyToken?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [panelTop, setPanelTop] = useState(0);
  const [panelLeft, setPanelLeft] = useState(0);

  const token = emergencyToken;
  const cardUrl = token
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/emergency/${token}`
    : '';

  const handleClick = () => {
    if (!token) {
      alert('No emergency token found. Please refresh the page and try again.');
      return;
    }
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPanelTop(rect.bottom + window.scrollY + 10);
      setPanelLeft(rect.left + window.scrollX);
    }
    setOpen(!open);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(cardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '9px 18px',
          background: open ? '#dc2626' : 'rgba(220,38,38,0.85)',
          color: '#fff',
          border: '1px solid rgba(220,38,38,0.6)',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'inherit',
          letterSpacing: '0.02em',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap',
        }}
      >
        🆘 Emergency Card
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 998 }}
        />
      )}

      {open && token && (
        <div
          style={{
            position: 'fixed',
            top: panelTop,
            left: panelLeft,
            zIndex: 9999,
            background: '#1a1410',
            border: '1px solid rgba(220,38,38,0.35)',
            borderRadius: 16,
            boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
            padding: 20,
            width: 300,
            maxHeight: '80vh',
            overflowY: 'auto' as const,
            color: '#f0ebe4',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f87171' }}>🆘 {petName}'s Emergency Card</div>
              <div style={{ fontSize: 11, color: '#7a6050', marginTop: 2 }}>Public · No login needed to view</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#7a6050', lineHeight: 1, marginLeft: 8 }}
            >×</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <div style={{ background: '#fff', padding: 10, borderRadius: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(cardUrl)}`}
                alt="Emergency Card QR Code"
                width={180}
                height={180}
                style={{ display: 'block' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              onClick={copyLink}
              style={{
                flex: 1, padding: '9px 0',
                background: copied ? '#16a34a' : '#1d4ed8',
                color: '#fff', border: 'none', borderRadius: 8,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'background 0.2s',
              }}
            >
              {copied ? '✓ Copied!' : '🔗 Copy Link'}
            </button>
            <a
              href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(cardUrl)}`}
              download={`${petName}-emergency-qr.png`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1, padding: '9px 0',
                background: '#dc2626', color: '#fff',
                border: 'none', borderRadius: 8,
                fontSize: 12, fontWeight: 600,
                fontFamily: 'inherit', textDecoration: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ⬇ Download QR
            </a>
          </div>

          <a
            href={cardUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block', textAlign: 'center',
              fontSize: 12, color: '#c47a3a',
              marginBottom: 14, textDecoration: 'none',
            }}
          >
            👁 Preview emergency card ↗
          </a>

          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#a08060', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              📋 How to use
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#7a6050', lineHeight: 1.9 }}>
              <li><strong style={{ color: '#a08060' }}>Print the QR code</strong> — attach to collar tag or carrier</li>
              <li><strong style={{ color: '#a08060' }}>Save the link</strong> — in your phone notes or wallet</li>
              <li><strong style={{ color: '#a08060' }}>Share with neighbours</strong> or pet sitters</li>
              <li>Anyone who scans it sees {petName}'s full profile — <em>no login needed</em></li>
              <li>Always shows your <strong style={{ color: '#a08060' }}>latest info</strong> automatically</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const [pets, setPets] = useState<any[]>([]);
  const [guardians, setGuardians] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userPlan, setUserPlan] = useState('free');
  const [isRescueHero, setIsRescueHero] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', session.user.id)
        .single();

      setUserPlan(profile?.subscription_plan || 'free');
      const isRescueHero = session.user.email === 'helena@example.com';
      setIsRescueHero(isRescueHero);

      const name = session.user.user_metadata?.full_name
        || session.user.email?.split('@')[0]
        || 'there';
      setUserName(name.split(' ')[0]);

      const { data: petsData } = await supabase
        .from('pets')
        .select('*, emergency_token, emergency_card_enabled')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      const { data: guardiansData } = await supabase
        .from('guardians')
        .select('id, pet_id');

      const { data: memoriesData } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', session.user.id);

      setPets(petsData || []);
      setGuardians(guardiansData || []);
      setMemories(memoriesData || []);
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

  const hasPro = userPlan === 'pro' || userPlan === 'family' || isRescueHero;

  const maxPets = isRescueHero ? 12 : userPlan === 'family' ? 5 : 1;
  const maxGuardians = userPlan === 'family' || isRescueHero ? 999 : 1;
  const maxMemories = userPlan === 'free' ? 5 : 999;

  const currentMemoriesCount = memories.length;
  const canAddMemory = currentMemoriesCount < maxMemories;

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
  const firstPet = pets[0];

  return (
    <div className="vp-dash">
      <InstallBanner />
      <style>{dashStyles}</style>

      {/* ── Hero greeting ── */}
      {/* ── Hero greeting ── */}
      {pets.length === 0 ? (
        <div className="vp-hero">
          <div className="vp-hero-glow" />
          <div className="vp-hero-content">
            <div className="vp-hero-left">
              <p className="vp-greeting-label">
                {greeting}, <span className="vp-name">{userName}</span>
              </p>
              <h1 className="vp-hero-title">
                Welcome to <span className="vp-accent-amber">VuraPet</span>
              </h1>
              <p className="vp-hero-sub">
                Let's set up your pet's lifetime care plan. Add your first pet to get started — it only takes a minute.
              </p>
              <div style={{ marginTop: 16 }}>
                <Link href="/dashboard/add-pet" className="vp-btn-primary">+ Add My First Pet</Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
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
                ? `${guardians.length} guardian${guardians.length > 1 ? 's' : ''} ready to step in — the essentials are covered.`
                : 'Add a guardian so someone always knows how to care for your pet.'}
            </p>

            {firstPet && (
  <>
    <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      <EmergencyCardButton
        petId={firstPet.id}
        petName={firstPet.name}
        emergencyToken={firstPet.emergency_token}
      />
      <ChowStreakWidget
        petId={firstPet.id}
        petName={firstPet.name}
        petPhotoUrl={firstPet.profile_photo_url || firstPet.photo_url}
        hasPro={hasPro}
      />
    </div>
    <TodayCard
      petId={firstPet.id}
      petName={firstPet.name}
      memories={memories}
    />
  </>
)}
          </div>

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
      )}

      {/* ── Main body ── */}
      <div className="vp-body">

        {pets.length > 0 && (
        <div style={{ background: '#333', color: 'white', padding: '8px', marginBottom: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '12px' }}>
          📋 Plan: {userPlan} {userPlan === 'free' && `🔒 ${pets.length}/1 pets • ${guardians.length}/1 guardians • ${currentMemoriesCount}/${maxMemories} memories used`}
          {userPlan === 'pro' && '✅ 1 pet • 1 guardian • Unlimited memories'}
          {userPlan === 'family' && '✅ 5 pets • Unlimited guardians • Unlimited memories'}
        </div>
        )}

        <section className="vp-section">
          <div className="vp-section-header">
            <h2 className="vp-section-title">
              My Pets ({pets.length}/{maxPets === 5 ? '5' : maxPets === 1 ? '1' : maxPets})
              {userPlan === 'pro' && pets.length >= 1 && (
                <span style={{ fontSize: '12px', marginLeft: '10px', color: '#8B5CF6' }}>
                  🔒 Need more? <Link href="/upgrade?plan=family" style={{ color: '#8B5CF6', textDecoration: 'underline' }}>Upgrade to Family</Link>
                </span>
              )}
            </h2>
            {pets.length < maxPets ? (
              <Link href="/dashboard/add-pet" className="vp-btn-primary">+ Add Pet</Link>
            ) : userPlan === 'pro' && pets.length >= 1 ? (
              <Link href="/upgrade?plan=family&billing=monthly" className="vp-btn-primary" style={{ background: '#8B5CF6' }}>
                👨‍👩‍👧‍👦 Upgrade to Family Plan (5 pets)
              </Link>
            ) : (
              <button disabled className="vp-btn-primary opacity-50 cursor-not-allowed">
                + Add Pet (Max {maxPets})
              </button>
            )}
          </div>

          {pets.length === 0 ? (
            <div className="vp-empty">
              <div className="vp-empty-icon">🐾</div>
              <h3 className="vp-empty-title">No pets yet</h3>
              <p className="vp-empty-sub">Add your first pet to start their lifetime care plan.</p>
              <Link href="/dashboard/add-pet" className="vp-btn-primary">+ Add My First Pet</Link>
            </div>
          ) : (
            <div className="vp-pet-list">
              {pets.map((pet, i) => {
                const hasGuardian = petHasGuardian(pet.id);
                const photoUrl = pet.profile_photo_url || pet.photo_url;
                return (
                  <div key={pet.id} className="vp-pet-card" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="vp-pet-avatar">
                      {photoUrl ? (
                        <img src={photoUrl} alt={pet.name} className="vp-pet-photo" />
                      ) : (
                        <span className="vp-pet-fallback">🐾</span>
                      )}
                    </div>
                    <div className="vp-pet-info">
                      <h3 className="vp-pet-name">{pet.name}</h3>
                      <p className="vp-pet-meta">{[pet.breed, pet.species].filter(Boolean).join(' · ')}</p>
                      {hasGuardian ? (
                        <span className="vp-badge vp-badge-green">🛡️ Protected</span>
                      ) : (
                        <span className="vp-badge vp-badge-amber">⚠️ No guardian yet</span>
                      )}
                    </div>
                    <div className="vp-pet-actions">
                      <Link href={`/pets/${pet.id}`} className="vp-link-primary">View Profile →</Link>
                      {!hasGuardian && guardians.length < maxGuardians && (
                        <Link href="/pets/guardian/add" className="vp-link-muted">
                          + Add Guardian ({guardians.length}/{maxGuardians === 999 ? '∞' : maxGuardians})
                        </Link>
                      )}
                      {!hasGuardian && guardians.length >= maxGuardians && (
                        <span className="vp-link-muted opacity-50">Guardian limit reached</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {!canAddMemory && userPlan === 'free' && (
          <div className="bg-orange-500 text-white p-3 rounded-xl text-center">
            ⚠️ You've reached the {maxMemories} memory limit on the Free plan.
            <Link href="/upgrade?plan=pro" className="underline ml-2">Upgrade to Pro</Link> for unlimited memories.
          </div>
        )}

        <section className="vp-section">
          <h2 className="vp-section-title" style={{ marginBottom: '1rem' }}>Quick Actions</h2>
          <div className="vp-actions-grid">

            <Link href="/dashboard/chow-streak" className="vp-action-card">
  <div className="vp-action-icon" style={{ background: 'rgba(196,122,58,0.15)' }}><span style={{ fontSize: 22 }}>🔥</span></div>
  <p className="vp-action-label">Chow Streak</p>
  <p className="vp-action-sub">Feed · Track · Level up</p>
</Link>

            <Link href="/pets/safe-food" className="vp-action-card">
              <div className="vp-action-icon" style={{ background: '#1d9e7522' }}><span style={{ fontSize: 22 }}>🍎</span></div>
              <p className="vp-action-label">Food Checker</p>
              <p className="vp-action-sub">Safe or unsafe?</p>
            </Link>

            <Link href="/pets/guardian" className="vp-action-card">
              <div className="vp-action-icon" style={{ background: '#378add22' }}><span style={{ fontSize: 22 }}>🛡️</span></div>
              <p className="vp-action-label">Guardians</p>
              <p className="vp-action-sub">Protect your pet</p>
            </Link>

            <Link href="/pets/memories" className="vp-action-card">
              <div className="vp-action-icon" style={{ background: '#d4537e22' }}><span style={{ fontSize: 22 }}>📸</span></div>
              <p className="vp-action-label">Memory Book</p>
              <p className="vp-action-sub">{userPlan === 'free' ? `${currentMemoriesCount}/${maxMemories} memories` : 'Unlimited memories'}</p>
            </Link>

            <Link href={`/pets/${pets[0]?.id}/weight-tracker`} className="vp-action-card">
              <div className="vp-action-icon" style={{ background: '#c47a3a22' }}><span style={{ fontSize: 22 }}>⚖️</span></div>
              <p className="vp-action-label">Weight Tracker</p>
              <p className="vp-action-sub">Track and analyse trends</p>
            </Link>

            {hasPro ? (
              <Link href={`/pets/${pets[0]?.id}/health-journal`} className="vp-action-card">
                <div className="vp-action-icon" style={{ background: '#c47a3a22' }}><span style={{ fontSize: 22 }}>📋</span></div>
                <p className="vp-action-label">Health Journal</p>
                <p className="vp-action-sub">Track health</p>
              </Link>
            ) : (
              <div onClick={() => router.push('/upgrade?plan=pro')} className="vp-action-card" style={{ cursor: 'pointer' }}>
                <div className="vp-action-icon" style={{ background: '#c47a3a22', opacity: 0.6 }}><span style={{ fontSize: 22 }}>📋</span></div>
                <p className="vp-action-label">Health Journal <span style={{ background: '#c47a3a', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '20px', marginLeft: '6px' }}>PRO</span></p>
                <p className="vp-action-sub" style={{ color: '#c47a3a' }}>Upgrade to unlock →</p>
              </div>
            )}

            {hasPro ? (
              pets[0] ? (
                <Link href={`/pets/${pets[0].id}/vaccines`} className="vp-action-card">
                  <div className="vp-action-icon" style={{ background: '#c47a3a22' }}><span style={{ fontSize: 22 }}>💉</span></div>
                  <p className="vp-action-label">Vaccine Calendar</p>
                  <p className="vp-action-sub">Never miss a shot</p>
                </Link>
              ) : (
                <div className="vp-action-card" style={{ opacity: 0.5 }}>
                  <div className="vp-action-icon" style={{ background: '#c47a3a22' }}><span style={{ fontSize: 22 }}>💉</span></div>
                  <p className="vp-action-label">Vaccine Calendar</p>
                  <p className="vp-action-sub">Add a pet first</p>
                </div>
              )
            ) : (
              <div onClick={() => router.push('/upgrade?plan=pro')} className="vp-action-card" style={{ cursor: 'pointer' }}>
                <div className="vp-action-icon" style={{ background: '#c47a3a22', opacity: 0.6 }}><span style={{ fontSize: 22 }}>💉</span></div>
                <p className="vp-action-label">Vaccine Calendar <span style={{ background: '#c47a3a', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '20px', marginLeft: '6px' }}>PRO</span></p>
                <p className="vp-action-sub" style={{ color: '#c47a3a' }}>Upgrade to unlock →</p>
              </div>
            )}

            

            {hasPro ? (
              pets[0] ? (
                <Link href={`/pets/${pets[0].id}/travel`} className="vp-action-card">
                  <div className="vp-action-icon" style={{ background: '#0F6E5622' }}><span style={{ fontSize: 22 }}>✈️</span></div>
                  <p className="vp-action-label">Travel Planner</p>
                  <p className="vp-action-sub">Requirements & timeline</p>
                </Link>
              ) : (
                <div className="vp-action-card" style={{ opacity: 0.5 }}>
                  <div className="vp-action-icon" style={{ background: '#0F6E5622' }}><span style={{ fontSize: 22 }}>✈️</span></div>
                  <p className="vp-action-label">Travel Planner</p>
                  <p className="vp-action-sub">Add a pet first</p>
                </div>
              )
            ) : (
              <div onClick={() => router.push('/upgrade?plan=pro')} className="vp-action-card" style={{ cursor: 'pointer' }}>
                <div className="vp-action-icon" style={{ background: '#0F6E5622', opacity: 0.6 }}><span style={{ fontSize: 22 }}>✈️</span></div>
                <p className="vp-action-label">Travel Planner <span style={{ background: '#c47a3a', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '20px', marginLeft: '6px' }}>PRO</span></p>
                <p className="vp-action-sub" style={{ color: '#c47a3a' }}>Upgrade to unlock →</p>
              </div>
            )}

            {hasPro ? (
              <Link href={`/pets/${pets[0]?.id}/emergency-care`} className="vp-action-card">
                <div className="vp-action-icon" style={{ background: '#c47a3a22' }}><span style={{ fontSize: 22 }}>🚑</span></div>
                <p className="vp-action-label">Emergency Care</p>
                <p className="vp-action-sub">Vet-ready document</p>
              </Link>
            ) : (
              <div onClick={() => router.push('/upgrade?plan=pro')} className="vp-action-card" style={{ cursor: 'pointer' }}>
                <div className="vp-action-icon" style={{ background: '#c47a3a22', opacity: 0.6 }}><span style={{ fontSize: 22 }}>🚑</span></div>
                <p className="vp-action-label">Emergency Care <span style={{ background: '#c47a3a', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '20px', marginLeft: '6px' }}>PRO</span></p>
                <p className="vp-action-sub" style={{ color: '#c47a3a' }}>Upgrade to unlock →</p>
              </div>
            )}

 {hasPro ? (
  <Link href="/dashboard/nutrition" className="vp-action-card">
    <div className="vp-action-icon" style={{ background: '#c47a3a22' }}><span style={{ fontSize: 22 }}>🥗</span></div>
    <p className="vp-action-label">Nutrition Plan</p>
    <p className="vp-action-sub">Custom meal plans</p>
  </Link>
) : (
  <div onClick={() => router.push('/upgrade?plan=pro')} className="vp-action-card" style={{ cursor: 'pointer' }}>
    <div className="vp-action-icon" style={{ background: '#c47a3a22', opacity: 0.6 }}><span style={{ fontSize: 22 }}>🥗</span></div>
    <p className="vp-action-label">Nutrition Plan <span style={{ background: '#c47a3a', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '20px', marginLeft: '6px' }}>PRO</span></p>
    <p className="vp-action-sub" style={{ color: '#c47a3a' }}>Upgrade to unlock →</p>
  </div>
)}

{hasPro ? (
              <Link href="/dashboard/breed-intelligence" className="vp-action-card">
                <div className="vp-action-icon" style={{ background: '#8b6dd422' }}><span style={{ fontSize: 22 }}>🧠</span></div>
                <p className="vp-action-label">Breed Intelligence</p>
                <p className="vp-action-sub">Know your breed</p>
              </Link>
            ) : (
              <div onClick={() => router.push('/upgrade?plan=pro')} className="vp-action-card" style={{ cursor: 'pointer' }}>
                <div className="vp-action-icon" style={{ background: '#8b6dd422', opacity: 0.6 }}><span style={{ fontSize: 22 }}>🧠</span></div>
                <p className="vp-action-label">Breed Intelligence <span style={{ background: '#c47a3a', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '20px', marginLeft: '6px' }}>PRO</span></p>
                <p className="vp-action-sub" style={{ color: '#c47a3a' }}>Upgrade to unlock →</p>
              </div>
            )}

          </div>
        </section>
      </div>
    </div>
  );
}

const loadingStyles = `
  .vp-loading { display:flex; align-items:center; justify-content:center; min-height:60vh; }
  .vp-loading-inner { display:flex; flex-direction:column; align-items:center; gap:14px; }
  .vp-loading-logo { animation:vp-pulse 1.4s ease-in-out infinite; object-fit:contain; }
  .vp-loading-text { font-size:14px; color:#a08060; letter-spacing:0.04em; }
  @keyframes vp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.92)} }
`;

const dashStyles = `
  .vp-dash { font-family:'Geist','Inter',sans-serif; background:#0c0a08; min-height:100vh; color:#f0ebe4; }
  .vp-hero { position:relative; background:linear-gradient(160deg,#1a1410 0%,#120f0c 100%); border-bottom:0.5px solid rgba(196,122,58,0.15); padding:36px 24px 32px; }
  .vp-hero-glow { position:absolute; top:-60px; right:-60px; width:320px; height:320px; background:radial-gradient(circle,rgba(196,122,58,0.12) 0%,transparent 70%); pointer-events:none; }
  .vp-hero-content { position:relative; max-width:900px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap; }
  .vp-greeting-label { font-size:13px; color:#a08060; letter-spacing:0.04em; margin-bottom:8px; text-transform:uppercase; }
  .vp-name { color:#c47a3a; }
  .vp-hero-title { font-size:clamp(22px,4vw,32px); font-weight:600; color:#f0ebe4; line-height:1.2; margin-bottom:8px; letter-spacing:-0.02em; }
  .vp-accent-green { color:#5dcaa5; }
  .vp-accent-amber { color:#c47a3a; }
  .vp-hero-sub { font-size:14px; color:#887060; max-width:420px; line-height:1.6; }
  .vp-status-pill { display:inline-flex; align-items:center; gap:8px; padding:10px 16px; border-radius:999px; font-size:13px; font-weight:500; text-decoration:none; transition:opacity 0.2s,transform 0.2s; white-space:nowrap; }
  .vp-status-pill:hover { opacity:0.85; transform:translateY(-1px); }
  .vp-status-green { background:rgba(29,158,117,0.14); border:0.5px solid rgba(29,158,117,0.4); color:#5dcaa5; }
  .vp-status-amber { background:rgba(196,122,58,0.14); border:0.5px solid rgba(196,122,58,0.4); color:#c47a3a; }
  .vp-status-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
  .vp-dot-green { background:#1d9e75; }
  .vp-dot-amber { background:#c47a3a; }
  .vp-status-arrow { opacity:0.6; font-size:16px; }
  .vp-body { max-width:900px; margin:0 auto; padding:32px 24px 64px; display:flex; flex-direction:column; gap:40px; }
  .vp-upgrade-banner { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px; background:linear-gradient(135deg,#1f1508,#2a1a0a); border:1px solid rgba(196,122,58,0.5); border-radius:20px; padding:28px; }
  .vp-upgrade-tag { font-size:11px; font-weight:700; color:#c47a3a; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:6px; }
  .vp-upgrade-title { font-size:20px; font-weight:700; color:#f0ebe4; margin-bottom:6px; }
  .vp-upgrade-sub { font-size:13px; color:#7a6050; line-height:1.6; }
  .vp-upgrade-btn { display:inline-flex; align-items:center; background:#c47a3a; color:#fff; font-size:15px; font-weight:700; padding:14px 28px; border-radius:14px; text-decoration:none; white-space:nowrap; transition:background 0.2s,transform 0.15s; flex-shrink:0; }
  .vp-upgrade-btn:hover { background:#d48a46; transform:translateY(-1px); }
  .vp-section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .vp-section-title { font-size:18px; font-weight:600; color:#f0ebe4; letter-spacing:-0.01em; }
  .vp-btn-primary { display:inline-flex; align-items:center; background:#c47a3a; color:#fff; font-size:13px; font-weight:600; padding:9px 18px; border-radius:10px; text-decoration:none; transition:background 0.2s,transform 0.15s; letter-spacing:0.01em; }
  .vp-btn-primary:hover { background:#d48a46; transform:translateY(-1px); }
  .vp-pet-list { display:flex; flex-direction:column; gap:12px; }
  .vp-pet-card { display:flex; align-items:center; gap:16px; background:#181411; border:0.5px solid rgba(255,255,255,0.07); border-radius:16px; padding:16px 20px; transition:border-color 0.2s,transform 0.2s; animation:vp-fade-in 0.4s ease both; }
  .vp-pet-card:hover { border-color:rgba(196,122,58,0.3); transform:translateY(-1px); }
  @keyframes vp-fade-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .vp-pet-avatar { width:64px; height:64px; border-radius:50%; background:rgba(196,122,58,0.12); border:0.5px solid rgba(196,122,58,0.25); display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0; }
  .vp-pet-photo { width:100%; height:100%; object-fit:cover; }
  .vp-pet-fallback { font-size:26px; }
  .vp-pet-info { flex:1; min-width:0; }
  .vp-pet-name { font-size:16px; font-weight:600; color:#f0ebe4; margin-bottom:3px; }
  .vp-pet-meta { font-size:13px; color:#7a6050; margin-bottom:8px; }
  .vp-badge { display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:600; padding:3px 10px; border-radius:999px; }
  .vp-badge-green { background:rgba(29,158,117,0.15); color:#5dcaa5; border:0.5px solid rgba(29,158,117,0.3); }
  .vp-badge-amber { background:rgba(196,122,58,0.15); color:#c47a3a; border:0.5px solid rgba(196,122,58,0.3); }
  .vp-pet-actions { display:flex; flex-direction:column; align-items:flex-end; gap:6px; flex-shrink:0; }
  .vp-link-primary { font-size:13px; font-weight:600; color:#c47a3a; text-decoration:none; transition:color 0.15s; }
  .vp-link-primary:hover { color:#e8963d; }
  .vp-link-muted { font-size:12px; color:#6a5040; text-decoration:none; transition:color 0.15s; }
  .vp-link-muted:hover { color:#c47a3a; }
  .vp-empty { display:flex; flex-direction:column; align-items:center; text-align:center; padding:56px 24px; background:#181411; border:1px dashed rgba(255,255,255,0.1); border-radius:20px; gap:12px; }
  .vp-empty-icon { font-size:48px; }
  .vp-empty-title { font-size:18px; font-weight:600; color:#f0ebe4; }
  .vp-empty-sub { font-size:14px; color:#7a6050; max-width:300px; line-height:1.6; }
  .vp-actions-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:12px; }
  .vp-action-card { display:flex; flex-direction:column; align-items:center; text-align:center; gap:10px; background:#181411; border:0.5px solid rgba(255,255,255,0.07); border-radius:16px; padding:20px 14px; text-decoration:none; transition:border-color 0.2s,transform 0.2s,background 0.2s; animation:vp-fade-in 0.4s ease both; cursor:pointer; }
  .vp-action-card:hover { border-color:rgba(196,122,58,0.3); background:#1e1812; transform:translateY(-2px); }
  .vp-action-icon { width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; }
  .vp-action-label { font-size:13px; font-weight:600; color:#d0b898; }
  .vp-action-sub { font-size:11px; color:#6a5040; line-height:1.4; }
  @media(max-width:600px) {
    .vp-hero { padding:24px 16px 20px; }
    .vp-body { padding:24px 16px 48px; }
    .vp-pet-card { flex-wrap:wrap; }
    .vp-pet-actions { align-items:flex-start; flex-direction:row; gap:12px; }
    .vp-hero-title { font-size:22px; }
    .vp-status-pill { font-size:12px; padding:8px 12px; }
    .vp-upgrade-banner { flex-direction:column; align-items:flex-start; }
    .vp-upgrade-btn { width:100%; justify-content:center; }
  }
`;