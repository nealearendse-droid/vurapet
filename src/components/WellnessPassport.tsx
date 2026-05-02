'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  date_of_birth?: string;
  sex?: string;
  microchip?: string;
  allergies?: string[];
  chronic_conditions?: string[];
  primary_vet?: string;
  vet_clinic?: string;
  vet_phone?: string;
  emergency_vet?: string;
  profile_photo_url?: string;
  photo_url?: string;
  colour?: string;
  weight?: number;
  user_id?: string;
}

interface Vaccine {
  id: string;
  vaccine_name: string;
  date_given: string;
  next_due_date?: string;
  administered_by?: string;
  batch_number?: string;
}

interface WeightEntry {
  weight_kg: number;
  recorded_at: string;
}

interface Props {
  petId: string;
  pet: Pet;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcAge(dob?: string): string {
  if (!dob) return 'Unknown';
  const diff = Date.now() - new Date(dob).getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  if (years < 1) {
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.4));
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  return `${years} year${years !== 1 ? 's' : ''}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function isDueSoon(dateStr?: string): boolean {
  if (!dateStr) return false;
  const due = new Date(dateStr);
  const now = new Date();
  const thirtyDays = new Date();
  thirtyDays.setDate(now.getDate() + 30);
  return due > now && due <= thirtyDays;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WellnessPassport({ petId, pet }: Props) {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [printed, setPrinted] = useState(false);

  const photoUrl = pet.profile_photo_url || pet.photo_url;
  const latestWeight = weights[0]?.weight_kg;
  const previousWeight = weights[1]?.weight_kg;
  const weightTrend = latestWeight && previousWeight
    ? latestWeight > previousWeight ? '↑' : latestWeight < previousWeight ? '↓' : '→'
    : null;

  useEffect(() => {
    const supabase = getSupabaseClient();
    async function load() {
      const [{ data: vaccineData }, { data: weightData }] = await Promise.all([
        supabase
          .from('vaccine_records')
          .select('*')
          .eq('pet_id', petId)
          .order('date_given', { ascending: false }),
        supabase
          .from('weight_entries')
          .select('weight_kg, recorded_at')
          .eq('pet_id', petId)
          .order('recorded_at', { ascending: false })
          .limit(5),
      ]);
      setVaccines(vaccineData || []);
      setWeights(weightData || []);
      setLoading(false);
    }
    load();
  }, [petId]);

  const handlePrint = () => {
    window.print();
  };

  const overdueVaccines = vaccines.filter(v => isOverdue(v.next_due_date));
  const dueSoonVaccines = vaccines.filter(v => isDueSoon(v.next_due_date));
  const upToDateVaccines = vaccines.filter(v => v.next_due_date && !isOverdue(v.next_due_date) && !isDueSoon(v.next_due_date));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">📋</div>
          <p className="text-gray-400 font-medium text-sm">Building passport...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Print styles ────────────────────────────────────────────────────── */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #wellness-passport, #wellness-passport * { visibility: visible !important; }
          #wellness-passport {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .passport-no-print { display: none !important; }
          .passport-section { break-inside: avoid !important; page-break-inside: avoid !important; }
          @page { margin: 12mm 14mm; size: A4 portrait; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>

      <div id="wellness-passport" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111827', maxWidth: 760, margin: '0 auto', paddingBottom: 48 }}>

        {/* ── Passport Header ──────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
          borderRadius: 20,
          padding: '24px 28px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap',
        }} className="passport-section">

          {/* Pet photo */}
          <div style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            background: '#374151',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            border: '3px solid #f97316',
          }}>
            {photoUrl
              ? <img src={photoUrl} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 40 }}>🐾</span>
            }
          </div>

          {/* Pet info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0 }}>{pet.name}</h1>
              <span style={{
                background: '#f97316',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 20,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>Wellness Passport</span>
            </div>
            <p style={{ color: '#9ca3af', fontSize: 14, margin: '0 0 10px' }}>
              {[pet.breed, pet.species, pet.sex, calcAge(pet.date_of_birth)].filter(Boolean).join(' · ')}
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {pet.microchip && (
                <span style={{ background: '#374151', color: '#d1d5db', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 8 }}>
                  📡 {pet.microchip}
                </span>
              )}
              {latestWeight && (
                <span style={{ background: '#374151', color: '#d1d5db', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 8 }}>
                  ⚖️ {latestWeight}kg {weightTrend && <span style={{ color: weightTrend === '↑' ? '#f87171' : weightTrend === '↓' ? '#34d399' : '#9ca3af' }}>{weightTrend}</span>}
                </span>
              )}
              {pet.date_of_birth && (
                <span style={{ background: '#374151', color: '#d1d5db', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 8 }}>
                  🎂 {formatDate(pet.date_of_birth)}
                </span>
              )}
            </div>
          </div>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="passport-no-print"
            style={{
              background: '#f97316',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            🖨️ Print / Save PDF
          </button>
        </div>

        {/* ── Vaccine Status Banner ────────────────────────────────────────── */}
        {(overdueVaccines.length > 0 || dueSoonVaccines.length > 0) && (
          <div style={{
            background: overdueVaccines.length > 0 ? '#fef2f2' : '#fffbeb',
            border: `1px solid ${overdueVaccines.length > 0 ? '#fca5a5' : '#fde68a'}`,
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }} className="passport-section">
            <span style={{ fontSize: 24 }}>{overdueVaccines.length > 0 ? '🚨' : '⚠️'}</span>
            <div>
              {overdueVaccines.length > 0 && (
                <p style={{ fontSize: 14, fontWeight: 800, color: '#991b1b', margin: '0 0 2px' }}>
                  {overdueVaccines.length} vaccine{overdueVaccines.length > 1 ? 's' : ''} overdue — vet visit needed
                </p>
              )}
              {dueSoonVaccines.length > 0 && (
                <p style={{ fontSize: 13, color: '#92400e', margin: 0 }}>
                  {dueSoonVaccines.length} vaccine{dueSoonVaccines.length > 1 ? 's' : ''} due within 30 days
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Two column layout ────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* Health Alerts */}
          <div style={cardStyle} className="passport-section">
            <SectionHead emoji="⚠️" title="Health Alerts" color="#ef4444" />
            {(!pet.allergies?.length && !pet.chronic_conditions?.length) ? (
              <p style={emptyStyle}>No known allergies or conditions</p>
            ) : (
              <>
                {pet.allergies && pet.allergies.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <p style={microLabel}>Allergies</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {pet.allergies.map((a, i) => (
                        <span key={i} style={{ background: '#fef2f2', color: '#991b1b', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, border: '1px solid #fca5a5' }}>
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {pet.chronic_conditions && pet.chronic_conditions.length > 0 && (
                  <div>
                    <p style={microLabel}>Chronic Conditions</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {pet.chronic_conditions.map((c, i) => (
                        <span key={i} style={{ background: '#fff7ed', color: '#c2410c', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, border: '1px solid #fed7aa' }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Vet Details */}
          <div style={cardStyle} className="passport-section">
            <SectionHead emoji="🏥" title="Veterinary Care" color="#7c3aed" />
            {!pet.primary_vet && !pet.vet_clinic && !pet.vet_phone ? (
              <p style={emptyStyle}>No vet details on file</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pet.vet_clinic && <MiniField label="Clinic" value={pet.vet_clinic} />}
                {pet.primary_vet && <MiniField label="Vet" value={pet.primary_vet} />}
                {pet.vet_phone && (
                  <div>
                    <p style={microLabel}>Phone</p>
                    <a href={`tel:${pet.vet_phone}`} style={{ fontSize: 14, fontWeight: 700, color: '#7c3aed', textDecoration: 'none' }}>
                      {pet.vet_phone}
                    </a>
                  </div>
                )}
                {pet.emergency_vet && <MiniField label="Emergency Vet" value={pet.emergency_vet} />}
              </div>
            )}
          </div>
        </div>

        {/* ── Weight History ───────────────────────────────────────────────── */}
        {weights.length > 0 && (
          <div style={{ ...cardStyle, marginBottom: 16 }} className="passport-section">
            <SectionHead emoji="⚖️" title="Weight History" color="#0ea5e9" />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {weights.map((w, i) => (
                <div key={i} style={{
                  background: i === 0 ? '#eff6ff' : '#f9fafb',
                  border: `1px solid ${i === 0 ? '#bfdbfe' : '#e5e7eb'}`,
                  borderRadius: 10,
                  padding: '8px 14px',
                  textAlign: 'center',
                  minWidth: 80,
                }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: i === 0 ? '#1d4ed8' : '#374151', margin: '0 0 2px' }}>
                    {w.weight_kg}kg
                  </p>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
                    {formatDate(w.recorded_at)}
                  </p>
                  {i === 0 && <p style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', margin: '2px 0 0' }}>Latest</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Vaccination Record ───────────────────────────────────────────── */}
        <div style={{ ...cardStyle, marginBottom: 16 }} className="passport-section">
          <SectionHead emoji="💉" title="Vaccination Record" color="#22c55e" />
          {vaccines.length === 0 ? (
            <p style={emptyStyle}>No vaccines on record</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {vaccines.map((v, i) => {
                const overdue = isOverdue(v.next_due_date);
                const soon = isDueSoon(v.next_due_date);
                return (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: overdue ? '#fef2f2' : soon ? '#fffbeb' : '#f0fdf4',
                    border: `1px solid ${overdue ? '#fca5a5' : soon ? '#fde68a' : '#bbf7d0'}`,
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>
                      {overdue ? '🔴' : soon ? '🟡' : '🟢'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>
                        {v.vaccine_name}
                      </p>
                      <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
                        Given: {formatDate(v.date_given)}
                        {v.administered_by && ` · ${v.administered_by}`}
                      </p>
                    </div>
                    {v.next_due_date && (
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: overdue ? '#dc2626' : soon ? '#d97706' : '#15803d', margin: '0 0 1px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {overdue ? 'OVERDUE' : soon ? 'DUE SOON' : 'Next due'}
                        </p>
                        <p style={{ fontSize: 12, color: '#374151', margin: 0, fontWeight: 600 }}>
                          {formatDate(v.next_due_date)}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Passport Footer ──────────────────────────────────────────────── */}
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 14,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }} className="passport-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🐾</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#f97316', margin: 0, lineHeight: 1 }}>VuraPet</p>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Your Pet's Lifetime Companion</p>
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
            Generated {new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
            {' · '}This document is for {pet.name} only.
          </p>
        </div>

      </div>
    </>
  );
}

// ─── Small helper components ──────────────────────────────────────────────────

function SectionHead({ emoji, title, color }: { emoji: string; title: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span style={{ fontSize: 18 }}>{emoji}</span>
      <h3 style={{ fontSize: 14, fontWeight: 800, color, margin: 0 }}>{title}</h3>
    </div>
  );
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={microLabel}>{label}</p>
      <p style={{ fontSize: 14, color: '#111827', fontWeight: 500, margin: 0 }}>{value}</p>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 14,
  padding: '16px 18px',
};

const microLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: '#9ca3af',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '0 0 3px',
};

const emptyStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#9ca3af',
  fontStyle: 'italic',
  margin: 0,
};