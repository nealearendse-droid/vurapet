'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { requestNotificationPermission, sendNotification, scheduleHungerCheck } from '@/lib/notifications';
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
  mood_emoji?: string;
  mood_word?: string;
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

// ── Pet Evolution Stages ──
const DOG_EVOLUTION = [
  { stage: 'hatchling', minHearts: 0,   maxHearts: 9,   emoji: '🥚', label: 'Hatchling',      desc: 'Every legend starts with a first meal.',         color: '#a08060' },
  { stage: 'pup',       minHearts: 1,  maxHearts: 49,  emoji: '🐶', label: 'Hungry Pup',     desc: 'Small dog, big appetite, bigger heart.',          color: '#c47a3a' },
  { stage: 'companion', minHearts: 50,  maxHearts: 199, emoji: '🐕', label: 'Loyal Companion', desc: 'Showing up, every single day.',                   color: '#5dcaa5' },
  { stage: 'guardian',  minHearts: 200, maxHearts: 499, emoji: '🦮', label: 'Trusted Guardian',desc: 'The bond is real. The bowl is spotless.',          color: '#8b5cf6' },
  { stage: 'legendary', minHearts: 500, maxHearts: Infinity, emoji: '👑', label: 'Legendary', desc: 'A myth. A meal. A legacy.',                        color: '#f59e0b' },
];

const CAT_EVOLUTION = [
  { stage: 'hatchling', minHearts: 0,   maxHearts: 9,   emoji: '🥚', label: 'Mysterious Egg', desc: 'Something is watching. Judging.',                 color: '#a08060' },
  { stage: 'pup',       minHearts: 10,  maxHearts: 49,  emoji: '🐱', label: 'Discerning Kitten', desc: 'Standards established. Bowl servant on trial.', color: '#c47a3a' },
  { stage: 'companion', minHearts: 50,  maxHearts: 199, emoji: '🐈', label: 'Regal Companion', desc: 'You have been deemed acceptable.',                color: '#5dcaa5' },
  { stage: 'guardian',  minHearts: 200, maxHearts: 499, emoji: '🐈‍⬛', label: 'Shadow Duchess', desc: 'Watching. Always watching.',                     color: '#8b5cf6' },
  { stage: 'legendary', minHearts: 500, maxHearts: Infinity, emoji: '👑', label: 'Eternal Empress', desc: 'Bow. Just bow.',                              color: '#f59e0b' },
];

function getPetEvolution(hearts: number, species: string) {
  const stages = species?.toLowerCase().includes('cat') ? CAT_EVOLUTION : DOG_EVOLUTION;
  return stages.find(s => hearts >= s.minHearts && hearts <= s.maxHearts) || stages[0];
}

function getNextEvolution(hearts: number, species: string) {
  const stages = species?.toLowerCase().includes('cat') ? CAT_EVOLUTION : DOG_EVOLUTION;
  return stages.find(s => s.minHearts > hearts) || null;
}
// ── Daily Trivia ──
const TRIVIA_BANK: Record<string, { q: string; options: string[]; answer: number; fact: string }[]> = {
  yorkshire_terrier: [
    { q: "What were Yorkshire Terriers originally bred to do?", options: ["Herd sheep", "Hunt rats in mines", "Guard estates", "Retrieve game"], answer: 1, fact: "Yorkies were bred to catch rats in Yorkshire coal mines in the 1800s. Tiny but fearless!" },
    { q: "How much does a typical adult Yorkshire Terrier weigh?", options: ["1–2 kg", "3–4 kg", "5–7 kg", "8–10 kg"], answer: 1, fact: "Yorkies typically weigh 3–4 kg. Their small size made them perfect for chasing rats into tight spaces." },
    { q: "What is unique about a Yorkie's coat?", options: ["It's curly like a poodle", "It's more like human hair than fur", "It sheds heavily twice a year", "It's naturally waterproof"], answer: 1, fact: "Yorkie coats are made of fine hair, not fur — which means they shed very little and are considered hypoallergenic." },
    { q: "What colour are Yorkshire Terrier puppies when born?", options: ["Gold and white", "All black", "Black and tan", "Silver and blue"], answer: 2, fact: "Yorkie puppies are born black and tan. The classic blue and gold colouring develops as they mature." },
    { q: "How long do Yorkshire Terriers typically live?", options: ["7–9 years", "10–12 years", "13–16 years", "17–20 years"], answer: 2, fact: "Yorkies are one of the longer-lived breeds, often reaching 13–16 years with good care." },
    { q: "What group do Yorkshire Terriers belong to?", options: ["Terrier group", "Toy group", "Hound group", "Working group"], answer: 1, fact: "Despite their terrier heritage, Yorkies are classified in the Toy group due to their small size." },
    { q: "Which famous Yorkie served as a WWII therapy dog?", options: ["Toto", "Smoky", "Tiny", "Pip"], answer: 1, fact: "Smoky the Yorkie served with US troops in WWII, boosting morale and even running communication wire through pipes." },
  ],
  dog: [
    { q: "How many times better is a dog's sense of smell than a human's?", options: ["10 times", "100 times", "10,000 times", "100,000 times"], answer: 3, fact: "Dogs have up to 300 million olfactory receptors — humans have about 6 million. Their smell is extraordinary." },
    { q: "What is a dog's normal resting heart rate?", options: ["40–60 bpm", "60–80 bpm", "60–140 bpm", "150–200 bpm"], answer: 2, fact: "A healthy dog's resting heart rate ranges from 60–140 bpm depending on their size. Smaller dogs tend to have faster heart rates." },
    { q: "How many teeth does an adult dog have?", options: ["28", "32", "38", "42"], answer: 3, fact: "Adult dogs have 42 permanent teeth. Puppies start with 28 baby teeth that fall out around 3–6 months." },
    { q: "What does it mean when a dog wags its tail to the right?", options: ["They are anxious", "They feel positive", "They want to play", "They are warning you"], answer: 1, fact: "Studies show dogs wag right for positive feelings and left for negative ones. The direction actually matters!" },
    { q: "What is the most sensitive part of a dog's body?", options: ["Their ears", "Their paws", "Their nose", "Their tail"], answer: 2, fact: "A dog's nose has about 300 million scent receptors and is incredibly sensitive to touch, temperature and moisture." },
    { q: "At what age are dogs considered seniors?", options: ["3 years", "5 years", "7 years", "10 years"], answer: 2, fact: "Most dogs are considered senior at around 7 years, though larger breeds age faster and may be seniors at 5–6." },
    { q: "How long is a dog's short-term memory?", options: ["30 seconds", "2 minutes", "5 minutes", "10 minutes"], answer: 1, fact: "Dogs have about 2 minutes of short-term memory — but their long-term associative memory is excellent." },
  ],
  cat: [
    { q: "How many hours a day do cats typically sleep?", options: ["8–10 hours", "10–12 hours", "12–16 hours", "18–20 hours"], answer: 2, fact: "Cats sleep 12–16 hours daily. As obligate carnivores, they conserve energy between hunts — even indoor ones." },
    { q: "What is a group of cats called?", options: ["A pack", "A clowder", "A pride", "A colony"], answer: 1, fact: "A group of cats is called a clowder. A group of kittens is called a kindle." },
    { q: "How fast can a domestic cat run?", options: ["20 km/h", "30 km/h", "48 km/h", "60 km/h"], answer: 2, fact: "Cats can sprint up to 48 km/h over short distances — faster than Usain Bolt's top speed." },
    { q: "What frequency does purring occur at?", options: ["5–10 Hz", "25–150 Hz", "200–400 Hz", "500+ Hz"], answer: 1, fact: "Cats purr at 25–150 Hz — a frequency shown to promote bone density and healing in both cats and humans." },
    { q: "How many bones does a cat have?", options: ["106", "144", "230", "290"], answer: 2, fact: "Cats have 230 bones — 24 more than humans. Many are in their flexible spine and tail." },
    { q: "What is unique about a cat's collarbone?", options: ["They don't have one", "It's fused to the spine", "It floats freely", "It's made of cartilage"], answer: 2, fact: "A cat's collarbone floats freely, allowing them to fit through any space their head can pass through." },
    { q: "How do cats drink water?", options: ["They lap it upward", "They scoop it with their tongue", "They curl their tongue to pull water up", "They bite the surface"], answer: 2, fact: "Cats curl their tongue into a J-shape and pull water up in a column, lapping at around 4 times per second." },
  ],
};

function getDailyTrivia(species: string, breed: string) {
  const breedKey = breed?.toLowerCase().replace(/\s+/g, '_');
  const speciesKey = species?.toLowerCase().includes('cat') ? 'cat' : 'dog';
  const questions = TRIVIA_BANK[breedKey] || TRIVIA_BANK[speciesKey] || TRIVIA_BANK['dog'];
  const dayIndex = Math.floor(Date.now() / 86_400_000) % questions.length;
  return questions[dayIndex];
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

// ── Milestone recorder ──
async function recordMilestone(
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
  userId: string,
  petId: string,
  type: string,
  data: Record<string, unknown>
) {
  await supabase.from('pet_milestones').insert({
    user_id: userId,
    pet_id: petId,
    milestone_type: type,
    milestone_data: data,
  });
}
function MoodJournalModal({ petName, onSave, onSkip }: {
  petName: string;
  onSave: (emoji: string, word: string) => void;
  onSkip: () => void;
}) {
  const [emoji, setEmoji] = useState<string | null>(null);
  const [word, setWord] = useState('');

  const moods = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😴', label: 'Sleepy' },
    { emoji: '🤩', label: 'Excited' },
    { emoji: '😌', label: 'Calm' },
    { emoji: '🥺', label: 'Needy' },
    { emoji: '😜', label: 'Playful' },
    { emoji: '😒', label: 'Grumpy' },
    { emoji: '🤒', label: 'Unwell' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9997,
      background: 'rgba(0,0,0,0.82)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      animation: 'cs-fade-in 0.3s ease',
    }}>
      <div style={{
        background: 'linear-gradient(160deg,#1e1812,#140f0a)',
        border: '1px solid rgba(196,122,58,0.3)',
        borderRadius: 24, padding: '32px 28px',
        maxWidth: 360, width: '100%',
        textAlign: 'center',
        animation: 'cs-pop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>📓</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f0ebe4', marginBottom: 6 }}>
          How is {petName} feeling?
        </h2>
        <p style={{ fontSize: 13, color: '#7a6050', marginBottom: 20, lineHeight: 1.6 }}>
          One tap. Builds into {petName}'s mood timeline.
        </p>

        {/* Emoji grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20,
        }}>
          {moods.map(m => (
            <button
              key={m.emoji}
              onClick={() => setEmoji(m.emoji)}
              style={{
                background: emoji === m.emoji ? 'rgba(196,122,58,0.2)' : 'rgba(255,255,255,0.04)',
                border: emoji === m.emoji ? '1.5px solid #c47a3a' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '10px 4px',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 24 }}>{m.emoji}</span>
              <span style={{ fontSize: 10, color: '#a08060' }}>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Optional word */}
        <input
          type="text"
          value={word}
          onChange={e => setWord(e.target.value.slice(0, 20))}
          placeholder={`One word about ${petName} today...`}
          style={{
            width: '100%', padding: '11px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(196,122,58,0.2)',
            borderRadius: 11, color: '#f0ebe4',
            fontSize: 14, fontFamily: 'inherit',
            marginBottom: 16, boxSizing: 'border-box',
          }}
        />

        <button
          onClick={() => emoji && onSave(emoji, word)}
          disabled={!emoji}
          style={{
            width: '100%', padding: '13px 0',
            background: emoji ? '#c47a3a' : 'rgba(255,255,255,0.06)',
            color: emoji ? '#fff' : '#6a5040',
            border: 'none', borderRadius: 12,
            fontSize: 14, fontWeight: 700, cursor: emoji ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit', marginBottom: 10,
            transition: 'background 0.2s',
          }}
        >
          Save to Memory Book
        </button>

        <button
          onClick={onSkip}
          style={{
            background: 'none', border: 'none', color: '#6a5040',
            fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
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
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🔥</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f0ebe4', marginBottom: 8 }}>
          Meet Chow Streak
        </h2>
        <p style={{ fontSize: 14, color: '#a08060', lineHeight: 1.7, marginBottom: 24 }}>
          The feeding game you play with {petName} every single day.
        </p>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, textAlign: 'left' }}>
          {[
            { emoji: '😊', title: 'Live hunger moods', text: `Watch ${petName}'s mood change from Full & Happy to Starving in real time.` },
            { emoji: '🔥', title: 'Daily streak', text: 'Log every meal and build a streak. Miss a day and feel it.' },
            { emoji: '🥚', title: 'Pet evolution', text: `${petName} starts as a Hatchling and grows into a Legendary form as you earn hearts.` },
            { emoji: '❤️', title: 'Chow Hearts', text: 'Every cleared bowl earns hearts that power your pet\'s evolution.' },
            { emoji: '📖', title: 'Monthly Feeding Story', text: `A personalised monthly recap written just for ${petName}.` },
            { emoji: '🕰️', title: 'Memory Book', text: 'Every milestone is saved forever — streaks, evolutions, first meals.' },
            { emoji: '🐾', title: 'Snack Sentinel', text: 'Track how many days of food are left so you\'re never caught empty-handed.' },
            { emoji: '📸', title: 'Share moments', text: 'Share evolution unlocks and streak milestones with beautiful cards.' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              background: 'rgba(196,122,58,0.07)', borderRadius: 12, padding: '12px 14px',
              textAlign: 'left',
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.emoji}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#c47a3a', marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: '#a08060', lineHeight: 1.5 }}>{item.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Trial badge */}
        <div style={{
          background: 'rgba(93,202,165,0.08)',
          border: '1px solid rgba(93,202,165,0.2)',
          borderRadius: 12, padding: '12px 16px', marginBottom: 24,
          fontSize: 13, color: '#5dcaa5', lineHeight: 1.6,
        }}>
          🎁 You have <strong>30 days of full free access.</strong><br />
          No credit card needed. No pressure.
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
          Let's go! Show me {petName}'s mood 🐾
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

function EvolutionRevealModal({ pet, stage, onClose, onShare }: {
  pet: Pet;
  stage: typeof DOG_EVOLUTION[0];
  onClose: () => void;
  onShare: () => void;
}) {
  const photoUrl = pet.profile_photo_url || pet.photo_url;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'cs-fade-in 0.4s ease',
      padding: 24,
    }}>
      {[...Array(30)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 12, height: 12, borderRadius: '50%',
          background: ['#c47a3a','#5dcaa5','#f59e0b','#8b5cf6','#ef4444'][i % 5],
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `cs-confetti ${1 + Math.random() * 1.5}s ease-out forwards`,
          animationDelay: `${Math.random() * 0.6}s`,
        }} />
      ))}
      <div style={{
        background: 'linear-gradient(160deg,#1a1410,#120f0c)',
        border: `2px solid ${stage.color}`,
        borderRadius: 28, padding: '40px 32px',
        textAlign: 'center', maxWidth: 360, width: '100%',
        animation: 'cs-pop 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        position: 'relative',
      }}>
        <div style={{ fontSize: 13, color: '#6a5040', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
          ✨ Evolution Unlocked
        </div>
        {/* Before → After */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
          <div style={{ textAlign: 'center', opacity: 0.4 }}>
            <div style={{ fontSize: 40 }}>🥚</div>
            <div style={{ fontSize: 11, color: '#6a5040', marginTop: 4 }}>before</div>
          </div>
          <div style={{ fontSize: 28, color: stage.color }}>→</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, animation: 'cs-evo-bounce 0.6s ease 0.5s both' }}>{stage.emoji}</div>
            <div style={{ fontSize: 11, color: stage.color, marginTop: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>now</div>
          </div>
        </div>
        {/* Pet photo */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          border: `3px solid ${stage.color}`,
          margin: '0 auto 16px',
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32,
          background: 'rgba(255,255,255,0.05)',
        }}>
          {photoUrl ? <img src={photoUrl} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🐾'}
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f0ebe4', marginBottom: 6 }}>
          {stage.emoji} {stage.label}
        </h2>
        <p style={{ fontSize: 14, color: '#a08060', lineHeight: 1.7, marginBottom: 28 }}>
          {pet.name} has evolved.<br />
          <em style={{ color: stage.color }}>"{stage.desc}"</em>
        </p>
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '14px 0',
            background: stage.color, color: '#fff',
            border: 'none', borderRadius: 13,
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Amazing! Keep going 🐾
        </button>
      </div>
      <style>{`
        @keyframes cs-evo-bounce {
          0% { transform: scale(0) rotate(-20deg); opacity: 0; }
          60% { transform: scale(1.3) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
// ── Share Card Modal ──
function ShareCardModal({ pet, streak, chowHearts, evo, story, cardType, onClose }: {
  pet: Pet;
  streak: number;
  chowHearts: number;
  evo: typeof DOG_EVOLUTION[0];
  story: string | null;
  cardType: 'streak' | 'evolution' | 'story';
  onClose: () => void;
}) {
  const photoUrl = pet.profile_photo_url || pet.photo_url;
  const monthName = new Date().toLocaleString('en-ZA', { month: 'long', year: 'numeric' });

  const cardContent = {
    streak: {
      headline: `🔥 ${streak} Day Streak!`,
      sub: `${pet.name} and I haven't missed a meal in ${streak} days.`,
      accent: '#c47a3a',
    },
    evolution: {
      headline: `${evo.emoji} ${pet.name} evolved!`,
      sub: `${pet.name} just became a ${evo.label}. We're not crying, you're crying.`,
      accent: evo.color,
    },
    story: {
      headline: `📖 ${pet.name}'s ${monthName} Story`,
      sub: story || '',
      accent: '#8b5cf6',
    },
  }[cardType];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10001,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, gap: 16,
      animation: 'cs-fade-in 0.3s ease',
    }}>
      {/* The shareable card */}
      <div style={{
        background: 'linear-gradient(145deg,#1e1812,#140f0a)',
        border: `2px solid ${cardContent.accent}`,
        borderRadius: 24, padding: '32px 28px',
        maxWidth: 340, width: '100%',
        textAlign: 'center',
        boxShadow: `0 0 40px ${cardContent.accent}33`,
      }}>
        {/* VuraPet branding */}
        <div style={{ fontSize: 11, color: '#6a5040', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>
          VuraPet · Chow Streak
        </div>

        {/* Pet photo */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          border: `3px solid ${cardContent.accent}`,
          margin: '0 auto 16px',
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, background: 'rgba(255,255,255,0.05)',
        }}>
          {photoUrl
            ? <img src={photoUrl} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '🐾'}
        </div>

        {/* Headline */}
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f0ebe4', marginBottom: 8, lineHeight: 1.2 }}>
          {cardContent.headline}
        </div>

        {/* Sub text */}
        <p style={{
          fontSize: cardType === 'story' ? 13 : 15,
          color: '#a08060', lineHeight: 1.7, marginBottom: 20,
          fontStyle: cardType === 'story' ? 'italic' : 'normal',
        }}>
          {cardType === 'story' ? `"${cardContent.sub}"` : cardContent.sub}
        </p>

        {/* Stats strip */}
        <div style={{
          display: 'flex', justifyContent: 'space-around',
          padding: '14px 0',
          borderTop: `0.5px solid ${cardContent.accent}33`,
          borderBottom: `0.5px solid ${cardContent.accent}33`,
          marginBottom: 20,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: cardContent.accent }}>🔥{streak}</div>
            <div style={{ fontSize: 10, color: '#6a5040', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Streak</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#5dcaa5' }}>❤️{chowHearts}</div>
            <div style={{ fontSize: 10, color: '#6a5040', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hearts</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20 }}>{evo.emoji}</div>
            <div style={{ fontSize: 10, color: '#6a5040', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{evo.label}</div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ fontSize: 12, color: '#6a5040' }}>
          Track your pet's meals at <span style={{ color: cardContent.accent }}>vurapet.co.za</span>
        </div>
      </div>

      {/* Instructions */}
      <p style={{ fontSize: 13, color: '#7a6050', textAlign: 'center', maxWidth: 280 }}>
        📸 Screenshot this card to share on WhatsApp or Instagram Stories
      </p>

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          background: 'none', border: '1px solid rgba(255,255,255,0.15)',
          color: '#a08060', padding: '10px 32px', borderRadius: 10,
          fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        Done
      </button>
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
const [showEvolutionReveal, setShowEvolutionReveal] = useState(false);
const [newEvolutionStage, setNewEvolutionStage] = useState<typeof DOG_EVOLUTION[0] | null>(null);
const [lastCelebratedStage, setLastCelebratedStage] = useState<string>('hatchling');
const [milestones, setMilestones] = useState<Array<{
  id: string;
  milestone_type: string;
  milestone_data: Record<string, unknown>;
  created_at: string;
}>>([]);
const [feedingStory, setFeedingStory] = useState<string | null>(null);
const [storyLoading, setStoryLoading] = useState(false);
const [showStory, setShowStory] = useState(false);
const [showShareCard, setShowShareCard] = useState(false);
const [shareCardType, setShareCardType] = useState<'streak' | 'evolution' | 'story'>('streak');
const [notificationsEnabled, setNotificationsEnabled] = useState(false);
const [showNotifPrompt, setShowNotifPrompt] = useState(false);
const [activeTab, setActiveTab] = useState<'today' | 'mypet' | 'memories'>('today');
const [showMoodJournal, setShowMoodJournal] = useState(false);
const [selectedMoodEmoji, setSelectedMoodEmoji] = useState<string | null>(null);
const [selectedMoodWord, setSelectedMoodWord] = useState('');
const [lastLoggedId, setLastLoggedId] = useState<string | null>(null);
const [savedMoodEmoji, setSavedMoodEmoji] = useState<string | null>(null);
const [triviaAnswered, setTriviaAnswered] = useState<'correct' | 'wrong' | null>(null);
const [triviaSelected, setTriviaSelected] = useState<number | null>(null);
const [challenge, setChallenge] = useState<{
  id: string;
  title: string;
  goal: number;
  current_count: number;
  reward_label: string;
} | null>(null);  
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
    const expired = plan === 'free' && trialStarted && daysUsed >= 30;
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

// Fetch milestones for memories
const { data: milestonesData } = await supabase
  .from('pet_milestones')
  .select('*')
  .eq('pet_id', petsData.id)
  .order('created_at', { ascending: false })
  .limit(50);

setMilestones(milestonesData || []);

// Check notification permission status
if ('Notification' in window) {
  setNotificationsEnabled(Notification.permission === 'granted');
  const hasPrompted = localStorage.getItem('chow_notif_prompted');
  if (!hasPrompted && Notification.permission === 'default') {
    setShowNotifPrompt(true);
  }
}
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
// Schedule hunger notifications if enabled
    if ('Notification' in window && Notification.permission === 'granted') {
      const lastMealDate = allLogs[0]?.logged_at ? new Date(allLogs[0].logged_at) : null;
      scheduleHungerCheck(
        petsData.name,
        petsData.species,
        lastMealDate,
        (title, body) => sendNotification(title, body)
      );
    }
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
    if (heartsData) {
  setChowHearts(heartsData.total_hearts);
  setLastCelebratedStage(heartsData.last_celebrated_stage || 'hatchling');
}

    // Get latest pantry days
    const latestWithPantry = allLogs.find(l => l.pantry_days_remaining != null);
    if (latestWithPantry?.pantry_days_remaining != null) {
      setPantryDays(latestWithPantry.pantry_days_remaining);
    }
const { data: challengeData, error: challengeError } = await supabase
  .from('community_challenges')
  .select('*')
  .eq('month', new Date().toISOString().slice(0, 7))
  .maybeSingle();

if (challengeData) setChallenge(challengeData);

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

    const { data: newLog, error } = await supabase.from('chow_logs').insert({
  user_id: userId,
  pet_id: pet.id,
  outcome,
  pantry_days_remaining: pantryDays,
  hearts_earned: heartsEarned,
  pet_reaction: reaction,
}).select('id').single();

    if (!error) {
  if (newLog?.id) setLastLoggedId(newLog.id);
  setShowMoodJournal(true);
  if (challenge?.id) {
  await supabase
    .from('community_challenges')
    .update({
      current_count: challenge.current_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', challenge.id);
  setChallenge(prev => prev ? { ...prev, current_count: prev.current_count + 1 } : prev);
}
  const newHearts = chowHearts + heartsEarned;
  await supabase.from('chow_hearts').upsert({
    user_id: userId,
    pet_id: pet.id,
    total_hearts: newHearts,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'pet_id' });

  setLastReaction(reaction);

  // Check if pet crossed into a new evolution stage
  const currentEvo = getPetEvolution(chowHearts, pet.species);
  const newEvo = getPetEvolution(newHearts, pet.species);
  if (newEvo.stage !== currentEvo.stage && newEvo.stage !== lastCelebratedStage) {
    await supabase.from('chow_hearts')
      .update({ last_celebrated_stage: newEvo.stage })
      .eq('pet_id', pet.id);
    setLastCelebratedStage(newEvo.stage);
    setNewEvolutionStage(newEvo);
    setShowEvolutionReveal(true);
    await recordMilestone(supabase, userId, pet.id, 'evolution', { stage: newEvo.stage, label: newEvo.label, emoji: newEvo.emoji, hearts: newHearts });
  }

  await fetchData();
  if (outcome === 'cleared') {
  setShowCelebration(true);
  // Record streak milestones
  const newStreak = streak + 1;
  const streakMilestones = [3, 7, 14, 30, 60, 90, 180, 365];
  if (streakMilestones.includes(newStreak)) {
    await recordMilestone(supabase, userId, pet.id, 'streak', { days: newStreak, hearts: chowHearts + heartsEarned });
  }
  // Record very first meal
  if (totalLogs === 0) {
    await recordMilestone(supabase, userId, pet.id, 'first_meal', { hearts: heartsEarned });
  }
}
}
    setLogging(false);
  }
  async function saveMood() {
  if (!lastLoggedId || !selectedMoodEmoji) return;
  const supabase = createSupabaseBrowserClient();
  await supabase.from('chow_logs')
    .update({ mood_emoji: selectedMoodEmoji, mood_word: selectedMoodWord || null })
    .eq('id', lastLoggedId);
  setSavedMoodEmoji(selectedMoodEmoji);
  setShowMoodJournal(false);
  setSelectedMoodEmoji(null);
  setSelectedMoodWord('');
  await fetchData();
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
// ── On This Day ──
function getOnThisDay() {
  if (!milestones.length) return null;
  const today = new Date();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  return milestones.find(m => {
    const mDate = new Date(m.created_at);
    return (
      mDate.getMonth() === todayMonth &&
      mDate.getDate() === todayDate &&
      mDate.getFullYear() < today.getFullYear()
    );
  }) || null;
}

function getMilestoneText(m: { milestone_type: string; milestone_data: Record<string, unknown> }, petName: string) {
  const data = m.milestone_data;
  switch (m.milestone_type) {
    case 'first_meal':
      return `${petName} had their very first logged meal. Every legend starts somewhere. 🥚`;
    case 'evolution':
      return `${petName} evolved into ${data.emoji} ${data.label} with ${data.hearts} hearts earned. 🎉`;
    case 'streak':
      return `${petName} hit a 🔥 ${data.days}-day streak! You showed up, every single day.`;
    case 'mood':
      return `${petName} was feeling ${data.emoji} ${data.word ? `— ${data.word}` : ''} today.`;
    default:
      return `A special moment with ${petName}.`;
  }
}
// ── Simulated Monthly Feeding Story ──
function generateSimulatedStory(
  petName: string,
  species: string,
  streakDays: number,
  totalMeals: number,
  clearedCount: number,
  hearts: number,
  evoLabel: string,
): string {
  const clearPct = totalMeals > 0 ? Math.round((clearedCount / totalMeals) * 100) : 0;
  const monthName = new Date().toLocaleString('en-ZA', { month: 'long' });
  const isCat = species?.toLowerCase().includes('cat');

  // Pick diagnosis line based on clear percentage
  const diagnosis = clearPct === 100
    ? `Official diagnosis: ${isCat ? 'bowl tyrant' : 'tiny vacuum cleaner'}.`
    : clearPct >= 80
    ? `Official diagnosis: ${isCat ? 'selective gourmet' : 'enthusiastic chomper'}.`
    : clearPct >= 50
    ? `Official diagnosis: ${isCat ? 'food critic' : 'picky but loveable eater'}.`
    : `Official diagnosis: ${isCat ? 'mysterious hunger patterns' : 'saving room for snacks'}.`;

  // Dog story templates
  const dogTemplates = [
    `${monthName} has been scientifically confirmed as ${petName}'s greatest month yet. ${totalMeals} meals logged, ${clearPct}% of bowls cleared with zero hesitation, and a ${streakDays}-day streak that frankly deserves a trophy. ${diagnosis} ${petName} would like you to know that consistency is everything, dinner is everything, and you are, without question, the best human on earth.`,

    `${petName} entered ${monthName} with one goal: eat well, love hard, and never let the bowl sit too long. Mission accomplished. ${totalMeals} meals, a ${streakDays}-day streak, and ${hearts} hearts earned along the way. ${diagnosis} Every cleared bowl is a love letter. You've received ${clearedCount} this month alone.`,

    `The ${monthName} feeding report is in, and the results are emotional. ${petName} showed up ${totalMeals} times, cleared the bowl ${clearPct}% of the time, and maintained a ${streakDays}-day streak without complaint. ${diagnosis} Somewhere between the morning kibble and the evening bowl, ${petName} quietly became a legend. You made that happen.`,
  ];

  // Cat story templates
  const catTemplates = [
    `${petName} has reviewed ${monthName}'s service and found it ${clearPct >= 80 ? 'acceptable' : 'adequate, barely'}. ${totalMeals} meals were presented. ${clearedCount} were deemed worthy of consumption. The ${streakDays}-day streak is noted, though punctuality could still improve by approximately five minutes. ${diagnosis} Despite everything, ${petName} has chosen to remain. That is the highest honour they bestow.`,

    `${monthName} feeding report, as dictated by ${petName}: meals provided — ${totalMeals}. Meals approved — ${clearedCount}. Days of consistent service — ${streakDays}. Current satisfaction level — unconfirmed. ${diagnosis} The human has shown improvement. ${petName} will consider purring. Eventually.`,

    `${petName}'s ${monthName} verdict: ${clearPct >= 80 ? 'the bowl servant has performed adequately' : 'standards were met, on most days'}. ${totalMeals} meals logged. ${hearts} hearts accumulated. A ${streakDays}-day streak achieved by someone who clearly understands the assignment. ${diagnosis} ${petName} has not forgotten a single meal. Neither should you.`,
  ];

  const templates = isCat ? catTemplates : dogTemplates;

  // Pick template based on streak to add variety
  const index = streakDays % templates.length;
  return templates[index];
}
function handleGenerateStory() {
  if (!pet || storyLoading) return;
  setStoryLoading(true);
  setShowStory(true);

  // Simulate a short loading pause so it feels like it's thinking
  setTimeout(() => {
    const story = generateSimulatedStory(
      pet.name,
      pet.species,
      streak,
      totalLogs,
      clearCount,
      chowHearts,
      getPetEvolution(chowHearts, pet.species).label,
    );
    setFeedingStory(story);
    setStoryLoading(false);
  }, 1800);
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
            🎁 Free trial · <strong style={{ color: '#c47a3a' }}>{Math.max(0, 30 - trialDaysUsed)} days</strong> remaining
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

{showMoodJournal && pet && (
  <MoodJournalModal
    petName={pet.name}
    onSave={(emoji, word) => {
      setSelectedMoodEmoji(emoji);
      setSelectedMoodWord(word);
      saveMood();
    }}
    onSkip={() => {
      setShowMoodJournal(false);
      setSelectedMoodEmoji(null);
      setSelectedMoodWord('');
    }}
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
        {/* ── Tab Bar ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
          background: '#181411', border: '0.5px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: 6, position: 'sticky', top: 12, zIndex: 10,
        }}>
          {[
            { key: 'today', label: '🍽️ Today' },
            { key: 'mypet', label: '🐾 My Pet' },
            { key: 'memories', label: '📖 Memories' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'today' | 'mypet' | 'memories')}
              style={{
                padding: '10px 0',
                background: activeTab === tab.key ? '#c47a3a' : 'transparent',
                color: activeTab === tab.key ? '#fff' : '#a08060',
                border: 'none', borderRadius: 11,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'background 0.2s, color 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
{/* ── Notification Prompt ── */}
{activeTab === 'today' && showNotifPrompt && (
  <div className="cs-card" style={{
    padding: '20px 24px',
    background: 'rgba(93,202,165,0.06)',
    borderColor: 'rgba(93,202,165,0.25)',
    display: 'flex', flexDirection: 'column', gap: 12,
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <span style={{ fontSize: 28, flexShrink: 0 }}>🔔</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#5dcaa5', marginBottom: 4 }}>
          Never miss a meal together
        </div>
        <div style={{ fontSize: 13, color: '#6a5040', lineHeight: 1.6 }}>
          Get a nudge when {pet.name} is getting hungry so you never lose your streak.
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 10 }}>
      <button
        onClick={async () => {
          const granted = await requestNotificationPermission();
          setNotificationsEnabled(granted);
          setShowNotifPrompt(false);
          localStorage.setItem('chow_notif_prompted', 'true');
        }}
        style={{
          flex: 1, padding: '11px 0',
          background: '#5dcaa5', color: '#fff',
          border: 'none', borderRadius: 11,
          fontSize: 13, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Yes please 🔔
      </button>
      <button
        onClick={() => {
          setShowNotifPrompt(false);
          localStorage.setItem('chow_notif_prompted', 'true');
        }}
        style={{
          flex: 1, padding: '11px 0',
          background: 'none',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 11, color: '#6a5040',
          fontSize: 13, cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Maybe later
      </button>
    </div>
  </div>
)}

{/* ── Notification Status ── */}
{activeTab === 'today' && notificationsEnabled && (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 16px',
    background: 'rgba(93,202,165,0.06)',
    border: '0.5px solid rgba(93,202,165,0.2)',
    borderRadius: 10, fontSize: 12, color: '#5dcaa5',
  }}>
    <span>🔔</span>
    <span>Hunger notifications are on — {pet.name} will let you know when they need feeding.</span>
  </div>
)}
        {/* ── Hunger Mood Card ── */}
        {activeTab === 'today' && (
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
        )}

        {/* ── Log Meal Buttons ── */}
        {activeTab === 'today' && (!todayLogged ? (
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
                🥣 Small Appetite
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
         ))}

{/* ── Pet Reaction ── */}
        {activeTab === 'today' && lastReaction && (
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

        {activeTab === 'today' && savedMoodEmoji && (
  <div className="cs-card" style={{
    padding: '16px 24px',
    display: 'flex', alignItems: 'center', gap: 14,
    background: 'rgba(139,92,246,0.06)',
    borderColor: 'rgba(139,92,246,0.2)',
  }}>
    <span style={{ fontSize: 32 }}>{savedMoodEmoji}</span>
    <div>
      <div style={{ fontSize: 11, color: '#6a5040', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
        {pet.name}'s mood today
      </div>
      <div style={{ fontSize: 13, color: '#d0b898' }}>
        {selectedMoodWord || 'Logged in the memory book'}
      </div>
    </div>
  </div>
)}
{/* ── Community Challenge ── */}
{activeTab === 'today' && challenge && (() => {
  const pct = Math.min(100, Math.round((challenge.current_count / challenge.goal) * 100));
  const remaining = challenge.goal - challenge.current_count;
  const monthName = new Date().toLocaleString('en-ZA', { month: 'long' });

  return (
    <div className="cs-card" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <p style={{ fontSize: 13, color: '#a08060', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          🏆 {monthName} challenge
        </p>
        <span style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 700 }}>
          {pct}% complete
        </span>
      </div>

      <p style={{ fontSize: 15, color: '#f0ebe4', fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>
        {challenge.title}
      </p>

      <p style={{ fontSize: 12, color: '#6a5040', marginBottom: 14 }}>
        {remaining > 0
          ? `${remaining.toLocaleString()} bowls to go — every meal ${pet?.name} eats counts`
          : `🎉 Challenge complete! SA pet parents did it!`}
      </p>

      {/* Progress bar */}
      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 99, height: 10, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{
          height: '100%', borderRadius: 99,
          background: 'linear-gradient(90deg,#8b5cf6,#c47a3a)',
          width: `${pct}%`,
          transition: 'width 0.8s ease',
        }} />
      </div>

      {/* Count strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#8b5cf6', fontWeight: 700 }}>
          🍽️ {challenge.current_count.toLocaleString()} bowls cleared
        </span>
        <span style={{ fontSize: 12, color: '#6a5040' }}>
          goal: {challenge.goal.toLocaleString()}
        </span>
      </div>

      {/* Reward label */}
      {challenge.reward_label && (
        <div style={{
          marginTop: 12, padding: '8px 12px',
          background: 'rgba(139,92,246,0.08)',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: 8, fontSize: 12, color: '#8b5cf6',
          textAlign: 'center',
        }}>
          🎖️ Reward: {challenge.reward_label}
        </div>
      )}
    </div>
  );
})()}

{/* ── Daily Trivia ── */}
{activeTab === 'today' && pet && (() => {
  const trivia = getDailyTrivia(pet.species, pet.breed);
  return (
    <div className="cs-card" style={{ padding: '20px 24px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14,
      }}>
        <p style={{ fontSize: 13, color: '#a08060', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          🧠 Daily trivia
        </p>
        {triviaAnswered === 'correct' && (
          <span style={{ fontSize: 12, color: '#5dcaa5', fontWeight: 700 }}>+1 heart earned!</span>
        )}
      </div>

      <p style={{ fontSize: 15, color: '#f0ebe4', lineHeight: 1.6, marginBottom: 16, fontWeight: 500 }}>
        {trivia.q}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {trivia.options.map((opt, i) => {
          const isSelected = triviaSelected === i;
          const isCorrect = i === trivia.answer;
          const isAnswered = triviaAnswered !== null;

          let bg = 'rgba(255,255,255,0.04)';
          let border = '1px solid rgba(255,255,255,0.08)';
          let color = '#d0b898';

          if (isAnswered) {
            if (isCorrect) { bg = 'rgba(93,202,165,0.15)'; border = '1px solid rgba(93,202,165,0.4)'; color = '#5dcaa5'; }
            else if (isSelected) { bg = 'rgba(239,68,68,0.12)'; border = '1px solid rgba(239,68,68,0.3)'; color = '#f87171'; }
          } else if (isSelected) {
            bg = 'rgba(196,122,58,0.15)'; border = '1px solid rgba(196,122,58,0.4)'; color = '#c47a3a';
          }

          return (
            <button
              key={i}
              disabled={isAnswered}
              onClick={async () => {
                if (isAnswered) return;
                setTriviaSelected(i);
                const correct = i === trivia.answer;
                setTriviaAnswered(correct ? 'correct' : 'wrong');
                if (correct) {
                  const supabase = createSupabaseBrowserClient();
                  const newHearts = chowHearts + 1;
                  await supabase.from('chow_hearts').upsert({
                    user_id: userId,
                    pet_id: pet.id,
                    total_hearts: newHearts,
                    updated_at: new Date().toISOString(),
                  }, { onConflict: 'pet_id' });
                  setChowHearts(newHearts);
                }
              }}
              style={{
                padding: '12px 16px', textAlign: 'left',
                background: bg, border, borderRadius: 10,
                color, fontSize: 14, cursor: isAnswered ? 'default' : 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {triviaAnswered && (
        <div style={{
          padding: '12px 14px',
          background: triviaAnswered === 'correct' ? 'rgba(93,202,165,0.08)' : 'rgba(196,122,58,0.08)',
          border: `1px solid ${triviaAnswered === 'correct' ? 'rgba(93,202,165,0.2)' : 'rgba(196,122,58,0.2)'}`,
          borderRadius: 10, fontSize: 13,
          color: triviaAnswered === 'correct' ? '#5dcaa5' : '#c47a3a',
          lineHeight: 1.6,
        }}>
          {triviaAnswered === 'correct' ? '✅ Correct! ' : '💡 Fun fact: '}
          {trivia.fact}
        </div>
      )}

      {!triviaAnswered && (
        <p style={{ fontSize: 11, color: '#6a5040', textAlign: 'center' }}>
          Correct answer earns +1 heart for {pet.name}
        </p>
      )}
    </div>
  );
})()}
{/* ── Pet Evolution Card ── */}
{activeTab === 'mypet' && (() => {
  const evo = getPetEvolution(chowHearts, pet.species);
  const nextEvo = getNextEvolution(chowHearts, pet.species);
  const clearPct = totalLogs > 0 ? Math.round((clearCount / totalLogs) * 100) : 0;
  const progressPct = nextEvo
    ? Math.min(100, Math.round(((chowHearts - evo.minHearts) / (nextEvo.minHearts - evo.minHearts)) * 100))
    : 100;

  return (
    <div className="cs-card" style={{ padding: '24px', border: `0.5px solid ${evo.color}33` }}>
      {/* Evolution stage header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{
          fontSize: 56, lineHeight: 1, flexShrink: 0,
          filter: 'drop-shadow(0 0 12px rgba(196,122,58,0.3))',
        }}>
          {evo.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: '#6a5040', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            {pet.name}'s current form
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: evo.color, marginBottom: 2 }}>
            {evo.label}
          </div>
          <div style={{ fontSize: 12, color: '#7a6050', fontStyle: 'italic' }}>"{evo.desc}"</div>
        </div>
      </div>

      {/* Hearts + progress */}
      <div style={{ marginBottom: nextEvo ? 12 : 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 13, color: '#a08060' }}>
            ❤️ <strong style={{ color: '#e8963d' }}>{chowHearts}</strong> hearts earned
          </div>
          {nextEvo && (
            <div style={{ fontSize: 12, color: '#6a5040' }}>
              {nextEvo.minHearts - chowHearts} to <span style={{ color: nextEvo.color }}>{nextEvo.emoji} {nextEvo.label}</span>
            </div>
          )}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: `linear-gradient(90deg,${evo.color},${evo.color}cc)`,
            width: `${progressPct}%`,
            transition: 'width 0.8s ease',
          }} />
        </div>
      </div>

      {/* Next evolution preview */}
      {nextEvo && (
        <div style={{
          marginTop: 16, padding: '12px 14px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 12,
          border: `0.5px solid ${nextEvo.color}33`,
        }}>
          <div style={{ fontSize: 28, opacity: 0.5 }}>{nextEvo.emoji}</div>
          <div>
            <div style={{ fontSize: 11, color: '#6a5040', marginBottom: 2 }}>Next evolution</div>
            <div style={{ fontSize: 13, color: nextEvo.color, fontWeight: 700 }}>{nextEvo.label}</div>
            <div style={{ fontSize: 11, color: '#6a5040' }}>at {nextEvo.minHearts} hearts</div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{
        marginTop: 16, paddingTop: 14, borderTop: '0.5px solid rgba(255,255,255,0.06)',
        display: 'flex', gap: 16,
      }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#c47a3a' }}>{clearPct}%</div>
          <div style={{ fontSize: 10, color: '#6a5040', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bowl cleared</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#5dcaa5' }}>{totalLogs}</div>
          <div style={{ fontSize: 10, color: '#6a5040', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total meals</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#f59e0b' }}>🔥 {streak}</div>
          <div style={{ fontSize: 10, color: '#6a5040', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Day streak</div>
        </div>
      </div>
    </div>
  );
})()}

{/* ── Evolution Reveal Modal ── */}
{showEvolutionReveal && newEvolutionStage && pet && (
  <EvolutionRevealModal
    pet={pet}
    stage={newEvolutionStage}
    onClose={() => { setShowEvolutionReveal(false); setNewEvolutionStage(null); }}
    onShare={() => {
      setShowEvolutionReveal(false);
      setNewEvolutionStage(null);
      setShareCardType('evolution');
      setShowShareCard(true);
    }}
  />
)}

        {/* ── Streak + Badges Row ── */}
        {activeTab === 'mypet' && (
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
        )}
{/* ── Share Streak ── */}
{streak >= 7 && (
  <button
    onClick={() => { setShareCardType('streak'); setShowShareCard(true); }}
    style={{
      width: '100%', padding: '12px 0',
      background: 'rgba(196,122,58,0.08)',
      border: '1px solid rgba(196,122,58,0.25)',
      borderRadius: 12, color: '#c47a3a',
      fontSize: 13, fontWeight: 700, cursor: 'pointer',
      fontFamily: 'inherit',
    }}
  >
    🔥 Share your {streak}-day streak
  </button>
)}
        {/* ── Owner Badge ── */}
        {activeTab === 'mypet' && (
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
        )}

        {/* ── Last 7 Days ── */}
        {activeTab === 'mypet' && (
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
        )}

        {/* ── Pantry Countdown ── */}
        {activeTab === 'memories' && (
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
        )}
        {/* ── Share Card Modal ── */}
{showShareCard && pet && (
  <ShareCardModal
    pet={pet}
    streak={streak}
    chowHearts={chowHearts}
    evo={getPetEvolution(chowHearts, pet.species)}
    story={feedingStory}
    cardType={shareCardType}
    onClose={() => setShowShareCard(false)}
  />
)}
        {/* ── Monthly Feeding Story ── */}
{activeTab === 'memories' && (
<div className="cs-card" style={{ padding: '20px 24px' }}>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
    <p style={{ fontSize: 13, color: '#a08060', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      📖 {new Date().toLocaleString('en-ZA', { month: 'long' })} Feeding Story
    </p>
    {!showStory && (
      <button
        onClick={handleGenerateStory}
        style={{
          background: 'none', border: '1px solid rgba(196,122,58,0.4)',
          color: '#c47a3a', fontSize: 12, cursor: 'pointer',
          fontFamily: 'inherit', fontWeight: 600,
          borderRadius: 8, padding: '4px 12px',
        }}
      >
        Generate ✨
      </button>
    )}
  </div>

  {!showStory && (
    <p style={{ fontSize: 13, color: '#6a5040', lineHeight: 1.6 }}>
      {pet.name}'s personalised monthly recap. Tap Generate to see what kind of eater they've been this month.
    </p>
  )}

  {showStory && storyLoading && (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>✍️</div>
      <p style={{ fontSize: 13, color: '#7a6050' }}>Writing {pet.name}'s story...</p>
    </div>
  )}

  {showStory && !storyLoading && feedingStory && (
    <div>
      <p style={{ fontSize: 14, color: '#d0b898', lineHeight: 1.8, fontStyle: 'italic', marginBottom: 16 }}>
        "{feedingStory}"
      </p>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
        paddingTop: 14, borderTop: '0.5px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#c47a3a' }}>{totalLogs}</div>
          <div style={{ fontSize: 10, color: '#6a5040', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Meals</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#5dcaa5' }}>
            {totalLogs > 0 ? Math.round((clearCount / totalLogs) * 100) : 0}%
          </div>
          <div style={{ fontSize: 10, color: '#6a5040', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cleared</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#f59e0b' }}>🔥 {streak}</div>
          <div style={{ fontSize: 10, color: '#6a5040', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Streak</div>
        </div>
      </div>
    </div>
  )}<button
  onClick={() => { setShareCardType('story'); setShowShareCard(true); }}
  style={{
    width: '100%', marginTop: 14, padding: '11px 0',
    background: 'rgba(139,92,246,0.08)',
    border: '1px solid rgba(139,92,246,0.25)',
    borderRadius: 12, color: '#8b5cf6',
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit',
  }}
>
  📸 Share {pet.name}'s story
</button>
</div>
)}
{/* ── On This Day ── */}
{activeTab === 'memories' && (() => {
  const onThisDay = getOnThisDay();
  if (!onThisDay) return null;
  const yearsAgo = new Date().getFullYear() - new Date(onThisDay.created_at).getFullYear();
  return (
    <div className="cs-card" style={{
      padding: '20px 24px',
      background: 'rgba(139,92,246,0.06)',
      borderColor: 'rgba(139,92,246,0.25)',
    }}>
      <p style={{ fontSize: 13, color: '#8b5cf6', marginBottom: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        🕰️ On This Day
      </p>
      <p style={{ fontSize: 13, color: '#6a5040', marginBottom: 8 }}>
        {yearsAgo} year{yearsAgo !== 1 ? 's' : ''} ago today
      </p>
      <p style={{ fontSize: 15, color: '#d0b898', lineHeight: 1.6 }}>
        {getMilestoneText(onThisDay, pet.name)}
      </p>
    </div>
  );
})()}

{/* ── Memories Timeline ── */}
{activeTab === 'memories' && milestones.length > 0 && (
  <div className="cs-card" style={{ padding: '20px 24px' }}>
    <p style={{ fontSize: 13, color: '#a08060', marginBottom: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      📖 Memory Book
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {milestones.slice(0, 8).map((m, i) => (
        <div key={m.id} style={{
          display: 'flex', gap: 14, paddingBottom: 16,
          borderLeft: i < milestones.slice(0, 8).length - 1 ? '1.5px solid rgba(196,122,58,0.2)' : 'none',
          marginLeft: 10, paddingLeft: 20, position: 'relative',
        }}>
          <div style={{
            position: 'absolute', left: -6, top: 2,
            width: 11, height: 11, borderRadius: '50%',
            background: '#c47a3a',
            border: '2px solid #0c0a08',
            flexShrink: 0,
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: '#d0b898', lineHeight: 1.5, marginBottom: 4 }}>
              {getMilestoneText(m, pet.name)}
            </div>
            <div style={{ fontSize: 11, color: '#6a5040' }}>
              {new Date(m.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
        {/* ── Recent Log History ── */}
        {activeTab === 'memories' && logs.length > 0 && (
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

