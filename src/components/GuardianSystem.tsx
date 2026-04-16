'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

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

const ROLES = [
  { value: 'primary', label: '👑 Primary Guardian', desc: 'Full access to everything' },
  { value: 'vet', label: '🏥 Vet / Medical', desc: 'Health records, vaccines, medications' },
  { value: 'pet_sitter', label: '🏠 Pet Sitter / Friend', desc: 'Feeding plan, routine, emergency contacts' },
  { value: 'family', label: '👨‍👩‍👧 Family / Memorial', desc: 'Memory book, photos, milestones' },
];

function generateToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export default function GuardianSystem({ petId, petName }: { petId: string; petName: string }) {
  const supabase = createSupabaseBrowserClient();

  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('pet_sitter');

  async function loadGuardians() {
    setLoading(true);

    const { data, error } = await supabase
      .from('guardians')
      .select('*')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setGuardians(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (petId) loadGuardians();
  }, [petId]);

  async function addGuardian(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter the guardian\'s name');
      return;
    }

    setSaving(true);

    const token = generateToken();

    const { error } = await supabase.from('guardians').insert({
      pet_id: petId,
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      role: role,
      access_level: role === 'primary' ? 'full' : role === 'vet' ? 'health' : role === 'family' ? 'memory' : 'care',
      token: token,
    });

    setSaving(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    // Reset form
    setName('');
    setEmail('');
    setPhone('');
    setRole('pet_sitter');
    setShowForm(false);

    await loadGuardians();
  }

  async function deleteGuardian(guardianId: string) {
    if (!confirm('Remove this guardian? Their link will stop working.')) return;

    const { error } = await supabase
      .from('guardians')
      .delete()
      .eq('id', guardianId);

    if (error) {
      alert(error.message);
    } else {
      await loadGuardians();
    }
  }

  function getShareLink(guardian: Guardian) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/guardian/${guardian.token}`;
  }

  async function copyLink(guardian: Guardian) {
    const link = getShareLink(guardian);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(guardian.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for older browsers
      prompt('Copy this link:', link);
    }
  }

  function getRoleInfo(roleValue: string) {
    return ROLES.find((r) => r.value === roleValue) || ROLES[2];
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold">🛡️ Guardian System</h2>
          <p className="text-sm text-gray-600 mt-1">
            Share {petName}'s info with trusted people via a secure link.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            showForm
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {showForm ? 'Cancel' : '+ Add Guardian'}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6 mt-4">
        <h3 className="font-semibold text-indigo-900 text-sm mb-2">How it works:</h3>
        <ul className="text-sm text-indigo-800 space-y-1">
          <li>1. Add a guardian (family member, vet, pet sitter)</li>
          <li>2. Copy their unique secure link</li>
          <li>3. Share via WhatsApp, email, or save with your will</li>
          <li>4. They can view {petName}'s info without creating an account</li>
        </ul>
      </div>

      {/* Add Guardian Form */}
      {showForm && (
        <form onSubmit={addGuardian} className="bg-gray-50 rounded-xl p-6 mb-6 border">
          <h3 className="font-semibold mb-4">New Guardian</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                className="w-full border rounded-lg p-3"
                placeholder="e.g. Mom, Dr. Smith, Sarah"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select
                className="w-full border rounded-lg p-3"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {getRoleInfo(role).desc}
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
              <input
                type="email"
                className="w-full border rounded-lg p-3"
                placeholder="guardian@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
              <input
                type="tel"
                className="w-full border rounded-lg p-3"
                placeholder="+27 82 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 transition"
          >
            {saving ? 'Creating...' : '🛡️ Create Guardian Link'}
          </button>
        </form>
      )}

      {/* Guardians List */}
      {loading ? (
        <p className="text-gray-600">Loading guardians...</p>
      ) : guardians.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-3">🛡️</div>
          <p className="text-gray-500 font-medium">No guardians added yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Add someone you trust to access {petName}'s information.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {guardians.map((guardian) => {
            const roleInfo = getRoleInfo(guardian.role);
            return (
              <div key={guardian.id} className="border rounded-xl p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{guardian.name}</h3>
                    <span className="text-sm text-gray-600">{roleInfo.label}</span>
                  </div>
                  <button
                    onClick={() => deleteGuardian(guardian.id)}
                    className="text-gray-400 hover:text-red-500 text-sm transition"
                  >
                    Remove
                  </button>
                </div>

                {/* Contact Info */}
                {(guardian.email || guardian.phone) && (
                  <div className="text-sm text-gray-500 mb-3">
                    {guardian.email && <div>📧 {guardian.email}</div>}
                    {guardian.phone && <div>📱 {guardian.phone}</div>}
                  </div>
                )}

                {/* Share Link Button */}
                <button
                  onClick={() => copyLink(guardian)}
                  className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition ${
                    copiedId === guardian.id
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  {copiedId === guardian.id ? '✅ Link copied!' : '📋 Copy Share Link'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}