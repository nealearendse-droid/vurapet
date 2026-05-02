'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';

type Pet = { id: string; name: string; breed: string; species: string };

const ROLES = [
  {
    value: 'primary',
    emoji: '👑',
    label: 'Primary Guardian',
    desc: 'Full access — health, nutrition, routine, memories & vet contacts',
    color: 'border-orange-400 bg-orange-50',
    badge: 'bg-orange-100 text-orange-700',
  },
  {
    value: 'vet',
    emoji: '🩺',
    label: 'Vet / Medical',
    desc: 'Health records only — vaccines, medications, allergies, symptom log',
    color: 'border-blue-400 bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    value: 'sitter',
    emoji: '🏠',
    label: 'Pet Sitter / Friend',
    desc: 'Care access — daily routine, feeding plan & emergency contacts',
    color: 'border-purple-400 bg-purple-50',
    badge: 'bg-purple-100 text-purple-700',
  },
  {
    value: 'family',
    emoji: '❤️',
    label: 'Family / Memorial',
    desc: 'Memory access — memory book, photos, milestones & personality notes',
    color: 'border-pink-400 bg-pink-50',
    badge: 'bg-pink-100 text-pink-700',
  },
];

export default function AddGuardianPage() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [guardianName, setGuardianName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');

  const [form, setForm] = useState({
    petId: '',
    name: '',
    email: '',
    phone: '',
    role: 'primary',
    notes: '',
  });

  useEffect(() => {
    const supabase = getSupabaseClient();
    const fetchPets = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth/login'); return; }
      const { data } = await supabase
        .from('pets')
        .select('id, name, breed, species')
        .eq('user_id', session.user.id);
      const petList = data || [];
      setPets(petList);
      if (petList.length > 0) setForm(f => ({ ...f, petId: petList[0].id }));
      setPageLoading(false);
    };
    fetchPets();
  }, [router]);

  const selectedRole = ROLES.find(r => r.value === form.role) || ROLES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.petId || !form.name || !form.email) return;
    setLoading(true);

    const supabase = getSupabaseClient();
    const token = Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const accessLevelMap: Record<string, string> = {
      primary: 'Full access — health, nutrition, routine, memory book, vet contacts',
      vet:     'Health only — vaccine history, medications, allergies, symptom log',
      sitter:  'Care access — daily routine, feeding plan, emergency contacts',
      family:  'Memory only — memory book, photos, milestones, personality notes',
    };

    const { error } = await supabase.from('guardians').insert({
      pet_id:       form.petId,
      name:         form.name,
      email:        form.email,
      phone:        form.phone || null,
      role:         form.role,
      access_level: accessLevelMap[form.role],
      token,
      notes:        form.notes || null,
      is_active:    true,
    });

    if (!error) {
      const link = `${window.location.origin}/guardian/${token}`;
      setGeneratedLink(link);
      setGuardianName(form.name);
      setGuardianEmail(form.email);
      setSuccess(true);
    } else {
      alert('Something went wrong: ' + error.message);
    }
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">🛡️</div>
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // ── Success screen ──
  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

          {/* Success header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
              🛡️
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Guardian Added!</h2>
            <p className="text-gray-500 mt-1">
              <strong>{guardianName}</strong> has been added. Share their secure link below.
            </p>
          </div>

          {/* Link box */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <p className="text-xs text-gray-400 mb-1.5 font-medium">🔒 Secure guardian link</p>
            <p className="text-sm text-gray-700 font-mono break-all leading-relaxed">
              {generatedLink}
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={copyLink}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {copied ? '✓ Link Copied!' : '📋 Copy Link'}
            </button>

            <a
              href={`https://wa.me/?text=Hi ${guardianName}!%20I've%20added%20you%20as%20a%20guardian%20for%20my%20pet%20on%20VuraPet.%20Here's%20the%20secure%20link%20to%20view%20their%20care%20information%3A%20${encodeURIComponent(generatedLink)}%20%E2%80%94%20No%20account%20needed%2C%20just%20click%20the%20link.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors text-center block"
            >
              💬 Share on WhatsApp
            </a>

            <a
              href={`mailto:${guardianEmail}?subject=You've been added as a pet guardian on VuraPet&body=Hi ${guardianName},%0A%0AI've added you as a guardian for my pet on VuraPet — a platform that ensures my pet is cared for correctly if something ever happens to me.%0A%0AHere's your secure link to view all the care information:%0A${generatedLink}%0A%0ANo account needed — just click the link. Please save it somewhere safe.%0A%0AThank you for being someone I trust with my pet's life.`}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors text-center block"
            >
              ✉️ Send by Email
            </a>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  setSuccess(false);
                  setForm(f => ({ ...f, name: '', email: '', phone: '', notes: '', role: 'primary' }));
                }}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                + Add Another
              </button>
              <Link
                href="/pets/guardian"
                className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-colors text-center"
              >
                View All Guardians
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Add guardian form ──
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">

      {/* Back */}
      <Link href="/pets/guardian" className="text-orange-600 font-medium hover:underline text-sm">
        ← Back to Guardians
      </Link>

      <div className="mt-3 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add a Guardian</h1>
        <p className="text-gray-500 mt-1 text-sm">
          This person will receive a secure link to view your pet's care information — no account needed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Pet selector */}
        {pets.length > 1 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Which pet is this guardian for?</label>
            <div className="space-y-2">
              {pets.map(pet => (
                <label
                  key={pet.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    form.petId === pet.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="petId"
                    value={pet.id}
                    checked={form.petId === pet.id}
                    onChange={e => setForm({ ...form, petId: e.target.value })}
                    className="sr-only"
                  />
                  <span className="text-xl">{pet.species === 'cat' ? '🐈' : '🐕'}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{pet.name}</p>
                    <p className="text-gray-400 text-xs">{pet.breed}</p>
                  </div>
                  {form.petId === pet.id && <span className="ml-auto text-orange-600 font-bold">✓</span>}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Personal details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Guardian details</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Sarah Johnson"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address *</label>
            <input
              type="email"
              required
              placeholder="e.g. sarah@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Phone number <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="tel"
              placeholder="e.g. 082 555 1234"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Role selector */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">What level of access?</h2>
          <div className="space-y-2">
            {ROLES.map(role => (
              <label
                key={role.value}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  form.role === role.value ? role.color + ' border-2' : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={form.role === role.value}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="sr-only"
                />
                <span className="text-2xl flex-shrink-0 mt-0.5">{role.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{role.label}</p>
                  <p className="text-gray-500 text-xs mt-0.5 leading-snug">{role.desc}</p>
                </div>
                {form.role === role.value && (
                  <span className="text-orange-600 font-bold flex-shrink-0">✓</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Notes for this guardian <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            placeholder="e.g. My sister Sarah. She knows where the dog food is kept. Sylar trusts her completely."
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !form.name || !form.email || !form.petId}
          className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-base hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Creating secure link...
            </span>
          ) : (
            '🛡️ Add Guardian & Generate Secure Link'
          )}
        </button>

        {/* Trust note */}
        <p className="text-center text-xs text-gray-400 pb-4">
          🔒 The secure link is unique and can be revoked at any time. No account required for guardians.
        </p>

      </form>
    </div>
  );
}