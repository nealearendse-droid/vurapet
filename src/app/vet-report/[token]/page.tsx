import { getVetReportData } from '@/lib/vetReport'
import { notFound } from 'next/navigation'
import PrintButton from '@/components/PrintButton'

export const dynamic = 'force-dynamic'

export default async function VetReportPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const report = await getVetReportData(token)
  if (!report) notFound()

  const { pet, period, totalMeals, compliancePct, concerningWaterDays, totalLoggedDays, stoolAvg, weightChangeKg, weightChangePct, feedingAlerts, weightAlert } = report as any

  const photoUrl = pet.profile_photo_url || pet.photo_url
  const fromDate = new Date(period.from).toLocaleDateString('en-ZA', { dateStyle: 'medium' })
  const toDate = new Date(period.to).toLocaleDateString('en-ZA', { dateStyle: 'medium' })

  const stoolLabel = stoolAvg == null ? 'No data'
    : stoolAvg <= 1.5 ? 'Hard'
    : stoolAvg <= 2.5 ? 'Firm'
    : stoolAvg <= 3.5 ? 'Soft'
    : stoolAvg <= 4.5 ? 'Mushy'
    : 'Watery'

  return (
    <main className="vet-report-page" style={{ minHeight: '100vh', background: '#0f1117', color: '#1a1a1a', fontFamily: 'system-ui, sans-serif', paddingBottom: 60 }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .vet-report-page { background: #ffffff !important; }
          .vr-card { background: #ffffff !important; border: 1px solid #ddd !important; color: #000 !important; }
          .vr-hero { background: #ffffff !important; border-bottom: 2px solid #333 !important; }
        }
      `}</style>

      {/* ── PRINT BUTTON (hidden on print) ── */}
      <div className="no-print" style={{ padding: '16px 24px', textAlign: 'right' }}>
        <PrintButton />
      </div>

      {/* ── HERO ── */}
      <div className="vr-hero" style={{ background: 'linear-gradient(135deg, #0a1a12 0%, #0f1117 100%)', borderBottom: '3px solid #16a34a', padding: '32px 24px', textAlign: 'center', color: '#fff' }}>
        <div style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: '4px solid #16a34a', background: '#1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {photoUrl
            ? <img src={photoUrl} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 44 }}>🐾</span>}
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: '0 0 6px' }}>{pet.name}'s Vet Report</h1>
        <p style={{ fontSize: 15, color: '#aaa', margin: 0 }}>
          {[pet.breed, pet.species].filter(Boolean).join(' · ')}
        </p>
        <p style={{ fontSize: 13, color: '#888', marginTop: 10 }}>
          {fromDate} — {toDate}
        </p>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px' }}>

        <div className="vr-card" style={{ background: '#1a1a1a', borderRadius: 14, padding: '20px', color: '#f0f0f0', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Feeding Compliance</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#5dcaa5' }}>
            {compliancePct != null ? `${compliancePct}%` : 'No data yet'}
          </div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
            Bowl fully cleared in {totalMeals > 0 ? `${Math.round((compliancePct! / 100) * totalMeals)} of ${totalMeals}` : '0 of 0'} logged meals
          </div>
        </div>

        <div className="vr-card" style={{ background: '#1a1a1a', borderRadius: 14, padding: '20px', color: '#f0f0f0', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Water Intake</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: concerningWaterDays >= 7 ? '#f59e0b' : '#5dcaa5' }}>
            {totalLoggedDays > 0 ? `${concerningWaterDays} of ${totalLoggedDays} days showed increased drinking` : 'No data yet'}
          </div>
        </div>

        <div className="vr-card" style={{ background: '#1a1a1a', borderRadius: 14, padding: '20px', color: '#f0f0f0', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Stool Quality (avg)</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f0f0f0' }}>
            {stoolLabel}{stoolAvg != null ? ` (${stoolAvg}/5)` : ''}
          </div>
        </div>

        <div className="vr-card" style={{ background: '#1a1a1a', borderRadius: 14, padding: '20px', color: '#f0f0f0', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Weight Change (30 days)</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f0f0f0' }}>
            {weightChangeKg != null ? `${weightChangeKg > 0 ? '+' : ''}${weightChangeKg} kg (${weightChangePct! > 0 ? '+' : ''}${weightChangePct}%)` : 'Not enough data yet'}
          </div>
        </div>

        <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #222', textAlign: 'center', fontSize: 12, color: '#555' }}>
          Generated by <strong style={{ color: '#888' }}>VuraPet</strong> — {toDate}
        </div>

      </div>
    </main>
  )
}