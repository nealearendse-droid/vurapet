'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type VaccineEntry = {
  id: string;
  pet_id: string;
  vaccine_name: string;
  date_given: string;
  next_due_date: string | null;
  vet_name: string | null;
  batch_number: string | null;
  notes: string | null;
};

const COMMON_VACCINES = [
  { name: 'Rabies', intervalMonths: 12 },
  { name: 'DHPP (Distemper/Parvo)', intervalMonths: 12 },
  { name: 'Bordetella', intervalMonths: 6 },
  { name: 'Leptospirosis', intervalMonths: 12 },
  { name: 'FVRCP (Cat combo)', intervalMonths: 12 },
  { name: 'FeLV (Feline Leukemia)', intervalMonths: 12 },
  { name: 'Kennel Cough', intervalMonths: 6 },
  { name: 'Other', intervalMonths: 12 },
];

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getStatusInfo(daysUntil: number): { label: string; color: string; bg: string; border: string; priority: number } {
  if (daysUntil < 0)   return { label: 'Overdue',    color: '#fc8181', bg: 'rgba(252,129,129,0.08)', border: 'rgba(252,129,129,0.25)', priority: 0 };
  if (daysUntil === 0) return { label: 'Due today',  color: '#fc8181', bg: 'rgba(252,129,129,0.08)', border: 'rgba(252,129,129,0.25)', priority: 1 };
  if (daysUntil <= 7)  return { label: 'Due soon',   color: '#f6ad55', bg: 'rgba(246,173,85,0.08)',  border: 'rgba(246,173,85,0.25)',  priority: 2 };
  if (daysUntil <= 30) return { label: 'Coming up',  color: '#f6e05e', bg: 'rgba(246,224,94,0.06)',  border: 'rgba(246,224,94,0.2)',   priority: 3 };
  return                       { label: 'Up to date', color: '#68d391', bg: 'rgba(104,211,145,0.07)', border: 'rgba(104,211,145,0.2)',  priority: 4 };
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export default function VaccinationTracker({ petId }: { petId: string }) {
  const supabase = createSupabaseBrowserClient();

  const [entries, setEntries] = useState<VaccineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'history'>('timeline');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [vaccineName, setVaccineName] = useState('');
  const [customName, setCustomName] = useState('');
  const [dateGiven, setDateGiven] = useState(() => new Date().toISOString().slice(0, 10));
  const [nextDue, setNextDue] = useState('');
  const [vetName, setVetName] = useState('');
  const [batchNum, setBatchNum] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => { setMounted(true); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('vaccinations')
      .select('*')
      .eq('pet_id', petId)
      .order('date_given', { ascending: false });
    setEntries(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [petId]);

  function handleVaccineSelect(name: string) {
    setVaccineName(name);
    if (name !== 'Other') {
      const vax = COMMON_VACCINES.find(v => v.name === name);
      if (vax && dateGiven) setNextDue(addMonths(dateGiven, vax.intervalMonths));
    }
  }

  function handleDateGivenChange(val: string) {
    setDateGiven(val);
    if (vaccineName && vaccineName !== 'Other') {
      const vax = COMMON_VACCINES.find(v => v.name === vaccineName);
      if (vax) setNextDue(addMonths(val, vax.intervalMonths));
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const finalName = vaccineName === 'Other' ? customName : vaccineName;
    if (!finalName || !dateGiven) return;
    setSaving(true);
    await supabase.from('vaccinations').insert({
      pet_id: petId,
      vaccine_name: finalName,
      date_given: dateGiven,
      next_due_date: nextDue || null,
      vet_name: vetName || null,
      batch_number: batchNum || null,
      notes: notes || null,
    });
    setSaving(false);
    setShowForm(false);
    setVaccineName(''); setCustomName(''); setNextDue('');
    setVetName(''); setBatchNum(''); setNotes('');
    await load();
  }

  // Sort for timeline: overdue first, then soonest due
  const withDue = entries.filter(e => e.next_due_date);
  const noDue   = entries.filter(e => !e.next_due_date);

  const sortedTimeline = [...withDue].sort((a, b) => {
    const da = getDaysUntil(a.next_due_date!);
    const db = getDaysUntil(b.next_due_date!);
    const pa = getStatusInfo(da).priority;
    const pb = getStatusInfo(db).priority;
    return pa !== pb ? pa - pb : da - db;
  });

  const overdueCount   = withDue.filter(e => getDaysUntil(e.next_due_date!) < 0).length;
  const dueSoonCount   = withDue.filter(e => { const d = getDaysUntil(e.next_due_date!); return d >= 0 && d <= 7; }).length;
  const upToDateCount  = withDue.filter(e => getDaysUntil(e.next_due_date!) > 30).length;

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Space+Grotesk:wght@400;500;600&display=swap');

        .vt-root {
          font-family: 'Space Grotesk', sans-serif;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          overflow: hidden;
          position: relative;
        }

        .vt-root::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(104,211,145,0.5), rgba(99,179,237,0.3), transparent);
        }

        /* Header */
        .vt-header {
          padding: 1.75rem 2rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }

        .vt-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          letter-spacing: -0.02em;
          margin-bottom: 2px;
        }
        .vt-subtitle { font-size: 0.78rem; color: rgba(255,255,255,0.3); }

        .vt-add-btn {
          background: linear-gradient(135deg, #38a169, #2b6cb0);
          border: none;
          border-radius: 10px;
          padding: 0.55rem 1.1rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Space Grotesk', sans-serif;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 14px rgba(56,161,105,0.25);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .vt-add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(56,161,105,0.35); }

        /* Alert bar */
        .vt-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 2rem;
          background: rgba(252,129,129,0.06);
          border-bottom: 1px solid rgba(252,129,129,0.15);
          font-size: 0.82rem;
          color: #fc8181;
          font-weight: 500;
        }
        .vt-alert-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #fc8181;
          animation: vt-pulse 1.8s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes vt-pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }

        /* Summary stats */
        .vt-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .vt-stat {
          padding: 1.1rem 1.5rem;
          text-align: center;
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .vt-stat:last-child { border-right: none; }
        .vt-stat-num {
          font-family: 'Outfit', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          margin-bottom: 3px;
        }
        .vt-stat-lbl {
          font-size: 0.65rem;
          font-weight: 600;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* Tabs */
        .vt-tabs {
          display: flex;
          gap: 0;
          padding: 0 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .vt-tab {
          padding: 0.9rem 1rem 0.75rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
          letter-spacing: 0.02em;
          background: none;
          border-top: none;
          border-left: none;
          border-right: none;
          font-family: 'Space Grotesk', sans-serif;
        }
        .vt-tab:hover { color: rgba(255,255,255,0.6); }
        .vt-tab.active {
          color: #68d391;
          border-bottom-color: #68d391;
        }

        /* Form */
        .vt-form-wrap {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(104,211,145,0.02);
          animation: vt-slide-down 0.2s ease;
        }
        @keyframes vt-slide-down {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .vt-form-title {
          font-size: 0.7rem;
          font-weight: 600;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
        }

        .vt-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        @media (max-width: 560px) { .vt-form-grid { grid-template-columns: 1fr; } }

        .vt-field label {
          display: block;
          font-size: 0.68rem;
          font-weight: 600;
          color: rgba(255,255,255,0.28);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.35rem;
        }

        .vt-select, .vt-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 0.6rem 0.9rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: white;
          outline: none;
          transition: all 0.2s;
          font-family: 'Space Grotesk', sans-serif;
        }
        .vt-select option { background: #1a1a2e; color: white; }
        .vt-input::placeholder { color: rgba(255,255,255,0.18); }
        .vt-select:focus, .vt-input:focus {
          border-color: rgba(104,211,145,0.4);
          background: rgba(104,211,145,0.04);
          box-shadow: 0 0 0 3px rgba(104,211,145,0.07);
        }
        .vt-input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.4); cursor: pointer;
        }

        .vt-form-actions {
          display: flex;
          gap: 0.6rem;
          margin-top: 0.75rem;
        }

        .vt-save-btn {
          flex: 1;
          background: linear-gradient(135deg, #38a169, #2b6cb0);
          border: none; border-radius: 10px;
          padding: 0.7rem 1.5rem;
          font-size: 0.85rem; font-weight: 700;
          color: white; cursor: pointer;
          transition: all 0.2s;
          font-family: 'Space Grotesk', sans-serif;
          box-shadow: 0 4px 14px rgba(56,161,105,0.2);
        }
        .vt-save-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .vt-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .vt-cancel-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 0.7rem 1.1rem;
          font-size: 0.85rem; font-weight: 600;
          color: rgba(255,255,255,0.3); cursor: pointer;
          transition: all 0.2s;
          font-family: 'Space Grotesk', sans-serif;
        }
        .vt-cancel-btn:hover { color: rgba(255,255,255,0.5); border-color: rgba(255,255,255,0.14); }

        /* Timeline */
        .vt-body { padding: 1.5rem 2rem; }
        .vt-section-title {
          font-size: 0.68rem;
          font-weight: 600;
          color: rgba(255,255,255,0.22);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
        }

        .vt-timeline { position: relative; }
        .vt-timeline::before {
          content: '';
          position: absolute;
          left: 11px; top: 0; bottom: 0;
          width: 1px;
          background: rgba(255,255,255,0.06);
        }

        .vt-item {
          display: flex;
          gap: 1.25rem;
          padding: 0.85rem 0.85rem 0.85rem 0;
          cursor: pointer;
          border-radius: 12px;
          transition: background 0.15s;
          margin-bottom: 0.25rem;
          position: relative;
        }
        .vt-item:hover { background: rgba(255,255,255,0.02); }

        .vt-timeline-dot {
          width: 24px; height: 24px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          position: relative;
          z-index: 1;
          margin-top: 2px;
        }

        .vt-item-main { flex: 1; min-width: 0; }

        .vt-item-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 3px;
        }

        .vt-item-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          line-height: 1.3;
        }

        .vt-status-pill {
          flex-shrink: 0;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 100px;
          border: 1px solid;
        }

        .vt-item-meta {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.3);
          line-height: 1.5;
        }

        .vt-item-expanded {
          margin-top: 0.6rem;
          padding: 0.75rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          font-size: 0.78rem;
          color: rgba(255,255,255,0.4);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.4rem 1rem;
          animation: vt-slide-down 0.15s ease;
        }
        .vt-detail-row { display: flex; flex-direction: column; gap: 1px; }
        .vt-detail-key { font-size: 0.65rem; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 0.07em; }
        .vt-detail-val { color: rgba(255,255,255,0.6); font-weight: 500; }

        /* History list */
        .vt-hist-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.7rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .vt-hist-item:last-child { border-bottom: none; }
        .vt-hist-name { font-size: 0.88rem; font-weight: 600; color: rgba(255,255,255,0.75); }
        .vt-hist-date { font-size: 0.75rem; color: rgba(255,255,255,0.3); margin-top: 1px; }
        .vt-hist-vet  { font-size: 0.72rem; color: rgba(255,255,255,0.2); }

        .vt-empty {
          padding: 3rem 2rem; text-align: center;
          color: rgba(255,255,255,0.2); font-size: 0.88rem;
        }
        .vt-empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; opacity: 0.35; }

        .vt-loading {
          padding: 2rem; text-align: center;
          color: rgba(255,255,255,0.2); font-size: 0.85rem;
        }
      `}</style>

      <div className="vt-root">

        {/* Header */}
        <div className="vt-header">
          <div>
            <div className="vt-title">💉 Vaccination Tracker</div>
            <div className="vt-subtitle">Track vaccines, due dates &amp; vet records</div>
          </div>
          <button className="vt-add-btn" onClick={() => setShowForm(f => !f)}>
            {showForm ? '✕ Cancel' : '+ Add vaccine'}
          </button>
        </div>

        {/* Overdue alert */}
        {overdueCount > 0 && (
          <div className="vt-alert">
            <div className="vt-alert-dot" />
            <span>{overdueCount} vaccine{overdueCount > 1 ? 's are' : ' is'} overdue — book a vet visit soon</span>
          </div>
        )}

        {/* Stats */}
        {!loading && entries.length > 0 && (
          <div className="vt-stats">
            <div className="vt-stat">
              <div className="vt-stat-num" style={{ color: '#68d391' }}>{upToDateCount}</div>
              <div className="vt-stat-lbl">Up to date</div>
            </div>
            <div className="vt-stat">
              <div className="vt-stat-num" style={{ color: '#f6ad55' }}>{dueSoonCount}</div>
              <div className="vt-stat-lbl">Due soon</div>
            </div>
            <div className="vt-stat">
              <div className="vt-stat-num" style={{ color: '#fc8181' }}>{overdueCount}</div>
              <div className="vt-stat-lbl">Overdue</div>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="vt-form-wrap">
            <div className="vt-form-title">New vaccine record</div>
            <form onSubmit={handleSave}>
              <div className="vt-form-grid">
                <div className="vt-field" style={{ gridColumn: 'span 2' }}>
                  <label>Vaccine</label>
                  <select className="vt-select" value={vaccineName} onChange={e => handleVaccineSelect(e.target.value)} required>
                    <option value="">Select vaccine…</option>
                    {COMMON_VACCINES.map(v => (
                      <option key={v.name} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>

                {vaccineName === 'Other' && (
                  <div className="vt-field" style={{ gridColumn: 'span 2' }}>
                    <label>Vaccine name</label>
                    <input className="vt-input" placeholder="Enter vaccine name" value={customName} onChange={e => setCustomName(e.target.value)} required />
                  </div>
                )}

                <div className="vt-field">
                  <label>Date given</label>
                  <input className="vt-input" type="date" value={dateGiven} onChange={e => handleDateGivenChange(e.target.value)} required />
                </div>
                <div className="vt-field">
                  <label>Next due date</label>
                  <input className="vt-input" type="date" value={nextDue} onChange={e => setNextDue(e.target.value)} />
                </div>
                <div className="vt-field">
                  <label>Vet / Clinic</label>
                  <input className="vt-input" placeholder="Dr. Smith / Animal Clinic" value={vetName} onChange={e => setVetName(e.target.value)} />
                </div>
                <div className="vt-field">
                  <label>Batch number</label>
                  <input className="vt-input" placeholder="e.g. B2024-001" value={batchNum} onChange={e => setBatchNum(e.target.value)} />
                </div>
                <div className="vt-field" style={{ gridColumn: 'span 2' }}>
                  <label>Notes</label>
                  <input className="vt-input" placeholder="Any reactions, reminders…" value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
              </div>
              <div className="vt-form-actions">
                <button className="vt-cancel-btn" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="vt-save-btn" type="submit" disabled={saving}>
                  {saving ? 'Saving…' : '💉 Save vaccine record'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="vt-tabs">
          <button className={`vt-tab ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>
            Schedule
          </button>
          <button className={`vt-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            Full history
          </button>
        </div>

        {/* Body */}
        <div className="vt-body">
          {loading ? (
            <div className="vt-loading">Loading vaccine records…</div>
          ) : entries.length === 0 ? (
            <div className="vt-empty">
              <span className="vt-empty-icon">💉</span>
              No vaccines recorded yet.<br />Add the first one above.
            </div>
          ) : activeTab === 'timeline' ? (
            <div>
              <div className="vt-section-title">Upcoming &amp; status</div>
              {sortedTimeline.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.25)' }}>No due dates set. Edit records to add them.</p>
              ) : (
                <div className="vt-timeline">
                  {sortedTimeline.map(entry => {
                    const days = getDaysUntil(entry.next_due_date!);
                    const status = getStatusInfo(days);
                    const isExpanded = expandedId === entry.id;
                    return (
                      <div key={entry.id} className="vt-item" onClick={() => setExpandedId(isExpanded ? null : entry.id)}>
                        <div className="vt-timeline-dot" style={{ background: status.bg, border: `1.5px solid ${status.border}` }}>
                          <span style={{ color: status.color, fontSize: '10px' }}>
                            {days < 0 ? '!' : days === 0 ? '!' : days <= 7 ? '↑' : '✓'}
                          </span>
                        </div>
                        <div className="vt-item-main">
                          <div className="vt-item-top">
                            <div className="vt-item-name">{entry.vaccine_name}</div>
                            <div className="vt-status-pill" style={{ color: status.color, background: status.bg, borderColor: status.border }}>
                              {status.label}
                            </div>
                          </div>
                          <div className="vt-item-meta">
                            Due {formatDate(entry.next_due_date!)}
                            {days >= 0
                              ? ` · in ${days === 0 ? 'today' : `${days} day${days !== 1 ? 's' : ''}`}`
                              : ` · ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`}
                            {entry.vet_name && ` · ${entry.vet_name}`}
                          </div>
                          {isExpanded && (
                            <div className="vt-item-expanded">
                              <div className="vt-detail-row">
                                <span className="vt-detail-key">Date given</span>
                                <span className="vt-detail-val">{formatDate(entry.date_given)}</span>
                              </div>
                              {entry.vet_name && (
                                <div className="vt-detail-row">
                                  <span className="vt-detail-key">Vet / Clinic</span>
                                  <span className="vt-detail-val">{entry.vet_name}</span>
                                </div>
                              )}
                              {entry.batch_number && (
                                <div className="vt-detail-row">
                                  <span className="vt-detail-key">Batch no.</span>
                                  <span className="vt-detail-val">{entry.batch_number}</span>
                                </div>
                              )}
                              {entry.notes && (
                                <div className="vt-detail-row" style={{ gridColumn: 'span 2' }}>
                                  <span className="vt-detail-key">Notes</span>
                                  <span className="vt-detail-val">{entry.notes}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Entries without due dates */}
              {noDue.length > 0 && (
                <>
                  <div className="vt-section-title" style={{ marginTop: '1.5rem' }}>No due date set</div>
                  {noDue.map(entry => (
                    <div key={entry.id} className="vt-item" onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}>
                      <div className="vt-timeline-dot" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>—</span>
                      </div>
                      <div className="vt-item-main">
                        <div className="vt-item-top">
                          <div className="vt-item-name">{entry.vaccine_name}</div>
                        </div>
                        <div className="vt-item-meta">Given {formatDate(entry.date_given)}{entry.vet_name && ` · ${entry.vet_name}`}</div>
                        {expandedId === entry.id && (
                          <div className="vt-item-expanded">
                            {entry.batch_number && (
                              <div className="vt-detail-row">
                                <span className="vt-detail-key">Batch no.</span>
                                <span className="vt-detail-val">{entry.batch_number}</span>
                              </div>
                            )}
                            {entry.notes && (
                              <div className="vt-detail-row" style={{ gridColumn: 'span 2' }}>
                                <span className="vt-detail-key">Notes</span>
                                <span className="vt-detail-val">{entry.notes}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            /* History tab */
            <div>
              <div className="vt-section-title">All records — newest first</div>
              {entries.map(entry => (
                <div key={entry.id} className="vt-hist-item">
                  <div>
                    <div className="vt-hist-name">{entry.vaccine_name}</div>
                    <div className="vt-hist-date">Given {formatDate(entry.date_given)}
                      {entry.next_due_date && ` · Next due ${formatDate(entry.next_due_date)}`}
                    </div>
                    {entry.vet_name && <div className="vt-hist-vet">{entry.vet_name}{entry.batch_number && ` · Batch ${entry.batch_number}`}</div>}
                  </div>
                  {entry.next_due_date && (() => {
                    const days = getDaysUntil(entry.next_due_date);
                    const s = getStatusInfo(days);
                    return (
                      <div className="vt-status-pill" style={{ color: s.color, background: s.bg, borderColor: s.border }}>
                        {s.label}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

