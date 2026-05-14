'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ─── Types ────────────────────────────────────────────────────────────────────

type Guardian = {
  id: string;
  pet_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  access_level: string;
  token: string;
  created_at: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES = [
  { value: 'primary',    label: '👑 Primary Guardian',    desc: 'Full access — health, feeding, routine, memories, vet contacts' },
  { value: 'vet',        label: '🏥 Vet / Medical',        desc: 'Health records, vaccines, medications, emergency contacts' },
  { value: 'pet_sitter', label: '🏠 Pet Sitter / Friend',  desc: 'Feeding plan, daily routine, emergency contacts' },
  { value: 'family',     label: '👨‍👩‍👧 Family / Memorial',   desc: 'Memory book, photos, personality notes' },
];

const ACCESS_LEVEL: Record<string, string> = {
  primary:    'Full access — health, nutrition, routine, memory book, vet contacts',
  vet:        'Medical access — health records, vaccines, medications',
  pet_sitter: 'Care access — feeding, routine, emergency contacts',
  family:     'Memory access — photos, milestones, personality',
};

function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 12; i++) token += chars[Math.floor(Math.random() * chars.length)];
  return token;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GuardianSystem({ petId, petName }: { petId: string; petName: string }) {
  const supabase = getSupabaseClient();

  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('pet_sitter');

  // ── Data loading ────────────────────────────────────────────────────────────

  async function loadGuardians() {
    setLoading(true);
    const { data, error } = await supabase
      .from('guardians')
      .select('*')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false });

    if (!error) setGuardians(data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (petId) loadGuardians();
  }, [petId]);

  // ── Add guardian ────────────────────────────────────────────────────────────

  async function addGuardian(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    // Get current user id
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? null;

    const token = generateToken();
    const { error } = await supabase.from('guardians').insert({
      pet_id:       petId,
      user_id:      userId,
      name:         name.trim(),
      email:        email.trim() || null,
      phone:        phone.trim() || null,
      role:         role,
      access_level: ACCESS_LEVEL[role] || ACCESS_LEVEL['pet_sitter'],
      token:        token,
      is_active:    true,
    });

    setSaving(false);
    if (error) { alert(error.message); return; }

    setName(''); setEmail(''); setPhone(''); setRole('pet_sitter');
    setShowForm(false);
    await loadGuardians();
  }

  // ── Delete guardian ─────────────────────────────────────────────────────────

  async function deleteGuardian(guardianId: string) {
    if (!confirm('Remove this guardian? Their link will stop working immediately.')) return;
    const { error } = await supabase.from('guardians').delete().eq('id', guardianId);
    if (error) alert(error.message);
    else await loadGuardians();
  }

  // ── Share link helpers ───────────────────────────────────────────────────────

  function getShareLink(guardian: Guardian): string {
    return `${window.location.origin}/guardian/${guardian.token}`;
  }

  async function copyLink(guardian: Guardian) {
    const link = getShareLink(guardian);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(guardian.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      prompt('Copy this link:', link);
    }
  }

  function whatsappShare(guardian: Guardian) {
    const link = getShareLink(guardian);
    const message = encodeURIComponent(
      `Hi ${guardian.name} 👋\n\nI've added you as a guardian for ${petName} on VuraPet.\n\nOpen this secure link to view their care information:\n${link}\n\nPlease keep this link private.`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  }

  // ── PDF download ─────────────────────────────────────────────────────────────

  async function downloadCareCard() {
    setPdfLoading(true);
    const { data: pet, error } = await supabase.from('pets').select('*').eq('id', petId).single();
    if (error || !pet) { alert('Error fetching pet data.'); setPdfLoading(false); return; }

    const doc = new jsPDF() as any;
    const orange = [249, 115, 22];
    const red    = [220, 38, 38];
    const green  = [5, 150, 105];
    const dark   = [17, 24, 39];

    // Header
    doc.setFontSize(20);
    doc.setTextColor(orange[0], orange[1], orange[2]);
    doc.text(`GUARDIAN CARE CARD`, 14, 18);

    doc.setFontSize(14);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text(`${pet.name.toUpperCase()}`, 14, 27);

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`VuraPet Lifetime Companion  ·  Generated ${new Date().toLocaleDateString('en-ZA')}`, 14, 34);

    // Emergency contacts
    doc.autoTable({
      startY: 40,
      head: [['🚨 Emergency Contacts', 'Details']],
      body: [
        ['Primary Vet', pet.primary_vet || 'Not listed'],
        ['Vet Phone', pet.vet_phone || 'Not listed'],
        ['Emergency / 24hr Vet', pet.emergency_vet || 'Not listed'],
        ['Microchip #', pet.microchip || 'Not listed'],
      ],
      headStyles: { fillColor: red },
      alternateRowStyles: { fillColor: [254, 242, 242] },
    });

    // Medical & safety
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 8,
      head: [['💊 Medical & Safety', 'Instructions']],
      body: [
        ['Medications', pet.medication_instructions || 'None'],
        ['Allergies', Array.isArray(pet.allergies) ? pet.allergies.join(', ') : (pet.allergies || 'None')],
        ['Warning Signs', pet.warning_signs || 'Normal behaviour'],
        ['Emergency Steps', pet.emergency_steps || 'Call vet immediately'],
      ],
      headStyles: { fillColor: orange },
      alternateRowStyles: { fillColor: [255, 247, 237] },
    });

    // Feeding & routine
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 8,
      head: [['🥣 Feeding & Daily Routine', 'Details']],
      body: [
        ['Feeding Schedule', pet.feeding_schedule || 'Not listed'],
        ['How to Feed', pet.feeding_instructions || 'None'],
        ['Do NOT Feed', pet.do_not_feed || 'No restrictions noted'],
        ['Daily Routine', pet.daily_routine || 'Not listed'],
        ['Behaviour Notes', pet.behaviour_notes || 'None'],
      ],
      headStyles: { fillColor: green },
      alternateRowStyles: { fillColor: [240, 253, 244] },
    });

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('This document is private and intended for the named guardian only. VuraPet.com', 14, pageHeight - 10);

    doc.save(`${pet.name}_Guardian_Care_Card.pdf`);
    setPdfLoading(false);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const roleInfo = (r: string) => ROLES.find(x => x.value === r) || ROLES[2];

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">🛡️ Guardian System</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Share {petName}'s care plan with trusted people via a secure private link.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${
            showForm
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          {showForm ? 'Cancel' : '+ Add Guardian'}
        </button>
      </div>

      {/* How it works + PDF download */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
        <p className="text-sm font-bold text-orange-800 mb-2">How it works</p>
        <ol className="text-sm text-orange-700 space-y-1 mb-4 list-decimal list-inside">
          <li>Add a guardian — family member, vet, or pet sitter</li>
          <li>Share their unique secure link via WhatsApp or copy it</li>
          <li>They open it without needing an account</li>
          <li>Download the Care Card PDF for your fridge</li>
        </ol>
        <button
          onClick={downloadCareCard}
          disabled={pdfLoading}
          className="w-full bg-white text-orange-700 border border-orange-300 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-50 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          {pdfLoading ? '⏳ Generating...' : '📄 Download Emergency Care Card (PDF)'}
        </button>
      </div>

      {/* Add guardian form */}
      {showForm && (
        <form
          onSubmit={addGuardian}
          className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4"
        >
          <h3 className="font-bold text-gray-900">New Guardian</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sarah Johnson"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                Role *
              </label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="e.g. sarah@email.com"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                placeholder="e.g. 082 000 0000"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Role description */}
          <div className="bg-white border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700">
            {roleInfo(role).desc}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Creating secure link...' : '🛡️ Create Guardian Link'}
          </button>
        </form>
      )}

      {/* Guardian list */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading guardians...</div>
      ) : guardians.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-3">🛡️</div>
          <p className="text-gray-600 font-semibold">No guardians added yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Add a guardian above to generate their secure link.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {guardians.map(guardian => {
            const info = roleInfo(guardian.role);
            return (
              <div
                key={guardian.id}
                className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
              >
                {/* Guardian info */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{guardian.name}</p>
                    <p className="text-sm text-gray-500">{info.label}</p>
                    {guardian.email && <p className="text-xs text-gray-400 mt-0.5">{guardian.email}</p>}
                    {guardian.phone && <p className="text-xs text-gray-400">{guardian.phone}</p>}
                  </div>
                  <button
                    onClick={() => deleteGuardian(guardian.id)}
                    className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
                  >
                    Remove
                  </button>
                </div>

                {/* Share buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => copyLink(guardian)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-bold transition-colors border ${
                      copiedId === guardian.id
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {copiedId === guardian.id ? '✅ Copied!' : '📋 Copy Link'}
                  </button>

                  <button
                    onClick={() => whatsappShare(guardian)}
                    className="py-2.5 px-3 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    💬 WhatsApp
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

