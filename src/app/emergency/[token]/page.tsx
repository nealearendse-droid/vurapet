import { getEmergencyPetData } from '@/lib/emergency'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EmergencyCardPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const pet = await getEmergencyPetData(token)
  if (!pet) notFound()

  const p = pet as any
  const photoUrl = p.profile_photo_url || p.photo_url || p.avatar_url
  const age = p.date_of_birth
    ? Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null
  const updatedAt = p.created_at
    ? new Date(p.updated_at).toLocaleDateString('en-ZA', { dateStyle: 'long' })
    : null

  return (
    <main style={{ minHeight: '100vh', background: '#0f1117', color: '#f0f0f0', fontFamily: 'system-ui, sans-serif', paddingBottom: 60, margin: 0 }}>

      {/* ── EMERGENCY BANNER ── */}
      <div style={{ background: '#dc2626', padding: '14px 24px', textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', color: '#fff' }}>
        🚨 EMERGENCY PET INFORMATION — PLEASE READ CAREFULLY
      </div>

      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(135deg, #1a0000 0%, #2d0a00 50%, #1a0000 100%)', borderBottom: '3px solid #dc2626', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 20px', border: '4px solid #dc2626', background: '#1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {photoUrl
            ? <img src={photoUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 52 }}>🐾</span>}
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 700, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>{p.name}</h1>
        <p style={{ fontSize: 18, color: '#aaa', margin: '0 0 20px' }}>
          {[p.breed, p.species, age ? `${age} yr${age !== 1 ? 's' : ''}` : null, p.sex]
            .filter(Boolean).join(' · ')}
        </p>
        <div style={{ display: 'inline-block', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 999, padding: '8px 24px', fontSize: 15, color: '#fca5a5' }}>
          🏠 I have pets at home — please help them
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px' }}>

        {/* ── EMERGENCY CONTACTS ── */}
        <Section title="📞 Emergency Contacts" color="#dc2626">
          {p.owner_phone && (
            <ContactCard label="Owner's Phone" phone={p.owner_phone} />
          )}
          {p.emergency_vet && (
            <ContactCard label="Emergency Vet" phone={p.emergency_vet} />
          )}
          {p.vet_phone && (
            <ContactCard label="Vet Clinic Phone" phone={p.vet_phone} />
          )}
        </Section>

        {/* ── VET INFO ── */}
        {(p.vet_name || p.vet_clinic || p.primary_vet) && (
          <Section title="🏥 Veterinarian" color="#f59e0b">
            <Row label="Vet" value={p.vet_name || p.primary_vet} />
            <Row label="Clinic" value={p.vet_clinic} />
            <Row label="Phone" value={p.vet_phone} />
            <Row label="Emergency Vet Line" value={p.emergency_vet} highlight />
          </Section>
        )}

        {/* ── PET IDENTITY ── */}
        <Section title="🔖 Pet Identity" color="#6366f1">
          <Row label="Species" value={p.species} />
          <Row label="Breed" value={p.breed} />
          <Row label="Colour" value={p.colour} />
          <Row label="Sex" value={p.sex} />
          <Row label="Weight" value={p.weight ? `${p.weight} kg` : null} />
          <Row label="Microchip Number" value={p.microchip} highlight />
        </Section>

        {/* ── MEDICATIONS ── */}
        {(p.medications || p.medication_instructions) && (
          <Section title="💊 Medications" color="#dc2626">
            <div style={{ padding: '6px 0 10px', fontSize: 13, color: '#ef4444' }}>⚠️ Do not skip or double doses</div>
            {p.medications && <TextBlock value={p.medications} />}
            {p.medication_instructions && <TextBlock label="Instructions" value={p.medication_instructions} />}
          </Section>
        )}

        {/* ── MEDICAL INFO ── */}
        {(p.allergies || p.chronic_conditions || p.red_flags || p.warning_signs) && (
          <Section title="🩺 Medical Information" color="#dc2626">
            {p.allergies && (
              <AlertBox color="#dc2626" label="ALLERGIES" value={p.allergies} />
            )}
            {p.chronic_conditions && <TextBlock label="Chronic Conditions" value={p.chronic_conditions} />}
            {p.red_flags && (
              <AlertBox color="#f59e0b" label="RED FLAGS — Watch for these" value={p.red_flags} />
            )}
            {p.warning_signs && <TextBlock label="Warning Signs" value={p.warning_signs} />}
          </Section>
        )}

        {/* ── FEEDING ── */}
        {(p.feeding_schedule || p.feeding_instructions || p.do_not_feed) && (
          <Section title="🍽️ Feeding" color="#16a34a">
            {p.feeding_schedule && <Row label="Schedule" value={p.feeding_schedule} />}
            {p.feeding_instructions && <TextBlock label="Instructions" value={p.feeding_instructions} />}
            {p.do_not_feed && (
              <AlertBox color="#dc2626" label="DO NOT FEED" value={p.do_not_feed} />
            )}
          </Section>
        )}

        {/* ── BEHAVIOUR & ROUTINE ── */}
        {(p.personality || p.behaviour_notes || p.daily_routine) && (
          <Section title="🐾 Personality & Routine" color="#6366f1">
            {p.personality && <TextBlock label="Personality" value={p.personality} />}
            {p.behaviour_notes && <TextBlock label="Behaviour Notes" value={p.behaviour_notes} />}
            {p.daily_routine && <TextBlock label="Daily Routine" value={p.daily_routine} />}
          </Section>
        )}

        {/* ── EMERGENCY STEPS ── */}
        {p.emergency_steps && (
          <Section title="🚨 Emergency Steps" color="#dc2626">
            <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '16px 18px', fontSize: 17, lineHeight: 1.7, color: '#f0f0f0' }}>
              {p.emergency_steps}
            </div>
          </Section>
        )}

        {/* ── OWNER MESSAGE ── */}
        {p.emergency_message && (
          <Section title="💌 Message from the Owner" color="#a855f7">
            <div style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 12, padding: '20px 24px', fontSize: 18, lineHeight: 1.7, color: '#e2e8f0', fontStyle: 'italic' }}>
              {p.emergency_message}
            </div>
          </Section>
        )}

        {/* ── FOOTER ── */}
        <div style={{ marginTop: 48, paddingTop: 20, borderTop: '1px solid #222', textAlign: 'center', fontSize: 13, color: '#555', lineHeight: 1.8 }}>
          {updatedAt && <div>Last updated: {updatedAt}</div>}
          <div>Powered by <strong style={{ color: '#888' }}>VuraPet</strong> — Your Pet's Lifetime Companion</div>
          <div style={{ marginTop: 8, fontSize: 11, color: '#333' }}>This page is intentionally public so first responders can access it without logging in.</div>
        </div>

      </div>
    </main>
  )
}

// ── Helper Components ──

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 32, borderTop: `2px solid ${color}`, paddingTop: 20 }}>
      <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color, marginBottom: 16 }}>{title}</h2>
      {children}
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value?: string | null; highlight?: boolean }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 18, color: highlight ? '#fbbf24' : '#f0f0f0', fontWeight: highlight ? 600 : 400 }}>{value}</div>
    </div>
  )
}

function TextBlock({ label, value }: { label?: string; value: string }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>}
      <div style={{ fontSize: 17, color: '#ccc', lineHeight: 1.6 }}>{value}</div>
    </div>
  )
}

function AlertBox({ label, value, color }: { label: string; value: string; color: string }) {
  if (!value) return null
  return (
    <div style={{ padding: '12px 16px', background: `${color}18`, borderLeft: `3px solid ${color}`, borderRadius: 6, marginBottom: 12 }}>
      <div style={{ fontSize: 11, color, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 17, color: '#f0f0f0', lineHeight: 1.6 }}>{value}</div>
    </div>
  )
}

function ContactCard({ label, phone }: { label: string; phone: string }) {
  if (!phone) return null
  return (
    <div style={{ background: '#1a1a1a', borderRadius: 10, padding: '14px 16px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 10 }}>
      <div>
        <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 20, color: '#fff', fontWeight: 600 }}>{phone}</div>
      </div>
      <a href={`tel:${phone}`} style={{ padding: '10px 20px', background: '#dc2626', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
        📞 Call Now
      </a>
    </div>
  )
}