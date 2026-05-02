'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';
import WeightTracker from '@/components/WeightTracker';
import NutritionArchitect from '@/components/NutritionArchitect';
import VaccineCalendar from '@/components/VaccineCalendar';
import WellnessScore from '@/components/WellnessScore';
import HealthJournal from '@/components/HealthJournal';
import MemoryBook from '@/components/MemoryBook';
import GuardianSystem from '@/components/GuardianSystem';
import SymptomChecker from '@/components/SymptomChecker';
import WellnessPassport from '@/components/WellnessPassport';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcAge(dob?: string): string {
  if (!dob) return '';
  const diff = Date.now() - new Date(dob).getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  if (years < 1) {
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.4));
    return `${months}mo`;
  }
  return `${years}yr`;
}

function petEmoji(species?: string): string {
  if (!species) return '🐾';
  const s = species.toLowerCase();
  if (s.includes('dog')) return '🐕';
  if (s.includes('cat')) return '🐈';
  if (s.includes('bird')) return '🦜';
  if (s.includes('fish')) return '🐠';
  return '🐾';
}

// ─── Care Profile Tab ─────────────────────────────────────────────────────────

function CareProfileTab({ pet, petId, onSaved }: { pet: any; petId: string; onSaved: (updated: any) => void }) {
  const supabase = getSupabaseClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    feeding_schedule:        pet.feeding_schedule || '',
    feeding_instructions:    pet.feeding_instructions || '',
    do_not_feed:             pet.do_not_feed || '',
    medication_instructions: pet.medication_instructions || '',
    daily_routine:           pet.daily_routine || '',
    behaviour_notes:         pet.behaviour_notes || '',
    warning_signs:           pet.warning_signs || '',
    emergency_steps:         pet.emergency_steps || '',
    primary_vet:             pet.primary_vet || '',
    vet_clinic:              pet.vet_clinic || '',
    vet_phone:               pet.vet_phone || '',
    emergency_vet:           pet.emergency_vet || '',
  });

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value })),
  });

  const handleSave = async () => {
    setSaving(true);
    const { data, error } = await supabase
      .from('pets').update(form).eq('id', petId).select().single();
    setSaving(false);
    if (!error && data) {
      onSaved(data);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const Section = ({ emoji, title, accent, children }: {
    emoji: string; title: string; accent: string; children: React.ReactNode;
  }) => (
    <div className="cp-section" style={{ borderLeftColor: accent }}>
      <div className="cp-section-header">
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <h3 className="cp-section-title" style={{ color: accent }}>{title}</h3>
      </div>
      {children}
    </div>
  );

  const ViewField = ({ label, value, danger }: { label: string; value?: string; danger?: boolean }) => (
    <div className={`cp-view-field ${danger ? 'cp-field-danger' : ''}`}>
      <p className="cp-field-label">{label}</p>
      {value
        ? <p className="cp-field-value">{value}</p>
        : <p className="cp-field-empty">Not set — tap Edit to add</p>
      }
    </div>
  );

  const EditField = ({ label, fieldKey, rows = 2, placeholder }: {
    label: string; fieldKey: keyof typeof form; rows?: number; placeholder?: string;
  }) => (
    <div className="cp-edit-field">
      <label className="cp-edit-label">{label}</label>
      <textarea
        rows={rows}
        placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
        className="cp-textarea"
        {...field(fieldKey)}
      />
    </div>
  );

  return (
    <div className="cp-wrap">
      <style>{careStyles}</style>

      {/* Header */}
      <div className="cp-header">
        <div>
          <h2 className="cp-header-title">Care Profile</h2>
          <p className="cp-header-sub">Shared with your guardian when they open their link.</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="vp-btn-orange">✏️ Edit</button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setEditing(false)} className="vp-btn-ghost">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="vp-btn-orange">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {saved && (
        <div className="cp-saved-banner">
          ✅ Care profile saved — guardian document updated.
        </div>
      )}

      {/* Feeding */}
      <Section emoji="🥣" title="Feeding Instructions" accent="#c47a3a">
        {editing ? (
          <>
            <EditField label="Feeding Schedule" fieldKey="feeding_schedule" placeholder="e.g. 7am and 6pm, 1 cup each" />
            <EditField label="How to Feed" fieldKey="feeding_instructions" rows={3} placeholder="e.g. Mix dry kibble with warm water, let soak 5 minutes…" />
            <EditField label="Do NOT Feed" fieldKey="do_not_feed" placeholder="e.g. Grapes, chocolate, onions, rawhide" />
          </>
        ) : (
          <>
            <ViewField label="Feeding Schedule" value={form.feeding_schedule} />
            <ViewField label="How to Feed" value={form.feeding_instructions} />
            {form.do_not_feed && <ViewField label="🚫 Do NOT Feed" value={form.do_not_feed} danger />}
          </>
        )}
      </Section>

      {/* Medication */}
      <Section emoji="💊" title="Medications" accent="#8b6dd4">
        {editing
          ? <EditField label="Medication Instructions" fieldKey="medication_instructions" rows={3} placeholder="e.g. Apoquel 16mg — give 1 tablet with food every morning" />
          : <ViewField label="Medication Instructions" value={form.medication_instructions} />
        }
      </Section>

      {/* Daily Routine */}
      <Section emoji="📅" title="Daily Routine" accent="#378add">
        {editing
          ? <EditField label="Typical Daily Routine" fieldKey="daily_routine" rows={4} placeholder="e.g. 6:30am wake up, 7am breakfast, 8am 45min walk…" />
          : <ViewField label="Typical Daily Routine" value={form.daily_routine} />
        }
      </Section>

      {/* Behaviour */}
      <Section emoji="💛" title="Personality & Behaviour" accent="#eab308">
        {editing
          ? <EditField label="Behaviour Notes" fieldKey="behaviour_notes" rows={3} placeholder="e.g. Nervous around strangers, loves belly rubs…" />
          : <ViewField label="Behaviour Notes" value={form.behaviour_notes} />
        }
      </Section>

      {/* Red Flags */}
      <Section emoji="⚠️" title="Red Flags & Emergency Steps" accent="#e24b4a">
        {editing ? (
          <>
            <EditField label="Warning Signs to Watch For" fieldKey="warning_signs" rows={3} placeholder="e.g. If he stops eating for 12hrs, call the vet immediately…" />
            <EditField label="Emergency Steps" fieldKey="emergency_steps" rows={3} placeholder="e.g. 1. Call owner. 2. Call Dr Patel. 3. Go to 24hr vet on Main St…" />
          </>
        ) : (
          <>
            <ViewField label="Warning Signs" value={form.warning_signs} />
            <ViewField label="Emergency Steps" value={form.emergency_steps} />
          </>
        )}
      </Section>

      {/* Vet */}
      <Section emoji="🏥" title="Vet & Medical" accent="#1d9e75">
        {editing ? (
          <>
            <EditField label="Primary Vet Name" fieldKey="primary_vet" rows={1} placeholder="e.g. Dr Sarah Patel" />
            <EditField label="Vet Clinic" fieldKey="vet_clinic" rows={1} placeholder="e.g. City Animal Clinic" />
            <EditField label="Vet Phone" fieldKey="vet_phone" rows={1} placeholder="e.g. 021 555 1234" />
            <EditField label="24hr Emergency Vet" fieldKey="emergency_vet" rows={1} placeholder="e.g. 021 555 9999 — Animal Emergency Centre" />
          </>
        ) : (
          <div className="cp-vet-grid">
            <ViewField label="Primary Vet" value={form.primary_vet} />
            <ViewField label="Vet Clinic" value={form.vet_clinic} />
            <ViewField label="Vet Phone" value={form.vet_phone} />
            <ViewField label="Emergency Vet" value={form.emergency_vet} />
          </div>
        )}
      </Section>

      {/* Guardian link */}
      <div className="cp-guardian-cta">
        <p className="cp-guardian-text">This care profile feeds directly into your guardian's care document.</p>
        <Link href={`/pets/${petId}/guardian`} className="vp-link-orange">
          Manage Guardians & View Care Document →
        </Link>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PetDetailPage() {
  const params = useParams();
  const petId = params?.id as string;

  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [latestWeightKg, setLatestWeightKg] = useState<number | null>(null);

  useEffect(() => {
    if (!petId) return;
    const supabase = getSupabaseClient();
    async function loadData() {
      const { data, error: dbError } = await supabase
        .from('pets').select('*').eq('id', petId).single();
      if (dbError || !data) setError('Pet not found');
      else setPet(data);
      setLoading(false);
    }
    loadData();
  }, [petId]);

  const tabs = [
    { id: 'profile',   label: 'Care Profile', emoji: '🐾' },
    { id: 'guardians', label: 'Guardians',     emoji: '🛡️' },
    { id: 'memories',  label: 'Memories',      emoji: '📸' },
    { id: 'nutrition', label: 'Nutrition',     emoji: '🍎' },
    { id: 'weight',    label: 'Weight',        emoji: '⚖️' },
    { id: 'vaccines',  label: 'Vaccines',      emoji: '🗓️' },
    { id: 'wellness',  label: 'Wellness',      emoji: '🏅' },
    { id: 'journal',   label: 'Journal',       emoji: '🏥' },
    { id: 'symptoms',  label: 'Symptoms',      emoji: '🩺' },
  ];

  if (loading) {
    return (
      <div className="vp-loading-screen">
        <style>{pageStyles}</style>
        <img src="/logo.white.png" alt="VuraPet" className="vp-loading-logo" />
        <p className="vp-loading-text">Loading pet profile…</p>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="vp-error-screen">
        <style>{pageStyles}</style>
        <p className="vp-error-msg">{error || 'Pet not found'}</p>
        <Link href="/dashboard" className="vp-link-orange">← Back to Dashboard</Link>
      </div>
    );
  }

  const photoUrl = pet.profile_photo_url || pet.photo_url;
  const age = calcAge(pet.date_of_birth);

  return (
    <div className="vp-pet-page">
      <style>{pageStyles}</style>

      {/* Back */}
      <Link href="/dashboard" className="vp-back-link">← Back to Dashboard</Link>

      {/* ── Pet Header ── */}
      <div className="vp-pet-header">
        <div className="vp-pet-header-glow" />
        <div className="vp-pet-header-inner">

          {/* Avatar */}
          <div className="vp-pet-avatar">
            {photoUrl
              ? <img src={photoUrl} alt={pet.name} className="vp-pet-avatar-img" />
              : <span className="vp-pet-avatar-emoji">{petEmoji(pet.species)}</span>
            }
          </div>

          {/* Info */}
          <div className="vp-pet-info">
            <div className="vp-pet-name-row">
              <div>
                <h1 className="vp-pet-name">{pet.name}</h1>
                <p className="vp-pet-breed">
                  {pet.species}{pet.breed ? ` · ${pet.breed}` : ''}
                </p>
              </div>
              <Link href={`/pets/${pet.id}/report`} className="vp-btn-dark">
                📄 Vet Report
              </Link>
            </div>

            {/* Stat pills */}
            <div className="vp-pills-row">
              {age && <span className="vp-pill vp-pill-orange">🎂 {age}</span>}
              {pet.sex && (
                <span className="vp-pill vp-pill-blue">
                  {pet.sex?.toLowerCase() === 'male' ? '♂️' : '♀️'} {pet.sex}
                </span>
              )}
              {pet.microchip && (
                <span className="vp-pill vp-pill-gray">📡 {pet.microchip}</span>
              )}
              {latestWeightKg && (
                <span className="vp-pill vp-pill-green">⚖️ {latestWeightKg}kg</span>
              )}
            </div>

            {/* Health alerts */}
            {(pet.allergies?.length > 0 || pet.chronic_conditions?.length > 0) && (
              <div className="vp-health-alert">
                {pet.allergies?.length > 0 && (
                  <p className="vp-alert-text">
                    ⚠️ Allergies: {Array.isArray(pet.allergies) ? pet.allergies.join(', ') : pet.allergies}
                  </p>
                )}
                {pet.chronic_conditions?.length > 0 && (
                  <p className="vp-alert-text">
                    🏥 Conditions: {Array.isArray(pet.chronic_conditions) ? pet.chronic_conditions.join(', ') : pet.chronic_conditions}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wellness score */}
      <div className="vp-wellness-wrap">
        <WellnessScore petId={pet.id} />
      </div>

      {/* ── Tabs ── */}
      <div className="vp-tabs-bar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`vp-tab ${activeTab === tab.id ? 'vp-tab-active' : ''}`}
          >
            <span className="vp-tab-emoji">{tab.emoji}</span>
            <span className="vp-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="vp-tab-content">
        {activeTab === 'profile'   && <CareProfileTab pet={pet} petId={petId} onSaved={setPet} />}
        {activeTab === 'nutrition' && <NutritionArchitect species={pet.species} latestWeightKg={latestWeightKg} />}
        {activeTab === 'weight'    && <WeightTracker petId={pet.id} onLatestWeightChange={setLatestWeightKg} />}
        {activeTab === 'vaccines'  && <VaccineCalendar petId={pet.id} />}
        {activeTab === 'wellness'  && <WellnessPassport petId={pet.id} pet={pet} />}
        {activeTab === 'journal'   && <HealthJournal petId={pet.id} />}
        {activeTab === 'symptoms'  && <SymptomChecker petId={pet.id} petName={pet.name} petSpecies={pet.species} />}
        {activeTab === 'memories'  && <MemoryBook petId={pet.id} />}
        {activeTab === 'guardians' && <GuardianSystem petId={pet.id} petName={pet.name} />}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageStyles = `
  .vp-pet-page {
    background: #0c0a08;
    min-height: 100vh;
    max-width: 960px;
    margin: 0 auto;
    padding: 24px 24px 80px;
    font-family: 'Geist', 'Inter', sans-serif;
    color: #f0ebe4;
  }

  /* Loading */
  .vp-loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 16px;
    background: #0c0a08;
  }
  .vp-loading-logo {
    width: 56px;
    height: 56px;
    object-fit: contain;
    animation: vp-pulse 1.4s ease-in-out infinite;
  }
  .vp-loading-text { font-size: 14px; color: #a08060; }

  /* Error */
  .vp-error-screen {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: 60vh; gap: 16px;
    background: #0c0a08;
  }
  .vp-error-msg { color: #e24b4a; font-size: 15px; }

  @keyframes vp-pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.5; transform:scale(0.9); }
  }

  /* Back link */
  .vp-back-link {
    display: inline-block;
    font-size: 13px;
    font-weight: 500;
    color: #c47a3a;
    text-decoration: none;
    margin-bottom: 20px;
    transition: color 0.2s;
  }
  .vp-back-link:hover { color: #e8963d; }

  /* ── Pet header ── */
  .vp-pet-header {
    position: relative;
    overflow: hidden;
    background: #181411;
    border: 0.5px solid rgba(196,122,58,0.2);
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 16px;
  }
  .vp-pet-header-glow {
    position: absolute;
    top: -80px; right: -80px;
    width: 280px; height: 280px;
    background: radial-gradient(circle, rgba(196,122,58,0.1) 0%, transparent 70%);
    pointer-events: none;
  }
  .vp-pet-header-inner {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 20px;
  }

  /* Avatar */
  .vp-pet-avatar {
    width: 88px; height: 88px;
    border-radius: 50%;
    background: rgba(196,122,58,0.12);
    border: 2px solid rgba(196,122,58,0.3);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; flex-shrink: 0;
  }
  .vp-pet-avatar-img { width:100%; height:100%; object-fit:cover; }
  .vp-pet-avatar-emoji { font-size: 38px; }

  /* Info */
  .vp-pet-info { flex: 1; min-width: 0; }
  .vp-pet-name-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }
  .vp-pet-name {
    font-size: 26px; font-weight: 700;
    color: #f0ebe4; letter-spacing: -0.02em;
    line-height: 1.1; margin-bottom: 4px;
  }
  .vp-pet-breed { font-size: 13px; color: #7a6050; text-transform: capitalize; }

  /* Pills */
  .vp-pills-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
  .vp-pill {
    font-size: 11px; font-weight: 600;
    padding: 4px 10px; border-radius: 999px;
  }
  .vp-pill-orange { background: rgba(196,122,58,0.15); color: #c47a3a; border: 0.5px solid rgba(196,122,58,0.3); }
  .vp-pill-blue   { background: rgba(55,138,221,0.15); color: #85b7eb; border: 0.5px solid rgba(55,138,221,0.3); }
  .vp-pill-gray   { background: rgba(255,255,255,0.07); color: #a09080; border: 0.5px solid rgba(255,255,255,0.12); }
  .vp-pill-green  { background: rgba(29,158,117,0.15); color: #5dcaa5; border: 0.5px solid rgba(29,158,117,0.3); }

  /* Health alert */
  .vp-health-alert {
    background: rgba(226,75,74,0.1);
    border: 0.5px solid rgba(226,75,74,0.3);
    border-radius: 10px; padding: 10px 12px;
  }
  .vp-alert-text { font-size: 12px; font-weight: 600; color: #f09595; margin: 0 0 2px; }
  .vp-alert-text:last-child { margin-bottom: 0; }

  /* Wellness */
  .vp-wellness-wrap { margin-bottom: 16px; }

  /* ── Tabs ── */
  .vp-tabs-bar {
    display: flex;
    gap: 2px;
    border-bottom: 0.5px solid rgba(255,255,255,0.08);
    overflow-x: auto;
    scrollbar-width: none;
    margin-bottom: 24px;
  }
  .vp-tabs-bar::-webkit-scrollbar { display: none; }
  .vp-tab {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 14px;
    background: none; border: none;
    border-bottom: 2px solid transparent;
    font-size: 13px; font-weight: 500;
    color: #6a5040; cursor: pointer;
    white-space: nowrap;
    transition: color 0.2s, border-color 0.2s;
    margin-bottom: -0.5px;
  }
  .vp-tab:hover { color: #d0b898; }
  .vp-tab-active {
    color: #c47a3a !important;
    border-bottom-color: #c47a3a !important;
  }
  .vp-tab-emoji { font-size: 14px; }
  .vp-tab-label { display: none; }
  @media (min-width: 500px) { .vp-tab-label { display: inline; } }

  /* Tab content */
  .vp-tab-content { padding-bottom: 48px; }

  /* ── Shared buttons ── */
  .vp-btn-orange {
    display: inline-flex; align-items: center;
    background: #c47a3a; color: #fff;
    font-size: 13px; font-weight: 600;
    padding: 9px 18px; border-radius: 10px;
    border: none; cursor: pointer; text-decoration: none;
    transition: background 0.2s, transform 0.15s;
    white-space: nowrap;
  }
  .vp-btn-orange:hover { background: #d48a46; transform: translateY(-1px); }
  .vp-btn-orange:disabled { opacity: 0.5; cursor: not-allowed; }

  .vp-btn-ghost {
    display: inline-flex; align-items: center;
    background: transparent; color: #a08060;
    font-size: 13px; font-weight: 500;
    padding: 9px 18px; border-radius: 10px;
    border: 0.5px solid rgba(255,255,255,0.12); cursor: pointer;
    transition: background 0.2s;
  }
  .vp-btn-ghost:hover { background: rgba(255,255,255,0.05); }

  .vp-btn-dark {
    display: inline-flex; align-items: center;
    background: rgba(255,255,255,0.07); color: #d0b898;
    font-size: 13px; font-weight: 600;
    padding: 9px 18px; border-radius: 10px;
    border: 0.5px solid rgba(255,255,255,0.12); text-decoration: none;
    transition: background 0.2s; white-space: nowrap;
  }
  .vp-btn-dark:hover { background: rgba(255,255,255,0.12); }

  .vp-link-orange {
    color: #c47a3a; font-size: 13px; font-weight: 600;
    text-decoration: none; transition: color 0.2s;
  }
  .vp-link-orange:hover { color: #e8963d; }

  @media (max-width: 600px) {
    .vp-pet-page { padding: 16px 16px 60px; }
    .vp-pet-header { padding: 16px; }
    .vp-pet-avatar { width: 68px; height: 68px; }
    .vp-pet-name { font-size: 20px; }
  }
`;

const careStyles = `
  .cp-wrap { display: flex; flex-direction: column; gap: 14px; }

  .cp-header {
    display: flex; align-items: flex-start;
    justify-content: space-between; gap: 12px;
    flex-wrap: wrap; margin-bottom: 4px;
  }
  .cp-header-title { font-size: 17px; font-weight: 700; color: #f0ebe4; margin-bottom: 3px; }
  .cp-header-sub { font-size: 13px; color: #7a6050; }

  .cp-saved-banner {
    background: rgba(29,158,117,0.12);
    border: 0.5px solid rgba(29,158,117,0.35);
    border-radius: 10px; padding: 12px 16px;
    font-size: 13px; font-weight: 600; color: #5dcaa5;
  }

  .cp-section {
    background: #181411;
    border: 0.5px solid rgba(255,255,255,0.07);
    border-left: 3px solid #c47a3a;
    border-radius: 14px;
    padding: 16px 18px;
  }
  .cp-section-header {
    display: flex; align-items: center; gap: 8px; margin-bottom: 14px;
  }
  .cp-section-title { font-size: 14px; font-weight: 700; }

  .cp-view-field { margin-bottom: 12px; }
  .cp-view-field:last-child { margin-bottom: 0; }
  .cp-field-label {
    font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: #6a5040; margin-bottom: 5px;
  }
  .cp-field-value {
    font-size: 13px; color: #d0b898; line-height: 1.6;
    white-space: pre-wrap;
    background: rgba(255,255,255,0.04);
    border-radius: 8px; padding: 8px 10px;
  }
  .cp-field-empty {
    font-size: 13px; color: #4a3828; font-style: italic;
  }
  .cp-field-danger .cp-field-label { color: #e24b4a; }
  .cp-field-danger .cp-field-value {
    background: rgba(226,75,74,0.08);
    color: #f09595;
    border: 0.5px solid rgba(226,75,74,0.2);
  }

  .cp-edit-field { margin-bottom: 14px; }
  .cp-edit-field:last-child { margin-bottom: 0; }
  .cp-edit-label {
    display: block; font-size: 11px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: #6a5040; margin-bottom: 6px;
  }
  .cp-textarea {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 0.5px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 13px; color: #d0b898;
    font-family: inherit;
    resize: none;
    transition: border-color 0.2s;
    outline: none;
  }
  .cp-textarea:focus { border-color: rgba(196,122,58,0.5); }
  .cp-textarea::placeholder { color: #4a3828; }

  .cp-vet-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .cp-guardian-cta {
    background: rgba(255,255,255,0.03);
    border: 0.5px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 16px 20px;
    text-align: center;
  }
  .cp-guardian-text { font-size: 13px; color: #6a5040; margin-bottom: 8px; }

  @media (max-width: 500px) {
    .cp-vet-grid { grid-template-columns: 1fr; }
  }
`;