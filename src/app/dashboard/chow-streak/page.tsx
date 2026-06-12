'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

// ── Types ──
interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  profile_photo_url?: string;
  photo_url?: string;
}

interface ChowLog {
  id: string;
  logged_at: string;
  outcome: 'cleared' | 'leftovers';
  pantry_days_remaining?: number;
}

// ── Pet reaction quotes ──
const PET_REACTIONS: Record<string, string[]> = {
  dog: [
    "That hit the spot! 🐕",
    "Can we have seconds? Please? PLEASE?",
    "You're the best human in the whole world.",
    "My tail has been activated. Full speed.",
    "Bowl status: absolutely destroyed. Well done.",
    "I have never been more satisfied in my life.",
    "I'll need this exact meal again tomorrow. Same time.",
    "You remembered! You always remember. I love you.",
    "10/10. Would recommend. Would eat again immediately.",
    "The bowl is gone. I don't know what happened.",
  ],
  cat: [
    "Adequate.",
    "You may continue serving me.",
    "The bowl servant has succeeded today.",
    "I suppose you'll do.",
    "I have noticed the food. I'll decide how I feel shortly.",
    "Satisfactory. Do not expect praise.",
    "This will sustain me. For now.",
    "You timed this correctly. Don't let it happen again.",
    "I ate. You're welcome.",
    "One must maintain standards. This met them. Barely.",
  ],
  default: [
    "Delicious! Thank you!",
    "That was wonderful.",
    "You're the best!",
    "Meal approved!",
    "More please?",
  ],
};

function getRandomReaction(species: string): string {
  const key = species?.toLowerCase().includes('cat') ? 'cat'
    : species?.toLowerCase().includes('dog') ? 'dog'
    : 'default';
  const pool = PET_REACTIONS[key];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Evolution titles ──
const HEARTS_PER_CLEARED = 3;
const HEARTS_PER_LEFTOVERS = 1;

function getEvolutionTitle(hearts: number, species: string, clearPct: number): {
  title: string; emoji: string; nextAt: number | null; description: string;
} {
  const isCat = species?.toLowerCase().includes('cat');
  if (hearts >= 500) return {
    title: isCat ? 'Eternal Feast Empress' : 'Eternal Feast Guardian',
    emoji: '👑', nextAt: null,
    description: 'A legend. A meal. A legacy.',
  };
  if (hearts >= 200) return {
    title: clearPct >= 80 ? 'Supreme Snack Hunter' : 'Selective Gourmet',
    emoji: '🏆', nextAt: 500,
    description: 'Near-mythical status. The bowl trembles.',
  };
  if (hearts >= 100) return {
    title: isCat ? 'Dinner Diva' : 'Legendary Chow Beast',
    emoji: '🌟', nextAt: 200,
    description: 'Respect is mandatory at dinnertime.',
  };
  if (hearts >= 50) return {
    title: clearPct >= 70 ? 'Food Ninja' : 'Free Spirit Foodie',
    emoji: '🥷', nextAt: 100,
    description: 'Meals appear. Meals vanish. No witnesses.',
  };
  if (hearts >= 25) return {
    title: isCat ? 'Treat Duchess' : 'Treat Goblin',
    emoji: '😋', nextAt: 50,
    description: 'Fully committed. Zero regrets.',
  };
  if (hearts >= 10) return {
    title: 'Champion Chomper',
    emoji: '🏅', nextAt: 25,
    description: 'A serious eater. Taking this very seriously.',
  };
  if (hearts >= 3) return {
    title: 'Good Eater',
    emoji: '🍽️', nextAt: 10,
    description: 'Getting into the groove.',
  };
  return {
    title: 'Picky Eater',
    emoji: '🙈', nextAt: 3,
    description: 'Every legend starts somewhere.',
  };
}

// ── Hunger mood logic ──
function getHungerMood(lastMealAt: Date | null): {
  emoji: string;
  label: string;
  color: string;
  bg: string;
  pulse: boolean;
} {
  if (!lastMealAt) {
    return { emoji: '😭', label: 'Starving! Feed me NOW', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', pulse: true };
  }
  const hours = (Date.now() - lastMealAt.getTime()) / 3_600_000;
  if (hours < 4)  return { emoji: '😊', label: 'Full & Happy',        color: '#5dcaa5', bg: 'rgba(93,202,165,0.12)', pulse: false };
  if (hours < 8)  return { emoji: '😐', label: 'Getting Peckish',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  pulse: false };
  if (hours < 12) return { emoji: '🥺', label: 'Really Hungry',       color: '#f97316', bg: 'rgba(249,115,22,0.15)', pulse: true  };
  return           { emoji: '😭', label: 'Starving! Feed me NOW',      color: '#ef4444', bg: 'rgba(239,68,68,0.15)',  pulse: true  };
}

// ── Pet title logic ──
function getPetTitle(streak: number): { title: string; emoji: string; next: number | null } {
  if (streak >= 30) return { title: 'Legendary Bowl Destroyer', emoji: '👑', next: null };
  if (streak >= 14) return { title: 'Champion Chomper',          emoji: '🏅', next: 30   };
  if (streak >= 7)  return { title: 'Good Eater',                emoji: '😋', next: 14   };
  return                    { title: 'Picky Eater',               emoji: '🙈', next: 7    };
}

// ── Owner badge logic ──
function getOwnerBadge(streak: number): { badge: string; emoji: string; next: number | null } {
  if (streak >= 30) return { badge: 'King Cheetah',   emoji: '🐆', next: null };
  if (streak >= 14) return { badge: 'Honey Badger',   emoji: '🦡', next: 30   };
  if (streak >= 7)  return { badge: 'Cape Fox',        emoji: '🦊', next: 14   };
  if (streak >= 3)  return { badge: 'Mongoose',        emoji: '🦦', next: 7    };
  return                    { badge: 'Meerkat',         emoji: '🐾', next: 3    };
}

// ── Welcome Modal ──
function WelcomeModal({ petName, onClose }: { petName: string; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(0,0,0,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      animation: 'cs-fade-in 0.3s ease',
    }}>
      <div style={{
        background: 'linear-gradient(160deg,#1e1812,#140f0a)',
        border: '1px solid rgba(196,122,58,0.35)',
        borderRadius: 28, padding: '36px 32px',
        maxWidth: 380, width: '100%',
        textAlign: 'center',
        animation: 'cs-pop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🔥</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f0ebe4', marginBottom: 8 }}>
          Meet Chow Streak
        </h2>
        <p style={{ fontSize: 14, color: '#a08060', lineHeight: 1.7, marginBottom: 24 }}>
          The feeding game you play with {petName} every single day.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28, textAlign: 'left' }}>
          {[
            { emoji: '😊', text: 'Watch your pet\'s hunger mood change in real time' },
            { emoji: '🔥', text: 'Build a streak — miss a day and feel it' },
            { emoji: '🏅', text: 'Level up from Picky Eater to Legendary Bowl Destroyer' },
            { emoji: '🏠', text: 'Track your pantry so you\'re never caught empty-handed' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              background: 'rgba(196,122,58,0.07)', borderRadius: 12, padding: '12px 14px',
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.emoji}</span>
              <span style={{ fontSize: 13, color: '#d0b898', lineHeight: 1.5 }}>{item.text}</span>
            </div>
          ))}
        </div>

        <div style={{
          background: 'rgba(93,202,165,0.08)',
          border: '1px solid rgba(93,202,165,0.2)',
          borderRadius: 12, padding: '12px 16px', marginBottom: 24,
          fontSize: 13, color: '#5dcaa5',
        }}>
          🎁 You have 14 days of full free access. No credit card needed.
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '14px 0',
            background: '#c47a3a', color: '#fff',
            border: 'none', borderRadius: 13,
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Got it! Let's start 🐾
        </button>
      </div>

      <style>{`
        @keyframes cs-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cs-pop { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ── Celebration overlay ──
function CelebrationOverlay({ pet, streak, onClose }: {
  pet: Pet;
  streak: number;
  onClose: () => void;
}) {
  const petTitle   = getPetTitle(streak);
  const ownerBadge = getOwnerBadge(streak);
  const photoUrl   = pet.profile_photo_url || pet.photo_url;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'cs-fade-in 0.3s ease',
    }}>
      {/* Confetti dots */}
      {[...Array(20)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 10, height: 10,
          borderRadius: '50%',
          background: ['#c47a3a','#5dcaa5','#f59e0b','#ef4444','#8b5cf6'][i % 5],
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `cs-confetti ${0.8 + Math.random() * 1.2}s ease-out forwards`,
          animationDelay: `${Math.random() * 0.4}s`,
        }} />
      ))}

      <div style={{
        background: 'linear-gradient(160deg,#1a1410,#120f0c)',
        border: '1px solid rgba(196,122,58,0.4)',
        borderRadius: 28,
        padding: '40px 36px',
        textAlign: 'center',
        maxWidth: 340,
        width: '90%',
        position: 'relative',
        animation: 'cs-pop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Pet photo */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          background: 'rgba(196,122,58,0.15)',
          border: '3px solid #c47a3a',
          margin: '0 auto 16px',
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40,
        }}>
          {photoUrl
            ? <img src={photoUrl} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '🐾'}
        </div>

        <div style={{ fontSize: 36, marginBottom: 4 }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f0ebe4', marginBottom: 6 }}>
          Bowl Cleared!
        </h2>
        <p style={{ fontSize: 14, color: '#a08060', marginBottom: 20 }}>
          {pet.name} is a {petTitle.emoji} <strong style={{ color: '#c47a3a' }}>{petTitle.title}</strong>
        </p>

        <div style={{
          background: 'rgba(196,122,58,0.1)',
          border: '1px solid rgba(196,122,58,0.3)',
          borderRadius: 16, padding: '16px 20px', marginBottom: 20,
        }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#c47a3a', lineHeight: 1 }}>
            🔥 {streak}
          </div>
          <div style={{ fontSize: 12, color: '#7a6050', marginTop: 4 }}>day streak</div>
        </div>

        <div style={{ fontSize: 13, color: '#7a6050', marginBottom: 24 }}>
          You're a {ownerBadge.emoji} <strong style={{ color: '#d0b898' }}>{ownerBadge.badge}</strong>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '13px 0',
            background: '#c47a3a', color: '#fff',
            border: 'none', borderRadius: 12,
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          ✓ Done
        </button>
      </div>

      <style>{`
        @keyframes cs-fade-in { from{opacity:0} to{opacity:1} }
        @keyframes cs-pop { from{transform:scale(0.7);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes cs-confetti {
          0%   { transform:translateY(0) rotate(0deg); opacity:1; }
          100% { transform:translateY(-120px) rotate(720deg); opacity:0; }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────
export default function ChowStreakPage() {
  const router = useRouter();
  const [pet, setPet]             = useState<Pet | null>(null);
  const [logs, setLogs]           = useState<ChowLog[]>([]);
  const [loading, setLoading]     = useState(true);
  const [userPlan, setUserPlan]   = useState('free');
  const [logging, setLogging]     = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [pantryDays, setPantryDays] = useState<number | null>(null);
  const [editingPantry, setEditingPantry] = useState(false);
  const [pantryInput, setPantryInput] = useState('');
  const [userId, setUserId]       = useState('');
  const [todayLogged, setTodayLogged] = useState(false);
const [trialExpired, setTrialExpired]       = useState(false);
const [trialDaysUsed, setTrialDaysUsed]     = useState(0);
const [trialNotStarted, setTrialNotStarted] = useState(false);
const [showWelcome, setShowWelcome]         = useState(false);
const [chowHearts, setChowHearts]           = useState(0);
const [lastReaction, setLastReaction]       = useState<string | null>(null);
const [totalLogs, setTotalLogs]             = useState(0);
const [clearCount, setClearCount]           = useState(0);

  const fetchData = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login'); return; }

    setUserId(session.user.id);

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan, chow_trial_start')
      .eq('id', session.user.id)
      .single();

    const plan = profile?.subscription_plan || 'free';
    setUserPlan(plan);
// ── Trial detection ──
    const trialStart = profile?.chow_trial_start
      ? new Date(profile.chow_trial_start)
      : null;

    const daysUsed = trialStart
      ? Math.floor((Date.now() - trialStart.getTime()) / 86_400_000)
      : 0;

    const trialStarted = trialStart !== null;
    const expired = plan === 'free' && trialStarted && daysUsed >= 14;
    const notStarted = plan === 'free' && !trialStarted;

    setTrialExpired(expired);
    setTrialDaysUsed(daysUsed);
    setTrialNotStarted(notStarted);
    if (notStarted) setShowWelcome(true);
    const { data: petsData } = await supabase
      .from('pets')
      .select('id,name,species,breed,profile_photo_url,photo_url')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (!petsData) { setLoading(false); return; }
    setPet(petsData);

    const { data: logsData } = await supabase
      .from('chow_logs')
      .select('*')
      .eq('pet_id', petsData.id)
      .order('logged_at', { ascending: false })
      .limit(60);

    const allLogs: ChowLog[] = logsData || [];
    setLogs(allLogs);

    // Check if already logged today
    const todayStr = new Date().toDateString();
    const alreadyLogged = allLogs.some(l => new Date(l.logged_at).toDateString() === todayStr);
    setTodayLogged(alreadyLogged);
    // ── Set hearts and log counts ──
    setTotalLogs(allLogs.length);
    const cleared = allLogs.filter((l: ChowLog) => l.outcome === 'cleared').length;
    setClearCount(cleared);

    // Fetch chow hearts
    const { data: heartsData } = await supabase
      .from('chow_hearts')
      .select('total_hearts')
      .eq('pet_id', petsData.id)
      .single();
    if (heartsData) setChowHearts(heartsData.total_hearts);

    // Get latest pantry days
    const latestWithPantry = allLogs.find(l => l.pantry_days_remaining != null);
    if (latestWithPantry?.pantry_days_remaining != null) {
      setPantryDays(latestWithPantry.pantry_days_remaining);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Streak calculator ──
  function calcStreak(logs: ChowLog[]): number {
    if (!logs.length) return 0;
    const days = [...new Set(logs.map(l => new Date(l.logged_at).toDateString()))];
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (days.includes(d.toDateString())) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  const streak     = calcStreak(logs);
  const lastLog    = logs[0] ? new Date(logs[0].logged_at) : null;
  const mood       = getHungerMood(lastLog);
  const petTitle   = getPetTitle(streak);
  const ownerBadge = getOwnerBadge(streak);

  async function logMeal(outcome: 'cleared' | 'leftovers') {
    if (!pet || logging) return;
    setLogging(true);
    const supabase = createSupabaseBrowserClient();
    // ── Start trial on first log ──
    if (userPlan === 'free' && trialNotStarted) {
      await supabase
        .from('profiles')
        .update({ chow_trial_start: new Date().toISOString() })
        .eq('id', userId);
    }

    const heartsEarned = outcome === 'cleared' ? HEARTS_PER_CLEARED : HEARTS_PER_LEFTOVERS;
    const reaction = getRandomReaction(pet.species);

    const { error } = await supabase.from('chow_logs').insert({
      user_id: userId,
      pet_id: pet.id,
      outcome,
      pantry_days_remaining: pantryDays,
      hearts_earned: heartsEarned,
      pet_reaction: reaction,
    });

    if (!error) {
      const newHearts = chowHearts + heartsEarned;
      await supabase.from('chow_hearts').upsert({
        user_id: userId,
        pet_id: pet.id,
        total_hearts: newHearts,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'pet_id' });

      setLastReaction(reaction);
      await fetchData();
      if (outcome === 'cleared') setShowCelebration(true);
    }
    setLogging(false);
  }
  async function savePantry() {
    const val = parseInt(pantryInput);
    if (isNaN(val) || val < 0) return;
    setPantryDays(val);
    setEditingPantry(false);
    // Update latest log with new pantry value if it exists
    if (logs[0]) {
      const supabase = createSupabaseBrowserClient();
      await supabase.from('chow_logs')
        .update({ pantry_days_remaining: val })
        .eq('id', logs[0].id);
    }
  }

  // ── Last 7 days grid ──
  function getLast7Days() {
    const days = [];
    const logDates = new Set(logs.map(l => new Date(l.logged_at).toDateString()));
    const logOutcomes: Record<string, string> = {};
    logs.forEach(l => {
      const key = new Date(l.logged_at).toDateString();
      if (!logOutcomes[key]) logOutcomes[key] = l.outcome;
    });
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      days.push({
        label: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()],
        logged: logDates.has(key),
        outcome: logOutcomes[key] || null,
        isToday: i === 0,
      });
    }
    return days;
  }

  // ── Pantry colour ──
  const pantryColor = pantryDays == null ? '#7a6050'
    : pantryDays <= 2 ? '#ef4444'
    : pantryDays <= 5 ? '#f59e0b'
    : '#5dcaa5';

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', fontFamily:'inherit', color:'#a08060' }}>
        Loading Chow Streak…
      </div>
    );
  }

  // ── Upsell for free users ──
  if (trialExpired) {
    return (
      <div style={{ fontFamily:'Geist,Inter,sans-serif', background:'#0c0a08', minHeight:'100vh', color:'#f0ebe4' }}>
        <style>{pageStyles}</style>

        {/* Header */}
        <div style={{
          background:'linear-gradient(160deg,#1a1410,#120f0c)',
          borderBottom:'0.5px solid rgba(196,122,58,0.15)',
          padding:'28px 24px 24px',
        }}>
          <div style={{ maxWidth:640, margin:'0 auto' }}>
            <Link href="/dashboard" style={{ fontSize:13, color:'#6a5040', textDecoration:'none', display:'inline-block', marginBottom:16 }}>
              ← Dashboard
            </Link>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{
                width:64, height:64, borderRadius:'50%',
                background:'rgba(196,122,58,0.15)',
                border:'2px solid #c47a3a',
                overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:28, flexShrink:0,
              }}>
                {pet && (pet.profile_photo_url || pet.photo_url)
                  ? <img src={pet.profile_photo_url || pet.photo_url!} alt={pet?.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : '🐾'}
              </div>
              <div>
                <h1 style={{ fontSize:22, fontWeight:700, color:'#f0ebe4', marginBottom:4 }}>🔥 Chow Streak</h1>
                <p style={{ fontSize:13, color:'#7a6050' }}>{pet?.name} · {pet?.breed || pet?.species}</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth:640, margin:'0 auto', padding:'28px 24px 64px', display:'flex', flexDirection:'column', gap:20 }}>

          {/* Streak data — visible but locked */}
          <div style={{ position:'relative' }}>

            {/* Streak card — greyed out */}
            <div className="cs-card" style={{ padding:'24px', opacity:0.5, pointerEvents:'none', filter:'blur(1px)' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div style={{ textAlign:'center', padding:'24px 16px', background:'#181411', borderRadius:20 }}>
                  <div style={{ fontSize:42, fontWeight:800, color:'#c47a3a', lineHeight:1 }}>🔥{streak}</div>
                  <div style={{ fontSize:11, color:'#6a5040', marginTop:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>Day Streak</div>
                </div>
                <div style={{ textAlign:'center', padding:'24px 16px', background:'#181411', borderRadius:20 }}>
                  <div style={{ fontSize:34, lineHeight:1, marginBottom:6 }}>{getPetTitle(streak).emoji}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#d0b898' }}>{getPetTitle(streak).title}</div>
                </div>
              </div>
            </div>

            {/* Upgrade overlay */}
            <div style={{
              position:'absolute', inset:0,
              display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center',
              borderRadius:20,
              background:'rgba(12,10,8,0.75)',
              backdropFilter:'blur(2px)',
              padding:24,
              textAlign:'center',
            }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🐾</div>
              <h2 style={{ fontSize:20, fontWeight:800, color:'#f0ebe4', marginBottom:8 }}>
                {pet?.name} is waiting for you
              </h2>
              <p style={{ fontSize:14, color:'#a08060', lineHeight:1.7, marginBottom:24, maxWidth:280 }}>
                Your 14-day free trial has ended. Upgrade to Pro to keep your {streak}-day streak alive and never miss a meal together.
              </p>
              <Link href="/upgrade?plan=pro&billing=monthly&ref=chow-trial" style={{
                display:'block', width:'100%', maxWidth:260,
                background:'#c47a3a', color:'#fff',
                padding:'14px 0', borderRadius:13,
                fontWeight:700, fontSize:15, textDecoration:'none',
                textAlign:'center', marginBottom:12,
              }}>
                Continue with Pro →
              </Link>
              <Link href="/dashboard" style={{ fontSize:13, color:'#6a5040', textDecoration:'none' }}>
                Back to Dashboard
              </Link>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div style={{ fontFamily:'Geist,Inter,sans-serif', background:'#0c0a08', minHeight:'100vh', color:'#f0ebe4', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ textAlign:'center' }}>
          <p style={{ color:'#7a6050', marginBottom:16 }}>Add a pet first to use Chow Streak.</p>
          <Link href="/dashboard/add-pet" style={{ color:'#c47a3a', textDecoration:'none', fontWeight:600 }}>+ Add Pet →</Link>
        </div>
      </div>
    );
  }

  const photoUrl  = pet.profile_photo_url || pet.photo_url;
  const last7     = getLast7Days();

  return (
    <div style={{ fontFamily:'Geist,Inter,sans-serif', background:'#0c0a08', minHeight:'100vh', color:'#f0ebe4' }}>
      <style>{pageStyles}</style>

      {/* ── Welcome Modal ── */}
      {showWelcome && pet && (
        <WelcomeModal
          petName={pet.name}
          onClose={() => {
            setShowWelcome(false);
            localStorage.setItem('chow_welcome_seen', 'true');
          }}
        />
      )}

      {/* ── Free Trial Banner ── */}
      {userPlan === 'free' && !trialNotStarted && !trialExpired && (
        <div style={{
          background: 'linear-gradient(90deg,rgba(196,122,58,0.15),rgba(196,122,58,0.08))',
          borderBottom: '0.5px solid rgba(196,122,58,0.25)',
          padding: '10px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 8,
        }}>
          <span style={{ fontSize: 13, color: '#d0b898' }}>
            🎁 Free trial · <strong style={{ color: '#c47a3a' }}>{Math.max(0, 14 - trialDaysUsed)} days</strong> remaining
          </span>
          <Link href="/upgrade?plan=pro&billing=monthly&ref=chow-banner" style={{
            color: '#c47a3a', fontWeight: 700, textDecoration: 'none', fontSize: 12,
            border: '1px solid rgba(196,122,58,0.4)', borderRadius: 8, padding: '4px 10px',
          }}>
            Upgrade →
          </Link>
        </div>
      )}

      {showCelebration && (
        <CelebrationOverlay
          pet={pet}
          streak={streak}
          onClose={() => setShowCelebration(false)}
        />
      )}

      {/* ── Header ── */}
      <div style={{
        background:'linear-gradient(160deg,#1a1410,#120f0c)',
        borderBottom:'0.5px solid rgba(196,122,58,0.15)',
        padding:'28px 24px 24px',
      }}>
        <div style={{ maxWidth:640, margin:'0 auto' }}>
          <Link href="/dashboard" style={{ fontSize:13, color:'#6a5040', textDecoration:'none', display:'inline-block', marginBottom:16 }}>
            ← Dashboard
          </Link>
          <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
            <div style={{
              width:64, height:64, borderRadius:'50%',
              background:'rgba(196,122,58,0.15)',
              border:`2px solid ${mood.color}`,
              overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:28, flexShrink:0,
              boxShadow: mood.pulse ? `0 0 0 6px ${mood.bg}` : 'none',
              transition:'box-shadow 0.4s',
            }}>
              {photoUrl
                ? <img src={photoUrl} alt={pet.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : '🐾'}
            </div>
            <div>
              <h1 style={{ fontSize:22, fontWeight:700, color:'#f0ebe4', marginBottom:4, display:'flex', alignItems:'center', gap:8 }}>
                🔥 Chow Streak
              </h1>
              <p style={{ fontSize:13, color:'#7a6050' }}>{pet.name} · {pet.breed || pet.species}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:640, margin:'0 auto', padding:'28px 24px 64px', display:'flex', flexDirection:'column', gap:20 }}>

        {/* ── Hunger Mood Card ── */}
        <div className="cs-card" style={{ background: mood.bg, borderColor: mood.color + '55', textAlign:'center', padding:'32px 24px' }}>
          <div className={mood.pulse ? 'cs-pulse' : ''} style={{ fontSize:72, lineHeight:1, marginBottom:12 }}>
            {mood.emoji}
          </div>
          <div style={{ fontSize:18, fontWeight:700, color: mood.color, marginBottom:6 }}>
            {pet.name} is {mood.label}
          </div>
          {lastLog && (
            <div style={{ fontSize:12, color:'#7a6050' }}>
              Last meal: {lastLog.toLocaleString('en-ZA', { hour:'2-digit', minute:'2-digit', day:'numeric', month:'short' })}
            </div>
          )}
          {!lastLog && (
            <div style={{ fontSize:12, color:'#7a6050' }}>No meals logged yet — log the first one below!</div>
          )}
        </div>

        {/* ── Log Meal Buttons ── */}
        {!todayLogged ? (
          <div className="cs-card" style={{ padding:'24px' }}>
            <p style={{ fontSize:13, color:'#a08060', marginBottom:16, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              Log today's meal
            </p>
            <div style={{ display:'flex', gap:12 }}>
              <button
                onClick={() => logMeal('cleared')}
                disabled={logging}
                className="cs-btn-primary"
                style={{ flex:1 }}
              >
                🍽️ Bowl Cleared!
              </button>
              <button
                onClick={() => logMeal('leftovers')}
                disabled={logging}
                className="cs-btn-secondary"
                style={{ flex:1 }}
              >
                🥣 Leftovers
              </button>
            </div>
          </div>
        ) : (
          <div className="cs-card" style={{ padding:'20px 24px', display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:22 }}>✅</span>
            <div>
              <div style={{ fontSize:14, fontWeight:600, color:'#5dcaa5' }}>Meal logged today!</div>
              <div style={{ fontSize:12, color:'#6a5040' }}>Come back tomorrow to keep the streak alive.</div>
            </div>
          </div>
        )}

{/* ── Pet Reaction ── */}
        {lastReaction && (
          <div className="cs-card" style={{
            padding: '20px 24px',
            background: 'rgba(196,122,58,0.06)',
            borderColor: 'rgba(196,122,58,0.2)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(196,122,58,0.15)',
              border: '2px solid rgba(196,122,58,0.3)',
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0,
            }}>
              {photoUrl
                ? <img src={photoUrl} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : '🐾'}
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#6a5040', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                {pet.name} says...
              </div>
              <div style={{ fontSize: 14, color: '#d0b898', fontStyle: 'italic', lineHeight: 1.5 }}>
                "{lastReaction}"
              </div>
            </div>
          </div>
        )}

{/* ── Chow Hearts + Evolution ── */}
        {(() => {
          const clearPct = totalLogs > 0 ? Math.round((clearCount / totalLogs) * 100) : 0;
          const evo = getEvolutionTitle(chowHearts, pet.species, clearPct);
          const progressPct = evo.nextAt ? Math.min(100, (chowHearts / evo.nextAt) * 100) : 100;
          return (
            <div className="cs-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 40, flexShrink: 0 }}>{evo.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#6a5040', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                    {pet.name}'s Title
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#c47a3a' }}>{evo.title}</div>
                  <div style={{ fontSize: 12, color: '#7a6050', marginTop: 2 }}>{evo.description}</div>
                </div>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#e8963d' }}>❤️ {chowHearts}</div>
                  <div style={{ fontSize: 10, color: '#6a5040' }}>hearts</div>
                </div>
              </div>
              {evo.nextAt && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6a5040', marginBottom: 6 }}>
                    <span>{chowHearts} hearts</span>
                    <span>{evo.nextAt} to next title</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 99, height: 7, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      background: 'linear-gradient(90deg,#c47a3a,#e8963d)',
                      width: `${progressPct}%`,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Streak + Badges Row ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {/* Streak */}
          <div className="cs-card" style={{ textAlign:'center', padding:'24px 16px' }}>
            <div style={{ fontSize:42, fontWeight:800, color:'#c47a3a', lineHeight:1 }}>🔥{streak}</div>
            <div style={{ fontSize:11, color:'#6a5040', marginTop:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>Day Streak</div>
          </div>

          {/* Pet Title */}
          <div className="cs-card" style={{ textAlign:'center', padding:'24px 16px' }}>
            <div style={{ fontSize:34, lineHeight:1, marginBottom:6 }}>{petTitle.emoji}</div>
            <div style={{ fontSize:13, fontWeight:700, color:'#d0b898' }}>{petTitle.title}</div>
            <div style={{ fontSize:11, color:'#6a5040', marginTop:4 }}>
              {petTitle.next ? `${petTitle.next - streak} days to next` : 'Max rank! 👑'}
            </div>
          </div>
        </div>

        {/* ── Owner Badge ── */}
        <div className="cs-card" style={{ display:'flex', alignItems:'center', gap:16, padding:'20px 24px' }}>
          <div style={{ fontSize:40, flexShrink:0 }}>{ownerBadge.emoji}</div>
          <div>
            <div style={{ fontSize:11, color:'#6a5040', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Your Owner Badge</div>
            <div style={{ fontSize:17, fontWeight:700, color:'#c47a3a' }}>{ownerBadge.badge}</div>
            {ownerBadge.next && (
              <div style={{ fontSize:12, color:'#7a6050', marginTop:3 }}>
                {ownerBadge.next - streak} more days to next badge
              </div>
            )}
            {!ownerBadge.next && (
              <div style={{ fontSize:12, color:'#5dcaa5', marginTop:3 }}>
                Legendary status unlocked! 🎉
              </div>
            )}
          </div>
          {/* Progress bar */}
          <div style={{ flex:1, marginLeft:8 }}>
            {ownerBadge.next && (
              <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:99, height:6, overflow:'hidden' }}>
                <div style={{
                  height:'100%', borderRadius:99,
                  background:'linear-gradient(90deg,#c47a3a,#e8963d)',
                  width: `${Math.min(100, (streak / ownerBadge.next) * 100)}%`,
                  transition:'width 0.6s ease',
                }} />
              </div>
            )}
          </div>
        </div>

        {/* ── Last 7 Days ── */}
        <div className="cs-card" style={{ padding:'20px 24px' }}>
          <p style={{ fontSize:13, color:'#a08060', marginBottom:14, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>
            Last 7 Days
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8 }}>
            {last7.map((d, i) => (
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ fontSize:10, color:'#6a5040', marginBottom:6 }}>{d.label}</div>
                <div style={{
                  width:'100%', aspectRatio:'1', borderRadius:10,
                  background: !d.logged ? 'rgba(255,255,255,0.04)'
                    : d.outcome === 'cleared' ? 'rgba(93,202,165,0.2)'
                    : 'rgba(245,158,11,0.15)',
                  border: d.isToday ? '1.5px solid rgba(196,122,58,0.5)' : '0.5px solid rgba(255,255,255,0.07)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:16,
                }}>
                  {!d.logged ? '' : d.outcome === 'cleared' ? '🍽️' : '🥣'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pantry Countdown ── */}
        <div className="cs-card" style={{ padding:'20px 24px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <p style={{ fontSize:13, color:'#a08060', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              🐾 Snack Sentinel
            </p>
            <button
              onClick={() => { setEditingPantry(true); setPantryInput(String(pantryDays ?? '')) }}
              style={{ background:'none', border:'none', color:'#c47a3a', fontSize:12, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}
            >
              {pantryDays == null ? '+ Set days' : '✏️ Edit'}
            </button>
          </div>

          {editingPantry ? (
            <div style={{ display:'flex', gap:8 }}>
              <input
                type="number"
                value={pantryInput}
                onChange={e => setPantryInput(e.target.value)}
                placeholder="Days of food left"
                min={0}
                style={{
                  flex:1, padding:'10px 14px',
                  background:'#1e1812', border:'1px solid rgba(196,122,58,0.3)',
                  borderRadius:10, color:'#f0ebe4', fontSize:14, fontFamily:'inherit',
                }}
              />
              <button onClick={savePantry} className="cs-btn-primary" style={{ padding:'10px 20px', flex:'none' }}>
                Save
              </button>
            </div>
          ) : pantryDays == null ? (
            <p style={{ fontSize:13, color:'#6a5040' }}>{pet.name} is watching the food supply. Set how many days are left and they'll let you know when it's getting low.</p>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{
                fontSize:42, fontWeight:800, color: pantryColor, lineHeight:1,
                animation: pantryDays <= 2 ? 'cs-blink 1.2s ease-in-out infinite' : 'none',
              }}>
                {pantryDays}
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color: pantryColor }}>
                  {pantryDays === 0
  ? `🚨 "${pet.name} has initiated Operation Empty Bowl."`
  : pantryDays === 1
  ? `😾 "${pet.name} trusts you've handled this crisis."`
  : pantryDays === 2
  ? `🧐 "The snack vault appears to be shrinking, human."`
  : pantryDays <= 5
  ? `⚡ "Adequate reserves. ${pet.name} is monitoring closely."`
  : `✅ "Supplies secured. You may relax."`}
                </div>
                <div style={{ fontSize:12, color:'#6a5040', marginTop:2 }}>days of food remaining</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Recent Log History ── */}
        {logs.length > 0 && (
          <div className="cs-card" style={{ padding:'20px 24px' }}>
            <p style={{ fontSize:13, color:'#a08060', marginBottom:14, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              Recent History
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {logs.slice(0, 7).map(log => (
                <div key={log.id} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'10px 14px',
                  background:'rgba(255,255,255,0.03)',
                  borderRadius:10,
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:18 }}>{log.outcome === 'cleared' ? '🍽️' : '🥣'}</span>
                    <span style={{ fontSize:13, color:'#d0b898', fontWeight:500 }}>
                      {log.outcome === 'cleared' ? 'Bowl Cleared' : 'Leftovers'}
                    </span>
                  </div>
                  <span style={{ fontSize:12, color:'#6a5040' }}>
                    {new Date(log.logged_at).toLocaleDateString('en-ZA', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const pageStyles = `
  .cs-card {
    background: #181411;
    border: 0.5px solid rgba(255,255,255,0.07);
    border-radius: 20px;
  }
  .cs-btn-primary {
    padding: 13px 20px;
    background: #c47a3a;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.2s, transform 0.15s;
  }
  .cs-btn-primary:hover:not(:disabled) { background: #d48a46; transform: translateY(-1px); }
  .cs-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .cs-btn-secondary {
    padding: 13px 20px;
    background: rgba(255,255,255,0.06);
    color: #d0b898;
    border: 0.5px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.2s;
  }
  .cs-btn-secondary:hover:not(:disabled) { background: rgba(255,255,255,0.1); }
  .cs-btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
  .cs-pulse {
    animation: cs-mood-pulse 1.5s ease-in-out infinite;
  }
  @keyframes cs-mood-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.08); }
  }
  @keyframes cs-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

