'use client';

import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  ComposedChart, Line, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';

type WeightEntry = {
  id: string;
  pet_id: string;
  recorded_at: string;
  weight_kg: number;
  notes?: string | null;
};

type PetInfo = {
  name: string;
  species: 'dog' | 'cat' | string;
  breed?: string;
  date_of_birth?: string;
};

type Props = {
  petId: string;
  petInfo?: PetInfo;
  onLatestWeightChange?: (w: number | null) => void;
};

const BREED_RANGES: Record<string, [number, number]> = {
  'Labrador Retriever': [25, 36], 'Golden Retriever': [25, 34],
  'German Shepherd': [22, 40], 'Bulldog': [18, 25], 'Beagle': [9, 11],
  'Poodle (Standard)': [20, 32], 'Rottweiler': [35, 60], 'Dachshund': [7, 15],
  'Chihuahua': [1.8, 2.7], 'Yorkshire Terrier': [2, 3.2],
  'Boxer': [25, 32], 'Husky': [16, 27], 'Maltese': [1.8, 3],
  'Shih Tzu': [4, 7.2], 'Border Collie': [14, 22],
  'Domestic Shorthair': [3.5, 5.5], 'Maine Coon': [4, 8],
  'Siamese': [3.5, 5], 'Persian': [3.5, 5.5], 'Ragdoll': [4.5, 9],
  'Bengal': [3.5, 6.5], 'British Shorthair': [4, 8],
  'Abyssinian': [3, 5], 'Scottish Fold': [2.7, 6],
};

function estimateBCS(weight: number, idealMin: number, idealMax: number): number {
  const ideal = (idealMin + idealMax) / 2;
  const ratio = weight / ideal;
  if (ratio < 0.75) return 1;
  if (ratio < 0.85) return 2;
  if (ratio < 0.92) return 3;
  if (ratio < 0.97) return 4;
  if (ratio <= 1.03) return 5;
  if (ratio <= 1.1) return 6;
  if (ratio <= 1.2) return 7;
  if (ratio <= 1.35) return 8;
  return 9;
}

const BCS_LABELS: Record<number, { label: string; color: string; emoji: string }> = {
  1: { label: 'Severely underweight', color: '#f87171', emoji: '⚠️' },
  2: { label: 'Very thin', color: '#fb923c', emoji: '⚠️' },
  3: { label: 'Thin', color: '#fbbf24', emoji: '📉' },
  4: { label: 'Slightly lean', color: '#a3e635', emoji: '👍' },
  5: { label: 'Ideal weight', color: '#34d399', emoji: '🌟' },
  6: { label: 'Slightly overweight', color: '#a3e635', emoji: '👍' },
  7: { label: 'Overweight', color: '#fbbf24', emoji: '📈' },
  8: { label: 'Obese', color: '#fb923c', emoji: '⚠️' },
  9: { label: 'Severely obese', color: '#f87171', emoji: '⚠️' },
};

function fmtDate(str: string) {
  return new Date(str).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
}

function linearRegression(points: { x: number; y: number }[]) {
  const n = points.length;
  if (n < 2) return null;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function generateHealthInsight(
  petName: string,
  species: string,
  breed: string | undefined,
  weights: WeightEntry[],
  goalWeight: number | null,
  idealRange: [number, number] | null,
): string {
  if (weights.length < 1) return '';
  const sorted = [...weights].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
  const latest = sorted[sorted.length - 1];
  const oldest = sorted[0];
  const current = latest.weight_kg;
  const totalChange = current - oldest.weight_kg;
  const weeks = Math.max(1, Math.round(
    (new Date(latest.recorded_at).getTime() - new Date(oldest.recorded_at).getTime()) / (1000 * 60 * 60 * 24 * 7)
  ));
  const weeklyRate = totalChange / weeks;
  const name = petName ?? 'Your pet';
  const parts: string[] = [];

  if (idealRange) {
    const [minW, maxW] = idealRange;
    const ideal = (minW + maxW) / 2;
    const pctFromIdeal = ((current - ideal) / ideal) * 100;
    if (current < minW) {
      parts.push(`${name} is currently ${(minW - current).toFixed(1)} kg below the healthy range for ${breed ? `a ${breed}` : `a ${species}`} (${minW}–${maxW} kg). A vet check is recommended.`);
    } else if (current > maxW) {
      parts.push(`${name} is ${(current - maxW).toFixed(1)} kg (${Math.abs(pctFromIdeal).toFixed(0)}%) above the healthy range for ${breed ? `a ${breed}` : `a ${species}`} (${minW}–${maxW} kg). Consider reducing portions by 10–15%.`);
    } else {
      parts.push(`Great news — ${name} is within the healthy weight range for ${breed ? `a ${breed}` : `a ${species}`} (${minW}–${maxW} kg). Keep up the excellent care! 🌟`);
    }
  }

  if (weights.length >= 2) {
    const absDiff = Math.abs(totalChange);
    const direction = totalChange > 0 ? 'gained' : 'lost';
    const sign = totalChange > 0 ? '+' : '';
    parts.push(`Over ${weeks} week${weeks !== 1 ? 's' : ''}, ${name} has ${direction} ${absDiff.toFixed(2)} kg (${sign}${weeklyRate.toFixed(2)} kg/week).`);
  }

  if (goalWeight !== null) {
    const toGo = goalWeight - current;
    if (Math.abs(toGo) <= 0.2) {
      parts.push(`🎉 ${name} has reached the goal weight of ${goalWeight} kg!`);
    } else if (toGo > 0) {
      parts.push(`${name} is ${toGo.toFixed(1)} kg away from the goal weight of ${goalWeight} kg — keep going!`);
    } else {
      parts.push(`${name} is ${Math.abs(toGo).toFixed(1)} kg below the goal weight of ${goalWeight} kg.`);
    }
  }

  if (parts.length === 0) {
    parts.push(`${name}'s current weight is ${current} kg. Log more entries to track the trend.`);
  }

  return parts.join(' ');
}

function getMilestones(entries: WeightEntry[], goal: number | null): string[] {
  if (entries.length < 2) return [];
  const sorted = [...entries].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
  const latest = sorted[sorted.length - 1].weight_kg;
  const first = sorted[0].weight_kg;
  const diff = latest - first;
  const badges: string[] = [];
  if (Math.abs(diff) >= 0.5 && diff < 0) badges.push(`Lost ${Math.abs(diff).toFixed(1)} kg total 💪`);
  if (Math.abs(diff) >= 0.5 && diff > 0) badges.push(`Gained ${diff.toFixed(1)} kg total 📈`);
  if (entries.length >= 5) badges.push('5 weigh-ins logged 🏅');
  if (entries.length >= 10) badges.push('10 weigh-ins — dedicated owner! ⭐');
  if (goal && Math.abs(latest - goal) <= 0.2) badges.push('Goal weight reached! 🎉');
  return badges;
}

function BCSGauge({ score }: { score: number }) {
  const info = BCS_LABELS[score];
  const pct = ((score - 1) / 8) * 100;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 600 }}>Body Condition</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 8, borderRadius: 100, background: 'linear-gradient(90deg, #f87171, #fbbf24, #34d399, #fbbf24, #f87171)', position: 'relative' }}>
          <div style={{ position: 'absolute', left: `calc(${pct}% - 8px)`, top: -4, width: 16, height: 16, borderRadius: '50%', background: info.color, border: '2.5px solid rgba(0,0,0,0.5)' }} />
        </div>
        <div style={{ fontSize: '0.75rem', color: info.color, fontWeight: 700, whiteSpace: 'nowrap' }}>{info.emoji} BCS {score}/9</div>
      </div>
      <div style={{ fontSize: '0.75rem', color: info.color }}>{info.label}</div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const w = payload.find((p: any) => p.dataKey === 'weight_kg');
  const proj = payload.find((p: any) => p.dataKey === 'projected');
  return (
    <div style={{ background: 'rgba(10,12,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontSize: '0.72rem' }}>{label}</div>
      {w && <div style={{ color: '#60a5fa', fontWeight: 700 }}>{w.value} kg <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>recorded</span></div>}
      {proj && <div style={{ color: 'rgba(147,197,253,0.5)', fontWeight: 600, fontStyle: 'italic' }}>{proj.value} kg <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>projected</span></div>}
    </div>
  );
}

export default function WeightTracker({ petId, petInfo, onLatestWeightChange }: Props) {
  const supabase = createSupabaseBrowserClient();

  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'log'>('chart');
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newNotes, setNewNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [goalWeight, setGoalWeight] = useState<number | null>(null);
  const [goalInput, setGoalInput] = useState('');
  const [showGoal, setShowGoal] = useState(false);
  const [selectedBreed, setBreed] = useState(petInfo?.breed ?? '');

  useEffect(() => { setMounted(true); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('weight_entries')
      .select('*')
      .eq('pet_id', petId)
      .order('recorded_at', { ascending: true });
    if (error) console.error('Load error:', error);
    const rows = (data || []) as WeightEntry[];
    setEntries(rows);
    const latest = rows.length ? rows[rows.length - 1].weight_kg : null;
    onLatestWeightChange?.(latest);
    setLoading(false);
  }

  useEffect(() => { load(); }, [petId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const w = parseFloat(newWeight);
    if (!w || !newDate) return;
    setSaving(true);
   const { error } = await supabase.from('weight_entries').insert({
  pet_id: petId,
  weight_kg: w,
  recorded_at: newDate,
  date: newDate,
  notes: newNotes || null,
});
    if (error) console.error('Save error:', error);
    setSaving(false);
    setNewWeight('');
    setNewNotes('');
    setShowForm(false);
    await load();
  }

  const sorted = useMemo(() =>
    [...entries].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at)), [entries]);

  const idealRange: [number, number] | null = useMemo(() =>
    selectedBreed ? BREED_RANGES[selectedBreed] ?? null : null, [selectedBreed]);

  const latestWeight = sorted.length ? sorted[sorted.length - 1].weight_kg : null;
  const firstWeight = sorted.length ? sorted[0].weight_kg : null;
  const totalChange = latestWeight !== null && firstWeight !== null ? latestWeight - firstWeight : null;
  const avgWeight = sorted.length ? sorted.reduce((s, e) => s + e.weight_kg, 0) / sorted.length : null;

  const chartData = useMemo(() => {
    if (sorted.length < 2) return sorted.map(e => ({ label: fmtDate(e.recorded_at), weight_kg: e.weight_kg }));
    const pts = sorted.map((e, i) => ({ x: i, y: e.weight_kg }));
    const reg = linearRegression(pts);
    const base = sorted.map((e, i) => ({
      label: fmtDate(e.recorded_at),
      weight_kg: e.weight_kg,
      projected: undefined as number | undefined,
    }));
    if (!reg) return base;
    const lastDate = new Date(sorted[sorted.length - 1].recorded_at);
    for (let i = 1; i <= 4; i++) {
      const d = new Date(lastDate);
      d.setDate(d.getDate() + i * 7);
      base.push({
        label: fmtDate(d.toISOString().slice(0, 10)),
        weight_kg: undefined as any,
        projected: parseFloat((reg.slope * (sorted.length - 1 + i) + reg.intercept).toFixed(2)),
      });
    }
    return base;
  }, [sorted]);

  const bcs = latestWeight && idealRange ? estimateBCS(latestWeight, idealRange[0], idealRange[1]) : null;
  const milestones = getMilestones(sorted, goalWeight);

  const weeksToGoal = useMemo(() => {
    if (!goalWeight || !latestWeight || sorted.length < 2) return null;
    const pts = sorted.map((e, i) => ({ x: i, y: e.weight_kg }));
    const reg = linearRegression(pts);
    if (!reg || Math.abs(reg.slope) < 0.001) return null;
    const weeksNeeded = (goalWeight - latestWeight) / reg.slope;
    return weeksNeeded > 0 ? Math.ceil(weeksNeeded) : null;
  }, [goalWeight, latestWeight, sorted]);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        .wt-root { font-family: 'DM Sans', sans-serif; background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.07); border-radius: 24px; overflow: hidden; position: relative; }
        .wt-header { padding: 1.75rem 2rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
        .wt-title { font-size: 1.25rem; font-weight: 800; color: white; letter-spacing: -0.03em; margin-bottom: 2px; }
        .wt-subtitle { font-size: 0.78rem; color: rgba(255,255,255,0.3); }
        .wt-header-btns { display: flex; gap: 0.5rem; flex-shrink: 0; }
        .wt-btn-primary { background: linear-gradient(135deg, #3b82f6, #7c3aed); border: none; border-radius: 10px; padding: 0.55rem 1.1rem; font-size: 0.8rem; font-weight: 700; color: white; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .wt-btn-ghost { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.55rem 0.9rem; font-size: 0.8rem; font-weight: 600; color: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.2s; }
        .wt-stats { display: grid; grid-template-columns: repeat(4, 1fr); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .wt-stat { padding: 1.1rem 1.25rem; text-align: center; border-right: 1px solid rgba(255,255,255,0.05); }
        .wt-stat:last-child { border-right: none; }
        .wt-stat-num { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.04em; line-height: 1; margin-bottom: 3px; }
        .wt-stat-lbl { font-size: 0.62rem; font-weight: 700; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 0.09em; }
        .wt-tabs { display: flex; padding: 0 2rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .wt-tab { padding: 0.85rem 1rem 0.7rem; font-size: 0.8rem; font-weight: 600; color: rgba(255,255,255,0.28); cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; background: none; border-top: none; border-left: none; border-right: none; }
        .wt-tab.active { color: #60a5fa; border-bottom-color: #60a5fa; }
        .wt-body { padding: 1.75rem 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .wt-form-wrap { padding: 1.5rem 2rem; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(59,130,246,0.02); }
        .wt-form-row { display: flex; gap: 0.75rem; align-items: flex-end; flex-wrap: wrap; }
        .wt-field label { display: block; font-size: 0.67rem; font-weight: 700; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.09em; margin-bottom: 0.35rem; }
        .wt-input { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.6rem 0.9rem; font-size: 0.85rem; font-weight: 500; color: white; outline: none; transition: all 0.2s; }
        .wt-input:focus { border-color: rgba(96,165,250,0.4); }
        .wt-input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.4); cursor: pointer; }
        .wt-chart-wrap { background: rgba(0,0,0,0.15); border-radius: 16px; padding: 1rem 0.5rem 0.5rem; border: 1px solid rgba(255,255,255,0.04); }
        .wt-bcs-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 1.25rem 1.5rem; }
        .wt-ai-card { background: linear-gradient(135deg, rgba(59,130,246,0.06), rgba(124,58,237,0.06)); border: 1px solid rgba(96,165,250,0.15); border-radius: 16px; padding: 1.25rem 1.5rem; }
        .wt-ai-label { font-size: 0.65rem; font-weight: 700; color: rgba(96,165,250,0.7); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem; }
        .wt-ai-text { font-size: 0.88rem; line-height: 1.65; color: rgba(255,255,255,0.75); }
        .wt-milestones { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .wt-badge { font-size: 0.75rem; font-weight: 600; padding: 4px 12px; border-radius: 100px; background: rgba(96,165,250,0.1); border: 1px solid rgba(96,165,250,0.2); color: rgba(147,197,253,0.9); }
        .wt-log-item { display: flex; align-items: center; justify-content: space-between; padding: 0.7rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .wt-log-item:last-child { border-bottom: none; }
        .wt-log-date { font-size: 0.8rem; color: rgba(255,255,255,0.35); }
        .wt-log-weight { font-size: 1rem; font-weight: 700; color: #60a5fa; }
        .wt-log-delta { font-size: 0.75rem; }
        .wt-log-notes { font-size: 0.72rem; color: rgba(255,255,255,0.25); margin-top: 1px; }
        .wt-breed-select { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.55rem 0.9rem; font-size: 0.82rem; font-weight: 500; color: white; outline: none; cursor: pointer; }
        .wt-breed-select option { background: #0f1117; }
        .wt-section-label { font-size: 0.67rem; font-weight: 700; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem; }
        .wt-empty { padding: 3rem 2rem; text-align: center; color: rgba(255,255,255,0.2); font-size: 0.88rem; }
        .wt-empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; opacity: 0.3; }
        .wt-loading { padding: 2rem; text-align: center; color: rgba(255,255,255,0.2); font-size: 0.85rem; }
      `}</style>

      <div className="wt-root">
        <div className="wt-header">
          <div>
            <div className="wt-title">⚖️ Weight Intelligence</div>
            <div className="wt-subtitle">Track · analyse · predict</div>
          </div>
          <div className="wt-header-btns">
            <button className="wt-btn-ghost" onClick={() => setShowGoal(g => !g)}>🎯 Goal</button>
            <button className="wt-btn-primary" onClick={() => setShowForm(f => !f)}>
              {showForm ? '✕' : '+ Log weight'}
            </button>
          </div>
        </div>

        {!loading && entries.length > 0 && latestWeight !== null && (
          <div className="wt-stats">
            <div className="wt-stat">
              <div className="wt-stat-num" style={{ color: '#60a5fa' }}>{latestWeight.toFixed(1)}<span style={{ fontSize: '0.9rem' }}> kg</span></div>
              <div className="wt-stat-lbl">Current</div>
            </div>
            <div className="wt-stat">
              <div className="wt-stat-num" style={{ color: totalChange === null ? 'white' : totalChange > 0 ? '#f97316' : '#34d399' }}>
                {totalChange !== null ? `${totalChange > 0 ? '+' : ''}${totalChange.toFixed(2)}` : '—'}<span style={{ fontSize: '0.9rem' }}> kg</span>
              </div>
              <div className="wt-stat-lbl">Total change</div>
            </div>
            <div className="wt-stat">
              <div className="wt-stat-num" style={{ color: 'rgba(255,255,255,0.6)' }}>{avgWeight?.toFixed(1) ?? '—'}<span style={{ fontSize: '0.9rem' }}> kg</span></div>
              <div className="wt-stat-lbl">Average</div>
            </div>
            <div className="wt-stat">
              <div className="wt-stat-num" style={{ color: 'rgba(255,255,255,0.6)' }}>{entries.length}</div>
              <div className="wt-stat-lbl">Entries</div>
            </div>
          </div>
        )}

        {showForm && (
          <form className="wt-form-wrap" onSubmit={handleSave}>
            <div className="wt-section-label">New weight entry</div>
            <div className="wt-form-row">
              <div className="wt-field">
                <label>Weight (kg)</label>
                <input className="wt-input" style={{ width: 110 }} type="number" step="0.01" min="0.1" max="200"
                  placeholder="e.g. 12.5" value={newWeight} onChange={e => setNewWeight(e.target.value)} required />
              </div>
              <div className="wt-field">
                <label>Date</label>
                <input className="wt-input" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required />
              </div>
              <div className="wt-field" style={{ flex: 1, minWidth: 140 }}>
                <label>Notes (optional)</label>
                <input className="wt-input" style={{ width: '100%' }} placeholder="After grooming, vet visit…"
                  value={newNotes} onChange={e => setNewNotes(e.target.value)} />
              </div>
              <button className="wt-btn-primary" type="submit" disabled={saving} style={{ marginBottom: 1 }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        )}

        {showGoal && (
          <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(124,58,237,0.02)' }}>
            <div className="wt-section-label">Settings</div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="wt-field">
                <label>Target weight (kg)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="wt-input" style={{ width: 110 }} type="number" step="0.1" min="0.5" max="200"
                    placeholder="e.g. 28.0" value={goalInput} onChange={e => setGoalInput(e.target.value)} />
                  <button className="wt-btn-primary" type="button" onClick={() => setGoalWeight(parseFloat(goalInput) || null)}>Set</button>
                </div>
              </div>
              <div className="wt-field">
                <label>Breed (for healthy range)</label>
                <select className="wt-breed-select" value={selectedBreed} onChange={e => setBreed(e.target.value)}>
                  <option value="">— select breed —</option>
                  <optgroup label="Dogs">
                    {['Labrador Retriever','Golden Retriever','German Shepherd','Bulldog','Beagle','Poodle (Standard)','Rottweiler','Dachshund','Chihuahua','Yorkshire Terrier','Boxer','Husky','Maltese','Shih Tzu','Border Collie'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Cats">
                    {['Domestic Shorthair','Maine Coon','Siamese','Persian','Ragdoll','Bengal','British Shorthair','Abyssinian','Scottish Fold'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="wt-tabs">
          <button className={`wt-tab ${activeTab === 'chart' ? 'active' : ''}`} onClick={() => setActiveTab('chart')}>Analytics</button>
          <button className={`wt-tab ${activeTab === 'log' ? 'active' : ''}`} onClick={() => setActiveTab('log')}>History</button>
        </div>

        <div className="wt-body">
          {loading ? (
            <div className="wt-loading">Loading weight data…</div>
          ) : entries.length === 0 ? (
            <div className="wt-empty">
              <span className="wt-empty-icon">⚖️</span>
              No weight entries yet.<br />Log the first one above!
            </div>
          ) : activeTab === 'chart' ? (
            <>
              <div>
                <div className="wt-section-label">Weight trend + 30-day projection</div>
                <div className="wt-chart-wrap">
                  <ResponsiveContainer width="100%" height={230}>
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="wtBlue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                      <Tooltip content={<CustomTooltip />} />
                      {idealRange && (
                        <>
                          <ReferenceLine y={idealRange[0]} stroke="rgba(52,211,153,0.25)" strokeDasharray="4 3" label={{ value: 'Min ideal', fill: 'rgba(52,211,153,0.4)', fontSize: 10 }} />
                          <ReferenceLine y={idealRange[1]} stroke="rgba(52,211,153,0.25)" strokeDasharray="4 3" label={{ value: 'Max ideal', fill: 'rgba(52,211,153,0.4)', fontSize: 10 }} />
                        </>
                      )}
                      {goalWeight && <ReferenceLine y={goalWeight} stroke="rgba(251,191,36,0.5)" strokeDasharray="6 3" label={{ value: `Goal ${goalWeight}kg`, fill: 'rgba(251,191,36,0.7)', fontSize: 10, position: 'right' }} />}
                      <Area type="monotone" dataKey="weight_kg" stroke="none" fill="url(#wtBlue)" connectNulls={false} />
                      <Line type="monotone" dataKey="weight_kg" stroke="#3b82f6" strokeWidth={2.5}
                        dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: 'rgba(0,0,0,0.4)' }}
                        activeDot={{ r: 6, fill: '#60a5fa' }} connectNulls={false} isAnimationActive />
                      <Line type="monotone" dataKey="projected" stroke="rgba(147,197,253,0.4)" strokeWidth={1.5}
                        strokeDasharray="5 4" dot={{ fill: 'rgba(147,197,253,0.3)', r: 3, strokeWidth: 0 }}
                        connectNulls isAnimationActive={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {bcs && (
                <div className="wt-bcs-card">
                  <BCSGauge score={bcs} />
                  {idealRange && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>
                      Healthy range for {selectedBreed}: {idealRange[0]}–{idealRange[1]} kg
                      {weeksToGoal !== null && goalWeight !== null && (
                        <span style={{ marginLeft: 12, color: 'rgba(251,191,36,0.6)' }}>· ~{weeksToGoal} week{weeksToGoal !== 1 ? 's' : ''} to reach {goalWeight} kg goal</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {milestones.length > 0 && (
                <div>
                  <div className="wt-section-label">Milestones</div>
                  <div className="wt-milestones">
                    {milestones.map(m => <div key={m} className="wt-badge">{m}</div>)}
                  </div>
                </div>
              )}

              {entries.length >= 1 && (
                <div className="wt-ai-card">
                  <div className="wt-ai-label"><span>✦</span> Health Insight</div>
                  <div className="wt-ai-text">
                    {generateHealthInsight(petInfo?.name ?? 'Your pet', petInfo?.species ?? 'pet', selectedBreed || petInfo?.breed, entries, goalWeight, idealRange)}
                  </div>
                  {!idealRange && <div style={{ marginTop: '0.6rem', fontSize: '0.72rem', color: 'rgba(96,165,250,0.4)' }}>💡 Set a breed in Goal settings for breed-specific analysis</div>}
                </div>
              )}
            </>
          ) : (
            <div>
              <div className="wt-section-label">All entries — newest first</div>
              {[...sorted].reverse().map((entry, i, arr) => {
                const prev = arr[i + 1];
                const delta = prev ? entry.weight_kg - prev.weight_kg : null;
                return (
                  <div key={entry.id} className="wt-log-item">
                    <div>
                      <div className="wt-log-date">{fmtDate(entry.recorded_at)}</div>
                      {entry.notes && <div className="wt-log-notes">{entry.notes}</div>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="wt-log-weight">{entry.weight_kg.toFixed(2)} kg</div>
                      {delta !== null && (
                        <div className="wt-log-delta" style={{ color: delta > 0 ? '#f97316' : delta < 0 ? '#34d399' : 'rgba(255,255,255,0.25)' }}>
                          {delta > 0 ? '+' : ''}{delta.toFixed(2)} kg
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