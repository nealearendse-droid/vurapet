'use client';

import { useEffect, useState, useMemo } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type JournalEntry = {
  id: string;
  pet_id: string;
  date: string;
  appetite: string | null;
  energy_level: string | null;
  stool_quality: string | null;
  symptoms: string | null;
  vet_visit: boolean;
  vet_notes: string | null;
  notes: string | null;
  created_at: string;
};

/* ─────────────────────────────────────────────
   Health scoring logic
───────────────────────────────────────────── */
function scoreAppetite(v: string | null): number {
  if (!v) return 50;
  const map: Record<string, number> = { Good: 100, Reduced: 55, Poor: 20, None: 0 };
  return map[v] ?? 50;
}
function scoreEnergy(v: string | null): number {
  if (!v) return 50;
  const map: Record<string, number> = { High: 95, Normal: 100, Low: 40, Lethargic: 10 };
  return map[v] ?? 50;
}
function scoreStool(v: string | null): number {
  if (!v) return 50;
  const map: Record<string, number> = { Normal: 100, Soft: 65, Hard: 60, Diarrhea: 20, Blood: 0 };
  return map[v] ?? 50;
}

function getHealthScore(entry: JournalEntry): number {
  const base = Math.round(
    scoreAppetite(entry.appetite) * 0.35 +
    scoreEnergy(entry.energy_level) * 0.40 +
    scoreStool(entry.stool_quality) * 0.25
  );
  const penalty = entry.symptoms ? 12 : 0;
  return Math.max(0, Math.min(100, base - penalty));
}

function scoreColor(score: number): string {
  if (score >= 80) return '#f59e0b'; // amber — great
  if (score >= 60) return '#fbbf24'; // yellow — ok
  if (score >= 40) return '#fb923c'; // orange — concerning
  return '#f87171';                  // red — poor
}

function scoreLabel(score: number): string {
  if (score >= 85) return 'Thriving';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Fair';
  if (score >= 35) return 'Concerning';
  return 'Needs attention';
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function fmtDate(str: string) {
  return new Date(str).toLocaleDateString('en-ZA', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

function fmtShort(str: string) {
  return new Date(str).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
}

function calcStreak(entries: JournalEntry[]): number {
  if (!entries.length) return 0;
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (const e of sorted) {
    const d = new Date(e.date);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000);
    if (diff <= 1) { streak++; cursor = d; }
    else break;
  }
  return streak;
}

/* ─────────────────────────────────────────────
   Health Score Ring (SVG)
───────────────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
      <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease', filter: `drop-shadow(0 0 6px ${color}88)` }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 0,
      }}>
        <span style={{ fontSize: '1.3rem', fontWeight: 800, color, letterSpacing: '-0.04em', lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>score</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Mini Sparkline (last 7 scores)
───────────────────────────────────────────── */
function Sparkline({ scores }: { scores: number[] }) {
  if (scores.length < 2) return null;
  const w = 80, h = 28, pad = 3;
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;
  const pts = scores.map((s, i) => {
    const x = pad + (i / (scores.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (s - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  const lastScore = scores[scores.length - 1];
  const color = scoreColor(lastScore);
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      {scores.map((s, i) => {
        const x = pad + (i / (scores.length - 1)) * (w - pad * 2);
        const y = pad + (1 - (s - min) / range) * (h - pad * 2);
        return i === scores.length - 1
          ? <circle key={i} cx={x} cy={y} r="3" fill={color} />
          : null;
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Status chip
───────────────────────────────────────────── */
function StatusChip({ label, value }: { label: string; value: string | null }) {
  const score = label === 'Appetite' ? scoreAppetite(value)
    : label === 'Energy' ? scoreEnergy(value)
    : scoreStool(value);
  const color = scoreColor(score);
  const icon = label === 'Appetite' ? '🍽' : label === 'Energy' ? '⚡' : '💩';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 4,
      padding: '0.6rem 0.75rem',
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid rgba(255,255,255,0.07)`,
      borderRadius: 12, flex: 1,
    }}>
      <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{icon} {label}</div>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color }}>
        {value ?? '—'}
      </div>
      <div style={{ height: 3, borderRadius: 100, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 100, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function HealthJournal({ petId }: { petId: string }) {
  const supabase = createSupabaseBrowserClient();
  const [entries, setEntries]   = useState<JournalEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Form state
  const [date, setDate]               = useState(() => new Date().toISOString().slice(0, 10));
  const [appetite, setAppetite]       = useState('Good');
  const [energyLevel, setEnergyLevel] = useState('Normal');
  const [stoolQuality, setStoolQuality] = useState('Normal');
  const [symptoms, setSymptoms]       = useState('');
  const [vetVisit, setVetVisit]       = useState(false);
  const [vetNotes, setVetNotes]       = useState('');
  const [notes, setNotes]             = useState('');

  useEffect(() => { setMounted(true); }, []);

  async function loadEntries() {
    setLoading(true);
    const { data, error } = await supabase
      .from('health_journal')
      .select('*')
      .eq('pet_id', petId)
      .order('date', { ascending: false });
    if (!error) setEntries(data || []);
    setLoading(false);
  }

  useEffect(() => { if (petId) loadEntries(); }, [petId]);

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    setSaving(true);
    const { error } = await supabase.from('health_journal').insert({
      pet_id: petId, date, appetite, energy_level: energyLevel,
      stool_quality: stoolQuality, symptoms: symptoms.trim() || null,
      vet_visit: vetVisit, vet_notes: vetNotes.trim() || null,
      notes: notes.trim() || null,
    });
    setSaving(false);
    if (error) { console.error(error); return; }
    setDate(new Date().toISOString().slice(0, 10));
    setAppetite('Good'); setEnergyLevel('Normal'); setStoolQuality('Normal');
    setSymptoms(''); setVetVisit(false); setVetNotes(''); setNotes('');
    setShowForm(false);
    await loadEntries();
  }

  async function deleteEntry(id: string) {
    if (!confirm('Delete this journal entry?')) return;
    await supabase.from('health_journal').delete().eq('id', id);
    await loadEntries();
  }

  /* ── Derived ── */
  const streak = useMemo(() => calcStreak(entries), [entries]);
  const latestEntry = entries[0] ?? null;
  const latestScore = latestEntry ? getHealthScore(latestEntry) : null;

  const recentScores = useMemo(() =>
    [...entries].reverse().slice(-7).map(getHealthScore),
  [entries]);

  const hasRecentSymptoms = latestEntry?.symptoms;

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Lato:wght@300;400;700&display=swap');

        .hj-root {
          font-family: 'Lato', sans-serif;
          background: rgba(255,255,255,0.015);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          overflow: hidden;
          position: relative;
        }
        .hj-root::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(245,158,11,0.6), rgba(251,191,36,0.3), transparent);
        }

        /* Header */
        .hj-header {
          padding: 1.75rem 2rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 1rem;
        }
        .hj-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem; font-weight: 700;
          color: white; letter-spacing: -0.01em; margin-bottom: 2px;
        }
        .hj-subtitle { font-size: 0.78rem; color: rgba(255,255,255,0.3); }

        .hj-btn-primary {
          background: linear-gradient(135deg, #d97706, #b45309);
          border: none; border-radius: 10px;
          padding: 0.55rem 1.1rem;
          font-size: 0.8rem; font-weight: 700; color: white;
          cursor: pointer; font-family: 'Lato', sans-serif;
          box-shadow: 0 4px 14px rgba(217,119,6,0.3);
          transition: all 0.2s; white-space: nowrap; flex-shrink: 0;
          letter-spacing: 0.02em;
        }
        .hj-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(217,119,6,0.4); }

        /* Symptom alert */
        .hj-alert {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.85rem 2rem;
          background: rgba(248,113,113,0.05);
          border-bottom: 1px solid rgba(248,113,113,0.12);
          font-size: 0.82rem; color: #fca5a5; font-weight: 500;
        }
        .hj-alert-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #f87171; flex-shrink: 0;
          animation: hj-pulse 2s ease-in-out infinite;
        }
        @keyframes hj-pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.65); }
        }

        /* Summary strip */
        .hj-summary {
          display: flex; align-items: center; gap: 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .hj-summary-left {
          padding: 1.25rem 1.75rem;
          display: flex; align-items: center; gap: 1.25rem;
          flex: 1;
        }
        .hj-score-info { display: flex; flex-direction: column; gap: 3px; }
        .hj-score-label {
          font-family: 'Playfair Display', serif;
          font-size: 1rem; font-weight: 700; color: white;
        }
        .hj-score-sublabel { font-size: 0.72rem; color: rgba(255,255,255,0.3); }

        .hj-summary-divider {
          width: 1px; height: 60px;
          background: rgba(255,255,255,0.06);
        }

        .hj-stat-group {
          display: flex; align-items: stretch;
        }
        .hj-stat {
          padding: 1.1rem 1.4rem; text-align: center;
          border-left: 1px solid rgba(255,255,255,0.05);
          display: flex; flex-direction: column; gap: 3px;
          justify-content: center;
        }
        .hj-stat-num {
          font-size: 1.5rem; font-weight: 800;
          letter-spacing: -0.04em; line-height: 1;
          font-variant-numeric: tabular-nums;
        }
        .hj-stat-lbl {
          font-size: 0.62rem; font-weight: 700;
          color: rgba(255,255,255,0.22);
          text-transform: uppercase; letter-spacing: 0.09em;
        }

        /* Form */
        .hj-form-wrap {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(245,158,11,0.02);
          animation: hj-slide-down 0.2s ease;
        }
        @keyframes hj-slide-down {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hj-form-title {
          font-size: 0.68rem; font-weight: 700;
          color: rgba(255,255,255,0.22); text-transform: uppercase;
          letter-spacing: 0.1em; margin-bottom: 1rem;
        }
        .hj-form-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 0.75rem; margin-bottom: 0.75rem;
        }
        @media (max-width: 560px) { .hj-form-grid { grid-template-columns: 1fr; } }

        .hj-field label {
          display: block; font-size: 0.67rem; font-weight: 700;
          color: rgba(255,255,255,0.25); text-transform: uppercase;
          letter-spacing: 0.09em; margin-bottom: 0.35rem;
        }
        .hj-input, .hj-select, .hj-textarea {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 0.6rem 0.9rem;
          font-size: 0.85rem; font-weight: 400; color: white;
          outline: none; transition: all 0.2s;
          font-family: 'Lato', sans-serif;
        }
        .hj-select option { background: #1a1408; color: white; }
        .hj-textarea { resize: vertical; min-height: 70px; }
        .hj-input::placeholder, .hj-textarea::placeholder { color: rgba(255,255,255,0.18); }
        .hj-input:focus, .hj-select:focus, .hj-textarea:focus {
          border-color: rgba(245,158,11,0.4);
          background: rgba(245,158,11,0.04);
          box-shadow: 0 0 0 3px rgba(245,158,11,0.07);
        }
        .hj-input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.4); cursor: pointer; }

        .hj-checkbox-row {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem 0;
        }
        .hj-checkbox {
          width: 18px; height: 18px;
          accent-color: #d97706; cursor: pointer;
        }
        .hj-checkbox-label { font-size: 0.85rem; color: rgba(255,255,255,0.6); cursor: pointer; }

        .hj-form-actions { display: flex; gap: 0.6rem; margin-top: 0.75rem; }
        .hj-save-btn {
          flex: 1; background: linear-gradient(135deg, #d97706, #b45309);
          border: none; border-radius: 10px;
          padding: 0.75rem 1.5rem;
          font-size: 0.85rem; font-weight: 700; color: white;
          cursor: pointer; font-family: 'Lato', sans-serif;
          box-shadow: 0 4px 14px rgba(217,119,6,0.2);
          transition: all 0.2s; letter-spacing: 0.02em;
        }
        .hj-save-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .hj-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .hj-cancel-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 0.75rem 1.1rem;
          font-size: 0.85rem; font-weight: 600;
          color: rgba(255,255,255,0.3); cursor: pointer;
          font-family: 'Lato', sans-serif; transition: all 0.2s;
        }
        .hj-cancel-btn:hover { color: rgba(255,255,255,0.5); border-color: rgba(255,255,255,0.14); }

        /* Journal timeline */
        .hj-body { padding: 1.75rem 2rem; }
        .hj-timeline { position: relative; }
        .hj-timeline::before {
          content: '';
          position: absolute; left: 15px; top: 8px; bottom: 8px; width: 1px;
          background: linear-gradient(to bottom, rgba(245,158,11,0.3), rgba(245,158,11,0.05));
        }

        .hj-entry {
          display: flex; gap: 1.5rem;
          margin-bottom: 1.25rem;
          animation: hj-slide-down 0.3s ease;
        }

        .hj-entry-dot {
          width: 32px; height: 32px; border-radius: 50%;
          flex-shrink: 0; position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; margin-top: 2px;
          border: 1.5px solid;
        }

        .hj-entry-card {
          flex: 1;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; overflow: hidden;
          transition: border-color 0.2s;
          cursor: pointer;
        }
        .hj-entry-card:hover { border-color: rgba(255,255,255,0.12); }

        .hj-entry-top {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 0.9rem 1.25rem;
          gap: 0.75rem;
        }
        .hj-entry-date {
          font-size: 0.82rem; font-weight: 700;
          color: rgba(255,255,255,0.7);
        }
        .hj-entry-meta { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

        .hj-vet-badge {
          font-size: 0.65rem; font-weight: 700;
          padding: 3px 8px; border-radius: 100px;
          background: rgba(245,158,11,0.12);
          border: 1px solid rgba(245,158,11,0.25);
          color: #fbbf24; letter-spacing: 0.05em;
        }
        .hj-score-badge {
          font-size: 0.68rem; font-weight: 700;
          padding: 3px 9px; border-radius: 100px;
          border: 1px solid;
        }

        .hj-delete-btn {
          background: none; border: none; padding: 4px 8px;
          font-size: 0.72rem; color: rgba(255,255,255,0.2);
          cursor: pointer; transition: color 0.2s;
          font-family: 'Lato', sans-serif;
        }
        .hj-delete-btn:hover { color: #f87171; }

        .hj-chips {
          display: flex; gap: 0.5rem;
          padding: 0 1.25rem 1rem;
          flex-wrap: wrap;
        }

        .hj-entry-expanded {
          padding: 0 1.25rem 1.25rem;
          display: flex; flex-direction: column; gap: 0.6rem;
          animation: hj-slide-down 0.15s ease;
        }

        .hj-detail-box {
          padding: 0.7rem 1rem;
          border-radius: 10px;
          font-size: 0.8rem; line-height: 1.55;
        }
        .hj-detail-label {
          font-size: 0.63rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 4px;
        }

        .hj-empty {
          padding: 3.5rem 2rem; text-align: center;
          color: rgba(255,255,255,0.2); font-size: 0.88rem;
        }
        .hj-empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; opacity: 0.3; }

        .hj-loading { padding: 2rem; text-align: center; color: rgba(255,255,255,0.2); font-size: 0.85rem; }
      `}</style>

      <div className="hj-root">

        {/* Header */}
        <div className="hj-header">
          <div>
            <div className="hj-title">📓 Health Journal</div>
            <div className="hj-subtitle">Daily observations · symptoms · vet visits</div>
          </div>
          <button className="hj-btn-primary" onClick={() => setShowForm(f => !f)}>
            {showForm ? '✕ Cancel' : '+ New entry'}
          </button>
        </div>

        {/* Symptom alert */}
        {hasRecentSymptoms && (
          <div className="hj-alert">
            <div className="hj-alert-dot" />
            <span>Latest entry has symptoms noted — keep an eye on it</span>
          </div>
        )}

        {/* Summary strip */}
        {!loading && entries.length > 0 && latestScore !== null && (
          <div className="hj-summary">
            <div className="hj-summary-left">
              <ScoreRing score={latestScore} />
              <div className="hj-score-info">
                <div className="hj-score-label">{scoreLabel(latestScore)}</div>
                <div className="hj-score-sublabel">Latest health score</div>
                {recentScores.length >= 2 && (
                  <div style={{ marginTop: 6 }}>
                    <Sparkline scores={recentScores} />
                  </div>
                )}
              </div>
            </div>
            <div className="hj-stat-group">
              <div className="hj-stat">
                <div className="hj-stat-num" style={{ color: streak > 0 ? '#f59e0b' : 'rgba(255,255,255,0.35)' }}>
                  {streak}
                </div>
                <div className="hj-stat-lbl">Day streak</div>
              </div>
              <div className="hj-stat">
                <div className="hj-stat-num" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {entries.length}
                </div>
                <div className="hj-stat-lbl">Total logs</div>
              </div>
              <div className="hj-stat">
                <div className="hj-stat-num" style={{ color: '#fbbf24' }}>
                  {entries.filter(e => e.vet_visit).length}
                </div>
                <div className="hj-stat-lbl">Vet visits</div>
              </div>
            </div>
          </div>
        )}

        {/* Add entry form */}
        {showForm && (
          <div className="hj-form-wrap">
            <div className="hj-form-title">New journal entry</div>
            <form onSubmit={addEntry}>
              <div className="hj-form-grid">
                <div className="hj-field">
                  <label>Date</label>
                  <input className="hj-input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div className="hj-field">
                  <label>Appetite</label>
                  <select className="hj-select" value={appetite} onChange={e => setAppetite(e.target.value)}>
                    <option value="Good">😋 Good — eating normally</option>
                    <option value="Reduced">😐 Reduced — eating less</option>
                    <option value="Poor">😟 Poor — barely eating</option>
                    <option value="None">🚫 None — not eating</option>
                  </select>
                </div>
                <div className="hj-field">
                  <label>Energy level</label>
                  <select className="hj-select" value={energyLevel} onChange={e => setEnergyLevel(e.target.value)}>
                    <option value="High">⚡ High — very active</option>
                    <option value="Normal">✅ Normal — usual activity</option>
                    <option value="Low">😴 Low — more tired</option>
                    <option value="Lethargic">🛌 Lethargic — barely moving</option>
                  </select>
                </div>
                <div className="hj-field">
                  <label>Stool quality</label>
                  <select className="hj-select" value={stoolQuality} onChange={e => setStoolQuality(e.target.value)}>
                    <option value="Normal">✅ Normal</option>
                    <option value="Soft">🟡 Soft</option>
                    <option value="Diarrhea">🔴 Diarrhea</option>
                    <option value="Hard">🟡 Hard / Constipated</option>
                    <option value="Blood">🚨 Blood present</option>
                  </select>
                </div>
                <div className="hj-field" style={{ gridColumn: 'span 2' }}>
                  <label>Symptoms (optional)</label>
                  <textarea className="hj-textarea"
                    placeholder="e.g. Vomiting once this morning, slight limp on left back leg…"
                    value={symptoms} onChange={e => setSymptoms(e.target.value)} />
                </div>
              </div>

              <div className="hj-checkbox-row">
                <input className="hj-checkbox" type="checkbox" id="hj-vet"
                  checked={vetVisit} onChange={e => setVetVisit(e.target.checked)} />
                <label className="hj-checkbox-label" htmlFor="hj-vet">🏥 This was a vet visit day</label>
              </div>

              {vetVisit && (
                <div className="hj-field" style={{ marginBottom: '0.75rem' }}>
                  <label>Vet notes</label>
                  <textarea className="hj-textarea"
                    placeholder="What did the vet say? Diagnoses, prescriptions, follow-ups…"
                    value={vetNotes} onChange={e => setVetNotes(e.target.value)} />
                </div>
              )}

              <div className="hj-field" style={{ marginBottom: '0.75rem' }}>
                <label>Other notes (optional)</label>
                <textarea className="hj-textarea"
                  placeholder="Anything else you noticed today…"
                  value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              <div className="hj-form-actions">
                <button className="hj-cancel-btn" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="hj-save-btn" type="submit" disabled={saving}>
                  {saving ? 'Saving…' : '📓 Save journal entry'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Journal timeline */}
        <div className="hj-body">
          {loading ? (
            <div className="hj-loading">Loading journal…</div>
          ) : entries.length === 0 ? (
            <div className="hj-empty">
              <span className="hj-empty-icon">📓</span>
              No entries yet.<br />Start logging your pet's daily health above.
            </div>
          ) : (
            <div className="hj-timeline">
              {entries.map(entry => {
                const score = getHealthScore(entry);
                const color = scoreColor(score);
                const isExpanded = expanded === entry.id;
                const hasExtra = entry.symptoms || entry.vet_notes || entry.notes;

                return (
                  <div key={entry.id} className="hj-entry">
                    {/* Timeline dot */}
                    <div className="hj-entry-dot" style={{
                      background: `${color}14`,
                      borderColor: `${color}40`,
                      color,
                    }}>
                      {entry.vet_visit ? '🏥' : score >= 75 ? '✓' : score >= 50 ? '~' : '!'}
                    </div>

                    {/* Card */}
                    <div className="hj-entry-card" onClick={() => setExpanded(isExpanded ? null : entry.id)}>
                      {/* Top row */}
                      <div className="hj-entry-top">
                        <div className="hj-entry-date">{fmtDate(entry.date)}</div>
                        <div className="hj-entry-meta">
                          {entry.vet_visit && <span className="hj-vet-badge">🏥 Vet visit</span>}
                          <span className="hj-score-badge" style={{
                            color, background: `${color}12`, borderColor: `${color}30`,
                          }}>
                            {scoreLabel(score)} · {score}
                          </span>
                          <button className="hj-delete-btn" onClick={ev => { ev.stopPropagation(); deleteEntry(entry.id); }}>
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Status chips */}
                      <div className="hj-chips">
                        <StatusChip label="Appetite" value={entry.appetite} />
                        <StatusChip label="Energy" value={entry.energy_level} />
                        <StatusChip label="Stool" value={entry.stool_quality} />
                      </div>

                      {/* Expanded details */}
                      {isExpanded && hasExtra && (
                        <div className="hj-entry-expanded">
                          {entry.symptoms && (
                            <div className="hj-detail-box" style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
                              <div className="hj-detail-label" style={{ color: '#fca5a5' }}>⚠️ Symptoms</div>
                              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem' }}>{entry.symptoms}</div>
                            </div>
                          )}
                          {entry.vet_notes && (
                            <div className="hj-detail-box" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                              <div className="hj-detail-label" style={{ color: '#fbbf24' }}>🏥 Vet notes</div>
                              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem' }}>{entry.vet_notes}</div>
                            </div>
                          )}
                          {entry.notes && (
                            <div className="hj-detail-box" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                              <div className="hj-detail-label" style={{ color: 'rgba(255,255,255,0.3)' }}>📝 Notes</div>
                              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem' }}>{entry.notes}</div>
                            </div>
                          )}
                        </div>
                      )}
                      {isExpanded && !hasExtra && (
                        <div style={{ padding: '0 1.25rem 1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>
                          No additional notes for this entry.
                        </div>
                      )}
                      {!isExpanded && hasExtra && (
                        <div style={{ padding: '0 1.25rem 0.85rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>
                          Tap to see notes ↓
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}