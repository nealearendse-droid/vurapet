'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';

type Guardian = {
  id: string;
  name: string;
  email: string;
  role: string;
  access_level: string;
  token: string;
  pet_id: string;
  created_at: string;
};

type Pet = {
  id: string;
  name: string;
  breed: string;
  species: string;
};

export default function GuardiansPage() {
  const router = useRouter();
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth/login'); return; }

      const { data: petsData } = await supabase
        .from('pets')
        .select('id, name, breed, species')
        .eq('user_id', session.user.id);

      const petIds = (petsData || []).map((p: Pet) => p.id);

      let guardiansData: Guardian[] = [];
      if (petIds.length > 0) {
        const { data } = await supabase
          .from('guardians')
          .select('*')
          .in('pet_id', petIds)
          .order('created_at', { ascending: false });
        guardiansData = data || [];
      }

      setPets(petsData || []);
      setGuardians(guardiansData);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/guardian/${token}`;
    navigator.clipboard.writeText(link);
    setCopied(token);
    setTimeout(() => setCopied(null), 2500);
  };

  const deleteGuardian = async (id: string) => {
    if (!confirm('Remove this guardian?')) return;
    const supabase = getSupabaseClient();
    await supabase.from('guardians').delete().eq('id', id);
    setGuardians(prev => prev.filter(g => g.id !== id));
  };

  const getPetName = (petId: string) =>
    pets.find(p => p.id === petId)?.name || 'Unknown pet';

  const roleLabels: Record<string, { label: string; emoji: string; color: string }> = {
    primary:  { label: 'Primary Guardian', emoji: '👑', color: 'bg-orange-100 text-orange-700' },
    vet:      { label: 'Vet / Medical',    emoji: '🩺', color: 'bg-blue-100 text-blue-700' },
    sitter:   { label: 'Pet Sitter',       emoji: '🏠', color: 'bg-purple-100 text-purple-700' },
    family:   { label: 'Family / Memorial',emoji: '❤️', color: 'bg-pink-100 text-pink-700' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">🛡️</div>
          <p className="text-gray-500 font-medium">Loading guardians...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guardian System</h1>
          <p className="text-gray-500 mt-1">
            Share your pet's care info with trusted people via a secure link.
          </p>
        </div>
        <Link
          href="/pets/guardian/add"
          className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-sm whitespace-nowrap"
        >
          + Add Guardian
        </Link>
      </div>

      {/* How it works */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8 mt-4">
        <p className="font-semibold text-blue-800 mb-2">How it works</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { step: '1', text: 'Add a guardian with their name & role' },
            { step: '2', text: 'Copy their unique secure link' },
            { step: '3', text: 'Share via WhatsApp, email or with your will' },
            { step: '4', text: 'They view your pet\'s info — no account needed' },
          ].map(item => (
            <div key={item.step} className="flex items-start gap-2">
              <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                {item.step}
              </span>
              <p className="text-blue-700 text-xs leading-snug">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Guardian list */}
      {guardians.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-4">🛡️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No guardians yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Add a trusted person who will know exactly how to care for your pet if something happens to you.
          </p>
          <Link
            href="/pets/guardian/add"
            className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors"
          >
            + Add Your First Guardian
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {guardians.map(guardian => {
            const role = roleLabels[guardian.role] || { label: guardian.role, emoji: '👤', color: 'bg-gray-100 text-gray-700' };
            const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/guardian/${guardian.token}`;

            return (
              <div key={guardian.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-lg">{guardian.name}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${role.color}`}>
                        {role.emoji} {role.label}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-1">{guardian.email}</p>
                    <p className="text-gray-400 text-xs">For: <span className="font-medium text-gray-600">{getPetName(guardian.pet_id)}</span></p>
                  </div>
                  <button
                    onClick={() => deleteGuardian(guardian.id)}
                    className="text-red-400 hover:text-red-600 text-sm font-medium hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>

                {/* Secure link */}
                <div className="mt-4 bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">Secure guardian link</p>
                    <p className="text-sm text-gray-600 truncate font-mono">{link}</p>
                  </div>
                  <button
                    onClick={() => copyLink(guardian.token)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      copied === guardian.token
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    {copied === guardian.token ? '✓ Copied!' : 'Copy Link'}
                  </button>
                </div>

                {/* Share buttons */}
                <div className="flex gap-2 mt-3">
                  <a
                    href={`https://wa.me/?text=Hi! I've added you as a guardian for my pet. Here's the care information link: ${link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    💬 Share on WhatsApp
                  </a>
                  <a
                    href={`mailto:${guardian.email}?subject=I've added you as a pet guardian&body=Hi ${guardian.name},%0A%0AI've added you as a guardian for my pet on VuraPet. Here's the link to access their care information:%0A%0A${link}%0A%0ANo account needed — just click the link.`}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    ✉️ Send Email
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}