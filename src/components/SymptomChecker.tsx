'use client';

import { useState, useMemo } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type Urgency = 'monitor' | 'call_vet' | 'emergency';

type Result = {
  urgency: Urgency;
  title: string;
  message: string;
  tips: string[];
};

/* ─────────────────────────────────────────────
   Analysis logic (100% preserved from original)
───────────────────────────────────────────── */
function analyzeSymptoms(answers: {
  mainSymptom: string;
  duration: string;
  eating: string;
  energy: string;
  vomiting: string;
  diarrhea: string;
  breathing: string;
  species: string;
}): Result {
  if (answers.breathing === 'struggling') {
    return {
      urgency: 'emergency',
      title: 'Emergency — Go to Vet NOW',
      message: 'Breathing difficulty is a serious emergency. Please take your pet to the nearest emergency vet immediately.',
      tips: [
        'Keep your pet calm and still',
        'Do not give food or water',
        'Call the emergency vet on the way',
        'Note the time symptoms started',
      ],
    };
  }
  if (answers.mainSymptom === 'seizure') {
    return {
      urgency: 'emergency',
      title: 'Emergency — Go to Vet NOW',
      message: 'Seizures require immediate veterinary attention. Please go to the nearest emergency vet.',
      tips: [
        'Do not put your hand near their mouth',
        'Move objects away to prevent injury',
        'Time the seizure if possible',
        'Keep the room quiet and dark',
      ],
    };
  }
  if (answers.mainSymptom === 'blood_stool' || answers.mainSymptom === 'blood_vomit') {
    return {
      urgency: 'emergency',
      title: 'Emergency — Go to Vet NOW',
      message: 'Blood in vomit or stool can indicate a serious condition. Please seek emergency veterinary care.',
      tips: [
        'Note the colour and amount of blood',
        'Collect a sample if possible',
        'Do not give any medication',
        'Keep your pet warm and calm',
      ],
    };
  }
  if (answers.mainSymptom === 'collapse' || answers.mainSymptom === 'not_responding') {
    return {
      urgency: 'emergency',
      title: 'Emergency — Go to Vet NOW',
      message: 'A collapsed or unresponsive pet needs immediate emergency care.',
      tips: [
        'Check if your pet is breathing',
        'Keep them warm with a blanket',
        'Do not move them unnecessarily',
        'Call ahead to the emergency vet',
      ],
    };
  }
  if (answers.eating === 'nothing' && answers.duration !== 'few_hours') {
    return {
      urgency: 'call_vet',
      title: 'Call Your Vet Today',
      message: 'A pet that has stopped eating for more than a day should be seen by a vet. This is especially important for cats.',
      tips: [
        'Try offering their favourite treat',
        'Check for mouth pain or dental issues',
        'Note when they last ate normally',
        'Monitor water intake too',
      ],
    };
  }
  if (answers.vomiting === 'multiple' || answers.diarrhea === 'multiple') {
    return {
      urgency: 'call_vet',
      title: 'Call Your Vet Today',
      message: 'Multiple episodes of vomiting or diarrhea can lead to dehydration. Your pet should be checked today.',
      tips: [
        'Remove food for 12 hours (adults only)',
        'Offer small amounts of water frequently',
        'Watch for signs of dehydration (dry gums)',
        'Note what they ate recently',
      ],
    };
  }
  if (answers.energy === 'lethargic' && answers.duration !== 'few_hours') {
    return {
      urgency: 'call_vet',
      title: 'Call Your Vet Today',
      message: 'Persistent lethargy lasting more than a day can indicate an underlying health issue.',
      tips: [
        'Check their temperature if you can',
        'Note any other changes in behaviour',
        'Check gums — they should be pink',
        'Monitor food and water intake',
      ],
    };
  }
  if (answers.mainSymptom === 'limping' && answers.duration !== 'few_hours') {
    return {
      urgency: 'call_vet',
      title: 'Call Your Vet Today',
      message: 'Persistent limping should be checked to rule out fractures, sprains, or joint issues.',
      tips: [
        'Restrict exercise and jumping',
        'Check the paw for cuts or thorns',
        'Feel gently for swelling or heat',
        'Do not give human painkillers',
      ],
    };
  }
  return {
    urgency: 'monitor',
    title: 'Monitor at Home',
    message: 'Based on your answers, this seems manageable at home for now. Keep watching closely and call your vet if things get worse.',
    tips: [
      'Monitor for changes over the next 24 hours',
      'Make sure fresh water is available',
      'Keep a written log of symptoms',
      'Call your vet if symptoms worsen or persist',
    ],
  };
}

/* ─────────────────────────────────────────────
   Urgency config
───────────────────────────────────────────── */
const URGENCY_CONFIG = {
  emergency: {
    accent: '#f87171',
    glow: 'rgba(248,113,113,0.2)',
    border: 'rgba(248,113,113,0.3)',
    bg: 'rgba(248,113,113,0.06)',
    icon: '🚨',
    pulse: true,
  },
  call_vet: {
    accent: '#fbbf24',
    glow: 'rgba(251,191,36,0.15)',
    border: 'rgba(251,191,36,0.3)',
    bg: 'rgba(251,191,36,0.05)',
    icon: '📞',
    pulse: false,
  },
  monitor: {
    accent: '#34d399',
    glow: 'rgba(52,211,153,0.15)',
    border: 'rgba(52,211,153,0.25)',
    bg: 'rgba(52,211,153,0.05)',
    icon: '🏠',
    pulse: false,
  },
};

/* Immediate-emergency symptoms — skip to result */
const EMERGENCY_SYMPTOMS = new Set(['seizure', 'collapse', 'not_responding', 'blood_stool', 'blood_vomit']);

/* ─────────────────────────────────────────────
   Live urgency signal (before full analysis)
───────────────────────────────────────────── */
function getLiveUrgency(
  mainSymptom: string,
  breathing: string,
  eating: string,
  energy: string,
  vomiting: string,
  diarrhea: string,
): 'low' | 'medium' | 'high' {
  if (breathing === 'struggling' || EMERGENCY_SYMPTOMS.has(mainSymptom)) return 'high';
  if (vomiting === 'multiple' || diarrhea === 'multiple' || energy === 'lethargic' || eating === 'nothing') return 'medium';
  return 'low';
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function SymptomChecker({
  petId,
  petName,
  petSpecies,
}: {
  petId: string;
  petName: string;
  petSpecies: string;
}) {
  const supabase = createSupabaseBrowserClient();

  const [step, setStep]         = useState(0);
  const [result, setResult]     = useState<Result | null>(null);
  const [saving, setSaving]     = useState(false);
  const [animKey, setAnimKey]   = useState(0);

  // Answers
  const [mainSymptom, setMainSymptom] = useState('');
  const [duration, setDuration]       = useState('');
  const [eating, setEating]           = useState('');
  const [energy, setEnergy]           = useState('');
  const [vomiting, setVomiting]       = useState('');
  const [diarrhea, setDiarrhea]       = useState('');
  const [breathing, setBreathing]     = useState('');

  /* ── Questions definition ── */
  const questions = useMemo(() => [
    {
      id: 'main',
      question: `What's the main concern with ${petName}?`,
      options: [
        { value: 'vomiting',      label: 'Vomiting',                  icon: '🤢' },
        { value: 'diarrhea',      label: 'Diarrhea',                  icon: '💩' },
        { value: 'not_eating',    label: 'Not eating',                icon: '🚫' },
        { value: 'limping',       label: 'Limping',                   icon: '🦿' },
        { value: 'coughing',      label: 'Coughing / Sneezing',       icon: '😷' },
        { value: 'scratching',    label: 'Excessive scratching',      icon: '🐾' },
        { value: 'blood_stool',   label: 'Blood in stool',            icon: '🩸' },
        { value: 'blood_vomit',   label: 'Blood in vomit',            icon: '🩸' },
        { value: 'seizure',       label: 'Seizure / Shaking',         icon: '⚡' },
        { value: 'collapse',      label: 'Collapsed / Not responding',icon: '😰' },
        { value: 'other',         label: 'Something else',            icon: '❓' },
      ],
      value: mainSymptom,
      setValue: (v: string) => {
        setMainSymptom(v);
        // Fast-track emergency symptoms immediately
        if (EMERGENCY_SYMPTOMS.has(v)) {
          const r = analyzeSymptoms({ mainSymptom: v, duration: 'few_hours', eating: 'less', energy: 'tired', vomiting: 'none', diarrhea: 'none', breathing: 'normal', species: petSpecies });
          triggerResult(r, v, 'few_hours');
        }
      },
    },
    {
      id: 'duration',
      question: 'How long has this been going on?',
      options: [
        { value: 'few_hours', label: 'A few hours',       icon: '⏰' },
        { value: 'one_day',   label: 'About 1 day',       icon: '📅' },
        { value: 'few_days',  label: '2–3 days',          icon: '🗓' },
        { value: 'week_plus', label: 'A week or more',    icon: '📆' },
      ],
      value: duration,
      setValue: setDuration,
    },
    {
      id: 'eating',
      question: `Is ${petName} eating?`,
      options: [
        { value: 'normal',  label: 'Eating normally',        icon: '😋' },
        { value: 'less',    label: 'Eating less than usual', icon: '😐' },
        { value: 'nothing', label: 'Not eating at all',      icon: '🚫' },
      ],
      value: eating,
      setValue: setEating,
    },
    {
      id: 'energy',
      question: `How is ${petName}'s energy level?`,
      options: [
        { value: 'normal',   label: 'Normal energy',           icon: '⚡' },
        { value: 'tired',    label: 'More tired than usual',   icon: '😴' },
        { value: 'lethargic',label: "Very lethargic / won't move", icon: '🛌' },
      ],
      value: energy,
      setValue: setEnergy,
    },
    {
      id: 'vomiting',
      question: 'Any vomiting?',
      options: [
        { value: 'none',     label: 'No vomiting',         icon: '✅' },
        { value: 'once',     label: 'Vomited once',        icon: '1️⃣' },
        { value: 'multiple', label: 'Vomited multiple times', icon: '🔄' },
      ],
      value: vomiting,
      setValue: setVomiting,
    },
    {
      id: 'diarrhea',
      question: 'Any diarrhea?',
      options: [
        { value: 'none',     label: 'No diarrhea',    icon: '✅' },
        { value: 'once',     label: 'Once',           icon: '1️⃣' },
        { value: 'multiple', label: 'Multiple times', icon: '🔄' },
      ],
      value: diarrhea,
      setValue: setDiarrhea,
    },
    {
      id: 'breathing',
      question: `How is ${petName}'s breathing?`,
      options: [
        { value: 'normal',     label: 'Normal breathing',        icon: '✅' },
        { value: 'fast',       label: 'Faster than usual',       icon: '💨' },
        { value: 'struggling', label: 'Struggling to breathe',   icon: '🚨' },
      ],
      value: breathing,
      setValue: (v: string) => {
        setBreathing(v);
        if (v === 'struggling') {
          const r = analyzeSymptoms({ mainSymptom, duration, eating, energy, vomiting, diarrhea, breathing: v, species: petSpecies });
          triggerResult(r, mainSymptom, duration);
        }
      },
    },
  ], [petName, petSpecies, mainSymptom, duration, eating, energy, vomiting, diarrhea]);

  async function triggerResult(r: Result, sym: string, dur: string) {
    setResult(r);
    setSaving(true);
    await supabase.from('health_journal').insert({
      pet_id: petId,
      date: new Date().toISOString().split('T')[0],
      symptoms: `Symptom Check: ${sym}. Duration: ${dur}. Result: ${r.title}`,
      notes: r.message,
    });
    setSaving(false);
  }

  function handleSelect(value: string, setter: (v: string) => void) {
    setter(value);
    if (step < questions.length - 1) {
      setTimeout(() => {
        setStep(s => s + 1);
        setAnimKey(k => k + 1);
      }, 220);
    }
  }

  function handleAnalyze() {
    const r = analyzeSymptoms({ mainSymptom, duration, eating, energy, vomiting, diarrhea, breathing, species: petSpecies });
    triggerResult(r, mainSymptom, duration);
  }

  function resetChecker() {
    setStep(0); setResult(null); setAnimKey(0);
    setMainSymptom(''); setDuration(''); setEating('');
    setEnergy(''); setVomiting(''); setDiarrhea(''); setBreathing('');
  }

  const liveUrgency = getLiveUrgency(mainSymptom, breathing, eating, energy, vomiting, diarrhea);
  const urgencyBarColor = liveUrgency === 'high' ? '#f87171' : liveUrgency === 'medium' ? '#fbbf24' : '#34d399';
  const currentQ = questions[step];
  const isLast   = step === questions.length - 1;

  /* ─── RESULT VIEW ─── */
  if (result) {
    const cfg = URGENCY_CONFIG[result.urgency];
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap');
          .sc-result-root {
            font-family: 'DM Sans', sans-serif;
            background: rgba(255,255,255,0.015);
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 24px; overflow: hidden; position: relative;
          }
          .sc-result-root::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
            background: linear-gradient(90deg, transparent, ${cfg.accent}88, transparent);
          }
          .sc-emergency-pulse { animation: sc-ep 1.6s ease-in-out infinite; }
          @keyframes sc-ep { 0%,100% { box-shadow: 0 0 0 0 ${cfg.glow}; } 60% { box-shadow: 0 0 0 12px transparent; } }
          .sc-tip-item { display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.55rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
          .sc-tip-item:last-child { border-bottom: none; }
          .sc-disclaimer {
            background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
            border-radius: 12px; padding: 1rem 1.25rem;
            font-size: 0.78rem; color: rgba(255,255,255,0.35); line-height: 1.6;
          }
          .sc-reset-btn {
            width: 100%; background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px; padding: 0.85rem;
            font-size: 0.88rem; font-weight: 700; color: rgba(255,255,255,0.5);
            cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
          }
          .sc-reset-btn:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); }
        `}</style>
        <div className="sc-result-root">
          {/* Result card */}
          <div style={{
            margin: '1.75rem',
            padding: '1.75rem',
            borderRadius: 18,
            background: cfg.bg,
            border: `1.5px solid ${cfg.border}`,
          }} className={result.urgency === 'emergency' ? 'sc-emergency-pulse' : ''}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{
                fontSize: '2rem', lineHeight: 1, flexShrink: 0,
                background: cfg.bg, borderRadius: 12, padding: '0.5rem',
                border: `1px solid ${cfg.border}`,
              }}>{cfg.icon}</div>
              <div>
                <div style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: '1.25rem', fontWeight: 800,
                  color: cfg.accent, letterSpacing: '-0.02em', marginBottom: 6,
                }}>{result.title}</div>
                <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
                  {result.message}
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div style={{ padding: '0 1.75rem 1.25rem' }}>
            <div style={{ fontSize: '0.67rem', fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
              What to do now
            </div>
            {result.tips.map((tip, i) => (
              <div key={i} className="sc-tip-item">
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: `${cfg.accent}18`, border: `1px solid ${cfg.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 800, color: cfg.accent, marginTop: 1,
                }}>{i + 1}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{tip}</div>
              </div>
            ))}
          </div>

          {/* Saved notice */}
          <div style={{ padding: '0 1.75rem 1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>✓</span> This check has been saved to {petName}'s Health Journal
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ padding: '0 1.75rem 1.25rem' }}>
            <div className="sc-disclaimer">
              <strong style={{ color: 'rgba(255,255,255,0.5)' }}>⚠️ Disclaimer:</strong> This is not a medical diagnosis — it is general guidance only. Always consult your veterinarian for professional medical advice about {petName}'s health.
            </div>
          </div>

          {/* Reset */}
          <div style={{ padding: '0 1.75rem 1.75rem' }}>
            <button className="sc-reset-btn" onClick={resetChecker}>↺ Start a new check</button>
          </div>
        </div>
      </>
    );
  }

  /* ─── QUESTION VIEW ─── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap');

        .sc-root {
          font-family: 'DM Sans', sans-serif;
          background: rgba(255,255,255,0.015);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px; overflow: hidden; position: relative;
        }
        .sc-root::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(248,113,113,0.4), rgba(251,191,36,0.3), transparent);
        }

        /* Header */
        .sc-header {
          padding: 1.75rem 2rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .sc-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.25rem; font-weight: 800;
          color: white; letter-spacing: -0.02em; margin-bottom: 2px;
        }
        .sc-subtitle { font-size: 0.78rem; color: rgba(255,255,255,0.3); }

        /* Live urgency bar */
        .sc-urgency-bar-wrap {
          padding: 1rem 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; gap: 1rem;
        }
        .sc-urgency-track {
          flex: 1; height: 4px; border-radius: 100px;
          background: rgba(255,255,255,0.06); overflow: hidden;
        }
        .sc-urgency-fill {
          height: 100%; border-radius: 100px;
          transition: width 0.5s ease, background 0.5s ease;
        }
        .sc-urgency-label {
          font-size: 0.68rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          white-space: nowrap; transition: color 0.4s;
        }

        /* Progress dots */
        .sc-dots {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0 2rem 0;
          justify-content: center;
        }
        .sc-dot {
          border-radius: 100px;
          transition: all 0.3s ease;
        }

        /* Question area */
        .sc-body {
          padding: 1.5rem 2rem 1.75rem;
          animation: sc-slide-in 0.25s ease;
        }
        @keyframes sc-slide-in {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .sc-step-label {
          font-size: 0.65rem; font-weight: 700;
          color: rgba(255,255,255,0.2); text-transform: uppercase;
          letter-spacing: 0.1em; margin-bottom: 0.5rem;
        }
        .sc-question {
          font-family: 'Syne', sans-serif;
          font-size: 1.05rem; font-weight: 700;
          color: white; letter-spacing: -0.02em;
          margin-bottom: 1.25rem; line-height: 1.35;
        }

        /* Option buttons */
        .sc-options {
          display: flex; flex-direction: column; gap: 0.5rem;
          margin-bottom: 1.25rem;
        }
        .sc-option {
          display: flex; align-items: center; gap: 0.9rem;
          padding: 0.8rem 1.1rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; cursor: pointer;
          transition: all 0.18s ease;
          font-family: 'DM Sans', sans-serif;
          text-align: left; width: 100%;
        }
        .sc-option:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.14);
          transform: translateX(3px);
        }
        .sc-option.selected {
          background: rgba(248,113,113,0.07);
          border-color: rgba(248,113,113,0.3);
        }
        .sc-option-icon {
          font-size: 1.1rem; flex-shrink: 0; width: 28px; text-align: center;
        }
        .sc-option-label {
          font-size: 0.88rem; font-weight: 500;
          color: rgba(255,255,255,0.7);
        }
        .sc-option.selected .sc-option-label { color: white; }

        /* Nav */
        .sc-nav { display: flex; gap: 0.6rem; }
        .sc-back-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 0.7rem 1rem;
          font-size: 0.85rem; font-weight: 600;
          color: rgba(255,255,255,0.3); cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .sc-back-btn:hover { color: rgba(255,255,255,0.6); border-color: rgba(255,255,255,0.15); }

        .sc-analyze-btn {
          flex: 1;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border: none; border-radius: 10px;
          padding: 0.75rem 1.5rem;
          font-size: 0.88rem; font-weight: 700; color: white;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 14px rgba(220,38,38,0.3);
          transition: all 0.2s; letter-spacing: 0.02em;
        }
        .sc-analyze-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(220,38,38,0.4); }
      `}</style>

      <div className="sc-root">

        {/* Header */}
        <div className="sc-header">
          <div className="sc-title">🩺 Should I Call the Vet?</div>
          <div className="sc-subtitle">Answer {questions.length} quick questions about {petName}</div>
        </div>

        {/* Live urgency indicator */}
        <div className="sc-urgency-bar-wrap">
          <div className="sc-urgency-track">
            <div className="sc-urgency-fill" style={{
              width: liveUrgency === 'high' ? '100%' : liveUrgency === 'medium' ? '55%' : mainSymptom ? '15%' : '0%',
              background: urgencyBarColor,
            }} />
          </div>
          <div className="sc-urgency-label" style={{ color: urgencyBarColor }}>
            {liveUrgency === 'high' ? '⚠ High concern' : liveUrgency === 'medium' ? '· Medium concern' : '· Low concern'}
          </div>
        </div>

        {/* Progress dots */}
        <div className="sc-dots" style={{ paddingTop: '1.1rem', paddingBottom: '0' }}>
          {questions.map((_, i) => (
            <div key={i} className="sc-dot" style={{
              width: i === step ? 20 : 6,
              height: 6,
              background: i < step ? 'rgba(255,255,255,0.35)' : i === step ? '#f87171' : 'rgba(255,255,255,0.1)',
            }} />
          ))}
        </div>

        {/* Question */}
        <div className="sc-body" key={animKey}>
          <div className="sc-step-label">Question {step + 1} of {questions.length}</div>
          <div className="sc-question">{currentQ.question}</div>

          <div className="sc-options">
            {currentQ.options.map(opt => (
              <button
                key={opt.value}
                className={`sc-option ${currentQ.value === opt.value ? 'selected' : ''}`}
                onClick={() => handleSelect(opt.value, currentQ.setValue as (v: string) => void)}
              >
                <span className="sc-option-icon">{opt.icon}</span>
                <span className="sc-option-label">{opt.label}</span>
                {currentQ.value === opt.value && (
                  <span style={{ marginLeft: 'auto', color: '#f87171', fontSize: '0.75rem', fontWeight: 700 }}>✓</span>
                )}
              </button>
            ))}
          </div>

          <div className="sc-nav">
            {step > 0 && (
              <button className="sc-back-btn" onClick={() => { setStep(s => s - 1); setAnimKey(k => k + 1); }}>
                ← Back
              </button>
            )}
            {isLast && currentQ.value && (
              <button className="sc-analyze-btn" onClick={handleAnalyze}>
                Get recommendation →
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}