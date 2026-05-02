'use client';

import { useState, useEffect } from 'react';
import {
  getBreedData,
  matchQuestions,
  questionWeights,
  calculateMatchScore,
  getVerdict,
  getVerdictColor,
  getGuardianVoice,
  type BreedProfile,
} from '@/data/breeds';

// ─── Types ───────────────────────────────────────────────────────────────────

type Stage = 'hook' | 'questions' | 'analyzing' | 'result';

interface Props {
  breed: string;
  petName?: string;
}

// ─── Analyzing messages shown during fake-AI delay ────────────────────────

const analyzingSteps = [
  'Reading breed DNA profile...',
  'Comparing to your lifestyle answers...',
  'Identifying potential friction points...',
  'Calculating compatibility score...',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function BreedIntelligenceBrief({ breed, petName }: Props) {
  const profile = getBreedData(breed);

  const [stage, setStage] = useState<Stage>('hook');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);

  // Cycle through analyzing steps
  useEffect(() => {
    if (stage !== 'analyzing') return;
    if (analyzingStep >= analyzingSteps.length) {
      const s = calculateMatchScore(answers);
      setScore(s);
      setStage('result');
      return;
    }
    const t = setTimeout(() => setAnalyzingStep((p) => p + 1), 700);
    return () => clearTimeout(t);
  }, [stage, analyzingStep, answers]);

  const handleAnswer = (questionId: string, weight: number) => {
    const updated = { ...answers, [questionId]: weight };
    setAnswers(updated);
    if (currentQuestion < matchQuestions.length - 1) {
      setCurrentQuestion((p) => p + 1);
    } else {
      setStage('analyzing');
    }
  };

  const reset = () => {
    setStage('hook');
    setAnswers({});
    setCurrentQuestion(0);
    setScore(null);
    setAnalyzingStep(0);
    setExpandedRisk(null);
  };

  // ── Fallback ────────────────────────────────────────────────────────────────
  if (!profile) {
    return (
      <div style={styles.card}>
        <div style={styles.fallback}>
          <span style={{ fontSize: 32 }}>🧠</span>
          <p style={styles.fallbackTitle}>Breed Intelligence Brief</p>
          <p style={styles.fallbackSub}>
            We're still learning about this breed. More insights coming soon.
          </p>
        </div>
      </div>
    );
  }

  const energyColor = {
    'Very High': '#ef4444',
    High: '#f97316',
    Medium: '#eab308',
    Low: '#22c55e',
  }[profile.energy_level];

  // ── HOOK stage ──────────────────────────────────────────────────────────────
  if (stage === 'hook') {
    return (
      <div style={styles.card}>
        <div style={{ ...styles.energyBadge, background: energyColor }}>
          <span style={styles.dot} /> {profile.energy_level.toUpperCase()} ENERGY
        </div>

        <h2 style={styles.hookTitle}>{profile.hook}</h2>
        <p style={styles.hookSub}>
          Most owners underestimate this breed. In 3 questions, we'll show you exactly where you stand.
        </p>

        <div style={styles.taglineRow}>
          <span style={styles.tagline}>{profile.tagline}</span>
          <span style={styles.lifespan}>🕐 {profile.lifespan} · ⚖️ {profile.weight}</span>
        </div>

        <button style={styles.primaryBtn} onClick={() => setStage('questions')}>
          Begin Guardian Assessment →
        </button>
      </div>
    );
  }

  // ── QUESTIONS stage ─────────────────────────────────────────────────────────
  if (stage === 'questions') {
    const q = matchQuestions[currentQuestion];
    const progress = ((currentQuestion) / matchQuestions.length) * 100;

    return (
      <div style={styles.card}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
        <p style={styles.stepLabel}>Step {currentQuestion + 1} of {matchQuestions.length}</p>

        <h3 style={styles.questionText}>{q.question}</h3>

        <div style={styles.optionList}>
          {q.options.map((opt) => (
            <button
              key={opt.value}
              style={styles.optionBtn}
              onClick={() => handleAnswer(q.id, opt.weight)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#f97316';
                (e.currentTarget as HTMLButtonElement).style.background = '#fff7ed';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
                (e.currentTarget as HTMLButtonElement).style.background = '#fff';
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── ANALYZING stage ─────────────────────────────────────────────────────────
  if (stage === 'analyzing') {
    return (
      <div style={styles.card}>
        <div style={styles.analyzingWrap}>
          <div style={styles.brainPulse}>🧠</div>
          <p style={styles.analyzingTitle}>Analyzing your match...</p>
          <div style={styles.analyzeSteps}>
            {analyzingSteps.map((step, i) => (
              <div
                key={i}
                style={{
                  ...styles.analyzeStep,
                  opacity: i < analyzingStep ? 1 : 0.2,
                  color: i < analyzingStep ? '#f97316' : '#9ca3af',
                }}
              >
                {i < analyzingStep ? '✓' : '○'} {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT stage ────────────────────────────────────────────────────────────
  if (stage === 'result' && score !== null) {
    const verdict = getVerdict(score);
    const verdictColor = getVerdictColor(score);
    const guardianVoice = getGuardianVoice(score, profile.name);

    return (
      <div style={styles.card}>
        {/* Score card */}
        <div style={{ ...styles.scoreCard, borderColor: verdictColor }}>
          <div style={{ ...styles.scoreCircle, borderColor: verdictColor, color: verdictColor }}>
            {score}%
          </div>
          <div>
            <p style={{ ...styles.verdictLabel, color: verdictColor }}>{verdict}</p>
            <p style={styles.verdictBreed}>{profile.name} · {petName || 'Your Pet'}</p>
          </div>
        </div>

        {/* Reality Check */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>⚠️ The Reality Most Owners Ignore</p>
          {profile.risk_flags.map((risk) => (
            <div key={risk.id} style={styles.riskItem}>
              <button
                style={styles.riskHeader}
                onClick={() => setExpandedRisk(expandedRisk === risk.id ? null : risk.id)}
              >
                <span style={styles.riskTitle}>{risk.title}</span>
                <span style={styles.riskChevron}>{expandedRisk === risk.id ? '▲' : '▼'}</span>
              </button>
              {expandedRisk === risk.id && (
                <p style={styles.riskConsequence}>{risk.consequence}</p>
              )}
            </div>
          ))}
        </div>

        {/* Guardian Insight */}
        <div style={styles.guardianBox}>
          <p style={styles.guardianLabel}>🛡️ GUARDIAN INSIGHT</p>
          <p style={styles.guardianText}>{guardianVoice}</p>
        </div>

        {/* CTAs */}
        <div style={styles.ctaRow}>
          <button style={styles.primaryBtn}>Build Your Guardian Plan</button>
          <button style={styles.ghostBtn} onClick={reset}>Retake Assessment</button>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: '#0a0a0a',
    borderRadius: 20,
    padding: '28px 24px',
    color: '#fff',
    fontFamily: 'system-ui, sans-serif',
  },
  fallback: {
    textAlign: 'center',
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  fallbackTitle: { fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 },
  fallbackSub: { fontSize: 14, color: '#9ca3af', margin: 0 },
  energyBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    padding: '4px 10px',
    borderRadius: 20,
    marginBottom: 16,
    color: '#fff',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.8)',
    display: 'inline-block',
  },
  hookTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: '#fff',
    margin: '0 0 10px',
    lineHeight: 1.3,
  },
  hookSub: { fontSize: 14, color: '#9ca3af', margin: '0 0 20px', lineHeight: 1.6 },
  taglineRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 8,
  },
  tagline: { fontSize: 13, color: '#6b7280', fontStyle: 'italic' },
  lifespan: { fontSize: 12, color: '#6b7280' },
  primaryBtn: {
    background: '#f97316',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '13px 24px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    width: '100%',
  },
  ghostBtn: {
    background: 'transparent',
    color: '#9ca3af',
    border: '1px solid #374151',
    borderRadius: 12,
    padding: '12px 20px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    flex: 1,
  },
  progressBar: {
    height: 4,
    background: '#1f2937',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#f97316',
    borderRadius: 4,
    transition: 'width 0.4s ease',
  },
  stepLabel: { fontSize: 12, color: '#6b7280', margin: '0 0 16px', letterSpacing: '0.05em' },
  questionText: {
    fontSize: 17,
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 20px',
    lineHeight: 1.4,
  },
  optionList: { display: 'flex', flexDirection: 'column', gap: 10 },
  optionBtn: {
    background: '#fff',
    border: '2px solid #e5e7eb',
    borderRadius: 12,
    padding: '14px 16px',
    fontSize: 14,
    fontWeight: 500,
    color: '#111827',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  analyzingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '30px 0',
    gap: 16,
  },
  brainPulse: {
    fontSize: 48,
    animation: 'pulse 1.2s ease-in-out infinite',
  },
  analyzingTitle: { fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 },
  analyzeSteps: { display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 320 },
  analyzeStep: {
    fontSize: 13,
    fontFamily: 'monospace',
    transition: 'all 0.3s ease',
  },
  scoreCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    border: '2px solid',
    borderRadius: 16,
    padding: '20px',
    marginBottom: 24,
    background: '#111827',
  },
  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    border: '3px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 800,
    flexShrink: 0,
  },
  verdictLabel: { fontSize: 16, fontWeight: 800, margin: '0 0 4px' },
  verdictBreed: { fontSize: 13, color: '#9ca3af', margin: 0 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#f97316',
    letterSpacing: '0.05em',
    margin: '0 0 12px',
  },
  riskItem: {
    border: '1px solid #1f2937',
    borderRadius: 10,
    marginBottom: 8,
    overflow: 'hidden',
  },
  riskHeader: {
    width: '100%',
    background: '#111827',
    border: 'none',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    color: '#fff',
  },
  riskTitle: { fontSize: 14, fontWeight: 600 },
  riskChevron: { fontSize: 11, color: '#6b7280' },
  riskConsequence: {
    fontSize: 13,
    color: '#d1d5db',
    margin: 0,
    padding: '12px 16px',
    background: '#0d1117',
    lineHeight: 1.6,
  },
  guardianBox: {
    background: '#111827',
    border: '1px solid #1f2937',
    borderLeft: '3px solid #f97316',
    borderRadius: 12,
    padding: '16px 18px',
    marginBottom: 20,
  },
  guardianLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#f97316',
    letterSpacing: '0.1em',
    margin: '0 0 8px',
  },
  guardianText: {
    fontSize: 14,
    color: '#d1d5db',
    margin: 0,
    lineHeight: 1.7,
    fontStyle: 'italic',
  },
  ctaRow: { display: 'flex', gap: 10 },
};