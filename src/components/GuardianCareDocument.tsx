'use client';

import { useEffect, useState } from 'react';

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
  emergency_vet?: string;
  vet_clinic?: string;
  vet_phone?: string;
  profile_photo_url?: string;
  photo_url?: string;
  feeding_schedule?: string;
  feeding_instructions?: string;
  medication_instructions?: string;
  do_not_feed?: string;
  warning_signs?: string;
  daily_routine?: string;
  behaviour_notes?: string;
  emergency_steps?: string;
}

interface Props {
  pet: Pet;
  ownerName?: string;
  ownerPhone?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function age(dob?: string): string {
  if (!dob) return 'Unknown';
  const diff = Date.now() - new Date(dob).getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  if (years < 1) {
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.4));
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  return `${years} year${years !== 1 ? 's' : ''}`;
}

function hasContent(val?: string | string[]): boolean {
  if (!val) return false;
  if (Array.isArray(val)) return val.length > 0;
  return val.trim().length > 0;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ emoji, title, color, children }: {
  emoji: string; title: string; color: string; children: React.ReactNode;
}) {
  return (
    <div style={{ ...S.section, borderLeftColor: color }} className="doc-section">
      <div style={S.sectionHeader}>
        <span style={{ fontSize: 20 }}>{emoji}</span>
        <h2 style={{ ...S.sectionTitle, color }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!hasContent(value)) return null;
  return (
    <div style={S.field}>
      <span style={S.fieldLabel}>{label}</span>
      <span style={S.fieldValue}>{value}</span>
    </div>
  );
}

function Tags({ label, items }: { label: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={S.field}>
      <span style={S.fieldLabel}>{label}</span>
      <div style={S.tagRow}>
        {items.map((item, i) => (
          <span key={i} style={S.tag}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function TextBlock({ label, value, highlight }: {
  label: string; value?: string; highlight?: boolean;
}) {
  if (!hasContent(value)) return null;
  return (
    <div style={{ ...S.textBlock, background: highlight ? '#fff7ed' : '#f9fafb' }}>
      <p style={S.textBlockLabel}>{label}</p>
      <p style={S.textBlockValue}>{value}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GuardianCareDocument({ pet, ownerName, ownerPhone }: Props) {
  const photoUrl = pet.profile_photo_url || pet.photo_url;

  const handlePrint = () => {
    window.print();
  };

  const hasFeedingInfo = hasContent(pet.feeding_schedule) || hasContent(pet.feeding_instructions) || hasContent(pet.do_not_feed);
  const hasMedication = hasContent(pet.medication_instructions);
  const hasRoutine = hasContent(pet.daily_routine);
  const hasBehaviour = hasContent(pet.behaviour_notes);
  const hasEmergency = hasContent(pet.emergency_steps) || hasContent(pet.warning_signs);
  const hasVet = hasContent(pet.primary_vet) || hasContent(pet.vet_clinic) || hasContent(pet.vet_phone);
  const hasHealth = hasContent(pet.allergies) || hasContent(pet.chronic_conditions);

  return (
    <>
      {/* ── Print / PDF styles ──────────────────────────────────────────────── */}
      <style>{`
        @media print {
          /* Hide everything except the care document */
          body * { visibility: hidden !important; }
          #guardian-care-doc,
          #guardian-care-doc * { visibility: visible !important; }

          /* Reset position so it fills the page */
          #guardian-care-doc {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Hide the print button and any screen-only UI */
          .no-print { display: none !important; }

          /* Page setup */
          @page {
            margin: 12mm 14mm;
            size: A4 portrait;
          }

          /* Keep each section together — no orphaned headers */
          .doc-section {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          /* Quick View fridge sheet always starts on a fresh page */
          .doc-fridge-sheet {
            break-before: page !important;
            page-break-before: always !important;
          }

          /* Print-only header — show the VuraPet branding at top of page 1 */
          .print-only-header { display: flex !important; }

          /* Remove box shadows and borders that look bad on paper */
          #guardian-care-doc * {
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }

        /* Hide print-only elements on screen */
        .print-only-header { display: none; }
      `}</style>

      <div id="guardian-care-doc" style={S.doc}>

        {/* ── Print-only page header (hidden on screen) ─────────────────────── */}
        <div className="print-only-header" style={S.printHeader}>
          <span style={{ fontSize: 22 }}>🐾</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#f97316', margin: 0, lineHeight: 1 }}>VuraPet</p>
            <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>Your Pet's Lifetime Companion</p>
          </div>
          <p style={{ marginLeft: 'auto', fontSize: 10, color: '#9ca3af' }}>
            Printed {new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* ── Document Header ─────────────────────────────────────────────────── */}
        <div style={S.docHeader}>
          <div style={S.docHeaderLeft}>
            <div style={S.petAvatar}>
              {photoUrl
                ? <img src={photoUrl} alt={pet.name} style={S.petPhoto} />
                : <span style={{ fontSize: 36 }}>🐾</span>
              }
            </div>
            <div>
              <h1 style={S.petName}>{pet.name}'s Guardian Care Plan</h1>
              <p style={S.petMeta}>
                {[pet.breed, pet.species, pet.sex, age(pet.date_of_birth)]
                  .filter(Boolean).join(' · ')}
              </p>
              {ownerName && (
                <p style={S.ownerLine}>
                  Owner: <strong>{ownerName}</strong>
                  {ownerPhone && (
                    <> · <a href={`tel:${ownerPhone}`} style={S.ownerPhone}>{ownerPhone}</a></>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Print button — hidden on actual print output */}
          <button style={S.printBtn} onClick={handlePrint} className="no-print">
            🖨️ Print / Save PDF
          </button>
        </div>

        {/* ── Emergency Banner ─────────────────────────────────────────────────── */}
        <div style={S.emergencyBanner} className="doc-section">
          <div style={S.emergencyBannerLeft}>
            <span style={{ fontSize: 24 }}>🚨</span>
            <div>
              <p style={S.emergencyBannerTitle}>In an emergency — call immediately</p>
              <p style={S.emergencyBannerSub}>Don't wait. Don't guess. Call.</p>
            </div>
          </div>
          <div style={S.emergencyContacts}>
            {ownerPhone && (
              <a href={`tel:${ownerPhone}`} style={S.emergencyContactBtn}>
                📱 {ownerName || 'Owner'}<br />
                <span style={S.emergencyContactNum}>{ownerPhone}</span>
              </a>
            )}
            {pet.vet_phone && (
              <a href={`tel:${pet.vet_phone}`} style={{ ...S.emergencyContactBtn, background: '#dc2626' }}>
                🏥 {pet.vet_clinic || pet.primary_vet || 'Vet'}<br />
                <span style={S.emergencyContactNum}>{pet.vet_phone}</span>
              </a>
            )}
            {pet.emergency_vet && (
              <a href={`tel:${pet.emergency_vet}`} style={{ ...S.emergencyContactBtn, background: '#7c3aed' }}>
                🚑 Emergency Vet<br />
                <span style={S.emergencyContactNum}>{pet.emergency_vet}</span>
              </a>
            )}
          </div>
        </div>

        {/* ── First 24 Hours Guide ─────────────────────────────────────────────── */}
        <Section emoji="🕐" title="First 24 Hours — Start Here" color="#f97316">
          <div style={S.guideGrid}>
            {[
              { time: 'Arrive', icon: '🏠', text: `Introduce yourself calmly to ${pet.name}. Let them sniff you before petting.` },
              { time: 'First hour', icon: '🔍', text: `Check water bowl is full. Note ${pet.name}'s mood and energy level.` },
              { time: 'Feeding time', icon: '🥣', text: pet.feeding_schedule || `Follow the feeding schedule below. Do not overfeed.` },
              { time: 'Evening', icon: '🌙', text: pet.daily_routine ? `Follow the daily routine below.` : `Keep the environment calm. Stick to normal routines as much as possible.` },
              { time: 'Any concerns', icon: '📞', text: `Call the owner first. If no answer, follow the emergency steps below.` },
            ].map((step, i) => (
              <div key={i} style={S.guideStep}>
                <span style={S.guideIcon}>{step.icon}</span>
                <div>
                  <p style={S.guideTime}>{step.time}</p>
                  <p style={S.guideText}>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Pet Profile ──────────────────────────────────────────────────────── */}
        <Section emoji="🐾" title="Pet Profile" color="#6366f1">
          <div style={S.fieldGrid}>
            <Field label="Full name" value={pet.name} />
            <Field label="Species" value={pet.species} />
            <Field label="Breed" value={pet.breed} />
            <Field label="Age" value={age(pet.date_of_birth)} />
            <Field label="Sex" value={pet.sex} />
            <Field label="Microchip" value={pet.microchip} />
          </div>
          {hasHealth && (
            <>
              <Tags label="Allergies" items={pet.allergies} />
              <Tags label="Chronic conditions" items={pet.chronic_conditions} />
            </>
          )}
          {hasBehaviour && (
            <TextBlock label="Behaviour & personality notes" value={pet.behaviour_notes} />
          )}
        </Section>

        {/* ── Feeding ──────────────────────────────────────────────────────────── */}
        {hasFeedingInfo && (
          <Section emoji="🥣" title="Feeding Instructions" color="#22c55e">
            <TextBlock label="Feeding schedule" value={pet.feeding_schedule} />
            <TextBlock label="How to feed" value={pet.feeding_instructions} />
            {hasContent(pet.do_not_feed) && (
              <div style={S.warningBlock}>
                <p style={S.warningLabel}>🚫 DO NOT feed these foods</p>
                <p style={S.warningText}>{pet.do_not_feed}</p>
              </div>
            )}
          </Section>
        )}

        {/* ── Medication ───────────────────────────────────────────────────────── */}
        {hasMedication && (
          <Section emoji="💊" title="Medications" color="#f97316">
            <TextBlock
              label="Medication instructions"
              value={pet.medication_instructions}
              highlight
            />
          </Section>
        )}

        {/* ── Daily Routine ────────────────────────────────────────────────────── */}
        {hasRoutine && (
          <Section emoji="📅" title="Daily Routine" color="#0ea5e9">
            <TextBlock label="Typical daily routine" value={pet.daily_routine} />
          </Section>
        )}

        {/* ── Red Flags ────────────────────────────────────────────────────────── */}
        {hasEmergency && (
          <Section emoji="⚠️" title="Red Flags — If This Happens, Do This" color="#ef4444">
            {hasContent(pet.warning_signs) && (
              <div style={S.redFlagBlock}>
                <p style={S.redFlagLabel}>Warning signs to watch for</p>
                <p style={S.redFlagText}>{pet.warning_signs}</p>
              </div>
            )}
            {hasContent(pet.emergency_steps) && (
              <div style={{ ...S.redFlagBlock, background: '#fef2f2', borderColor: '#ef4444' }}>
                <p style={{ ...S.redFlagLabel, color: '#991b1b' }}>Emergency steps to follow</p>
                <p style={S.redFlagText}>{pet.emergency_steps}</p>
              </div>
            )}
            <div style={S.decisionFlow}>
              <p style={S.decisionTitle}>Quick Decision Guide</p>
              {[
                { condition: 'Not breathing / collapsed', action: 'Go to emergency vet NOW. Call on the way.', urgent: true },
                { condition: 'Blood in vomit or stool', action: 'Go to emergency vet NOW.', urgent: true },
                { condition: 'Seizure or unresponsive', action: 'Go to emergency vet NOW.', urgent: true },
                { condition: 'Not eating for 24+ hours', action: 'Call the vet today.', urgent: false },
                { condition: 'Vomiting more than twice', action: 'Call the vet today.', urgent: false },
                { condition: 'Limping or unable to walk', action: 'Call the vet today.', urgent: false },
                { condition: 'Seems off but stable', action: 'Call the owner first.', urgent: false },
              ].map((item, i) => (
                <div key={i} style={{
                  ...S.decisionRow,
                  background: item.urgent ? '#fef2f2' : '#f9fafb',
                  borderLeft: `3px solid ${item.urgent ? '#ef4444' : '#9ca3af'}`,
                }}>
                  <span style={S.decisionCondition}>If: {item.condition}</span>
                  <span style={{ ...S.decisionAction, color: item.urgent ? '#dc2626' : '#374151' }}>
                    → {item.action}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Vet & Authorization ──────────────────────────────────────────────── */}
        {hasVet && (
          <Section emoji="🏥" title="Vet & Medical Authorization" color="#7c3aed">
            <div style={S.fieldGrid}>
              <Field label="Primary vet" value={pet.primary_vet} />
              <Field label="Vet clinic" value={pet.vet_clinic} />
              <Field label="Vet phone" value={pet.vet_phone} />
              <Field label="Emergency vet" value={pet.emergency_vet} />
            </div>
            <div style={S.authBlock}>
              <p style={S.authText}>
                I authorize the guardian named on this document to seek emergency veterinary treatment
                for <strong>{pet.name}</strong> if I cannot be reached.
              </p>
              <div style={S.authSignRow}>
                <div style={S.authSignField}>
                  <div style={S.authSignLine} />
                  <p style={S.authSignLabel}>Owner signature</p>
                </div>
                <div style={S.authSignField}>
                  <div style={S.authSignLine} />
                  <p style={S.authSignLabel}>Date</p>
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* ── Quick View Fridge Sheet — always on new page when printed ────────── */}
        <div style={S.quickView} className="doc-fridge-sheet">
          <p style={S.quickViewTitle}>📋 Quick View — Fridge Sheet</p>
          <p style={S.quickViewSub}>Cut or screenshot this section and stick it on the fridge.</p>
          <div style={S.quickGrid}>
            <div style={S.quickCell}>
              <p style={S.quickLabel}>Pet</p>
              <p style={S.quickVal}>{pet.name} ({pet.breed || pet.species})</p>
            </div>
            <div style={S.quickCell}>
              <p style={S.quickLabel}>Owner</p>
              <p style={S.quickVal}>{ownerName || '—'}</p>
            </div>
            <div style={S.quickCell}>
              <p style={S.quickLabel}>Owner phone</p>
              <p style={S.quickVal}>{ownerPhone || '—'}</p>
            </div>
            <div style={S.quickCell}>
              <p style={S.quickLabel}>Vet phone</p>
              <p style={S.quickVal}>{pet.vet_phone || '—'}</p>
            </div>
            <div style={S.quickCell}>
              <p style={S.quickLabel}>Microchip</p>
              <p style={S.quickVal}>{pet.microchip || '—'}</p>
            </div>
            <div style={S.quickCell}>
              <p style={S.quickLabel}>Feeds</p>
              <p style={S.quickVal}>{pet.feeding_schedule || '—'}</p>
            </div>
            <div style={S.quickCell}>
              <p style={S.quickLabel}>Do NOT feed</p>
              <p style={S.quickVal}>{pet.do_not_feed || '—'}</p>
            </div>
            <div style={S.quickCell}>
              <p style={S.quickLabel}>Medication</p>
              <p style={S.quickVal}>{pet.medication_instructions || 'None'}</p>
            </div>
            <div style={S.quickCell}>
              <p style={S.quickLabel}>Red flags</p>
              <p style={S.quickVal}>{pet.warning_signs || 'See full document'}</p>
            </div>
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────────── */}
        <p style={S.footer}>
          Generated by VuraPet · Your Pet's Lifetime Companion · This document is private and intended for the named guardian only.
        </p>

      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  doc: {
    maxWidth: 800,
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#111827',
    padding: '0 0 48px',
  },
  printHeader: {
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
    marginBottom: 16,
    borderBottom: '2px solid #f97316',
  },
  docHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  docHeaderLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  petAvatar: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: '#fff7ed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
    border: '3px solid #f97316',
  },
  petPhoto: { width: '100%', height: '100%', objectFit: 'cover' },
  petName: { fontSize: 22, fontWeight: 800, margin: '0 0 4px', color: '#111827' },
  petMeta: { fontSize: 13, color: '#6b7280', margin: '0 0 4px' },
  ownerLine: { fontSize: 13, color: '#374151', margin: 0 },
  ownerPhone: { color: '#f97316', textDecoration: 'none', fontWeight: 600 },
  printBtn: {
    background: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '10px 18px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  emergencyBanner: {
    background: '#111827',
    borderRadius: 16,
    padding: '16px 20px',
    marginBottom: 20,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap',
  },
  emergencyBannerLeft: { display: 'flex', alignItems: 'center', gap: 12, flex: 1 },
  emergencyBannerTitle: { fontSize: 15, fontWeight: 800, color: '#fff', margin: 0 },
  emergencyBannerSub: { fontSize: 12, color: '#9ca3af', margin: 0 },
  emergencyContacts: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  emergencyContactBtn: {
    background: '#f97316',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 700,
    textDecoration: 'none',
    display: 'block',
    lineHeight: 1.4,
  },
  emergencyContactNum: { fontWeight: 400, fontSize: 11 },
  section: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderLeft: '4px solid',
    borderRadius: 14,
    padding: '18px 20px',
    marginBottom: 16,
  },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: 800, margin: 0 },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px 24px',
    marginBottom: 12,
  },
  field: { marginBottom: 8 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'block',
    marginBottom: 2,
  },
  fieldValue: { fontSize: 14, color: '#111827', fontWeight: 500 },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: {
    background: '#fef2f2',
    color: '#991b1b',
    fontSize: 12,
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 20,
    border: '1px solid #fca5a5',
  },
  textBlock: {
    borderRadius: 10,
    padding: '12px 14px',
    marginBottom: 10,
  },
  textBlockLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 6px',
  },
  textBlockValue: { fontSize: 14, color: '#111827', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' },
  warningBlock: {
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    borderRadius: 10,
    padding: '12px 14px',
    marginBottom: 10,
  },
  warningLabel: { fontSize: 13, fontWeight: 800, color: '#991b1b', margin: '0 0 6px' },
  warningText: { fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.6 },
  redFlagBlock: {
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: 10,
    padding: '12px 14px',
    marginBottom: 10,
  },
  redFlagLabel: { fontSize: 13, fontWeight: 800, color: '#92400e', margin: '0 0 6px' },
  redFlagText: { fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' },
  decisionFlow: {
    background: '#f9fafb',
    borderRadius: 12,
    padding: '14px',
    marginTop: 10,
  },
  decisionTitle: { fontSize: 13, fontWeight: 800, color: '#374151', margin: '0 0 10px' },
  decisionRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '8px 12px',
    borderRadius: 8,
    marginBottom: 6,
  },
  decisionCondition: { fontSize: 13, color: '#374151', fontWeight: 600 },
  decisionAction: { fontSize: 13, fontWeight: 700 },
  authBlock: {
    background: '#f9fafb',
    border: '1px dashed #d1d5db',
    borderRadius: 10,
    padding: '14px',
    marginTop: 10,
  },
  authText: { fontSize: 13, color: '#374151', margin: '0 0 16px', lineHeight: 1.6, fontStyle: 'italic' },
  authSignRow: { display: 'flex', gap: 24 },
  authSignField: { flex: 1 },
  authSignLine: { height: 1, background: '#374151', marginBottom: 6 },
  authSignLabel: { fontSize: 11, color: '#6b7280', margin: 0 },
  guideGrid: { display: 'flex', flexDirection: 'column', gap: 10 },
  guideStep: { display: 'flex', alignItems: 'flex-start', gap: 12 },
  guideIcon: { fontSize: 22, flexShrink: 0, marginTop: 2 },
  guideTime: { fontSize: 12, fontWeight: 700, color: '#f97316', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  guideText: { fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.5 },
  quickView: {
    border: '2px dashed #d1d5db',
    borderRadius: 16,
    padding: '18px 20px',
    marginTop: 24,
    background: '#f9fafb',
  },
  quickViewTitle: { fontSize: 15, fontWeight: 800, color: '#111827', margin: '0 0 4px' },
  quickViewSub: { fontSize: 12, color: '#6b7280', margin: '0 0 14px' },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  quickCell: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '10px 12px',
  },
  quickLabel: { fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 3px' },
  quickVal: { fontSize: 13, color: '#111827', fontWeight: 500, margin: 0, lineHeight: 1.4 },
  footer: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 32,
    paddingTop: 16,
    borderTop: '1px solid #e5e7eb',
  },
};