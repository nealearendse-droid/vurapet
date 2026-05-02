'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import EmergencyActionPanel from '@/components/EmergencyActionPanel';
import GuardianCareDocument from '@/components/GuardianCareDocument';

type Guardian = {
  id: string;
  name: string;
  role: string;
  access_level: string;
  pet_id: string;
  phone?: string;
};

type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string;
  date_of_birth: string;
  sex: string;
  microchip: string;
  allergies: string[];
  chronic_conditions: string[];
  primary_vet: string;
  vet_clinic: string;
  vet_phone: string;
  emergency_vet: string;
  feeding_schedule: string;
  feeding_instructions: string;
  medication_instructions: string;
  do_not_feed: string;
  warning_signs: string;
  daily_routine: string;
  behaviour_notes: string;
  emergency_steps: string;
  profile_photo_url: string;
  photo_url: string;
};

type Owner = {
  full_name?: string;
  phone?: string;
  email?: string;
};

export default function GuardianViewPage() {
  const params = useParams();
  const token = params?.token as string;

  const [guardian, setGuardian] = useState<Guardian | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'emergency' | 'care'>('emergency');

  useEffect(() => {
    if (!token) return;
    const supabase = getSupabaseClient();

    const load = async () => {
      // Load guardian
      const { data: guardianData, error: gErr } = await supabase
        .from('guardians')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .single();

      if (gErr || !guardianData) {
        setError('This guardian link is invalid or has been revoked.');
        setLoading(false);
        return;
      }

      // Load pet
      const { data: petData, error: pErr } = await supabase
        .from('pets')
        .select('*')
        .eq('id', guardianData.pet_id)
        .single();

      if (pErr || !petData) {
        setError('Pet information could not be loaded.');
        setLoading(false);
        return;
      }

      // Try to load owner profile (fails gracefully if table doesn't exist)
      try {
        const { data: ownerData } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', petData.user_id)
          .single();
        if (ownerData) setOwner(ownerData);
      } catch (_) {
        // profiles table may not exist yet — that's fine
      }

      // Update last viewed
      await supabase
        .from('guardians')
        .update({ last_viewed_at: new Date().toISOString() })
        .eq('token', token);

      setGuardian(guardianData);
      setPet(petData);
      setLoading(false);
    };

    load();
  }, [token]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🛡️</div>
          <p className="text-gray-500 font-medium">Loading care information...</p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !pet || !guardian) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Link not found</h2>
          <p className="text-gray-500">{error || 'This guardian link is invalid or has been revoked.'}</p>
        </div>
      </div>
    );
  }

  const ownerName = owner?.full_name ?? undefined;
  const ownerPhone = owner?.phone ?? undefined;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-xl">🐾</span>
          <div>
            <p className="font-bold text-orange-600 leading-none text-base">VuraPet</p>
            <p className="text-xs text-gray-400">Lifetime Companion</p>
          </div>
          <div className="ml-auto">
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
              🔒 Secure Link
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* ── Guardian greeting ─────────────────────────────────────────── */}
        <div className="bg-orange-600 text-white rounded-2xl px-5 py-4">
          <p className="text-orange-200 text-xs mb-0.5">You are viewing this as</p>
          <h1 className="text-xl font-bold leading-tight">{guardian.name}</h1>
          <p className="text-orange-200 text-xs mt-1">{guardian.access_level}</p>
        </div>

        {/* ── Pet identity strip ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
            {(pet.profile_photo_url || pet.photo_url)
              ? <img src={pet.profile_photo_url || pet.photo_url} alt={pet.name} className="w-full h-full object-cover rounded-full" />
              : (pet.species?.toLowerCase().includes('cat') ? '🐈' : '🐕')
            }
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{pet.name}</h2>
            <p className="text-gray-500 text-sm capitalize">
              {pet.species}{pet.breed ? ` · ${pet.breed}` : ''}
            </p>
            {pet.date_of_birth && (
              <p className="text-gray-400 text-xs mt-0.5">
                Born: {new Date(pet.date_of_birth).toLocaleDateString('en-ZA', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            )}
          </div>
          {/* Allergy alert badge */}
          {(pet.allergies?.length > 0 || pet.chronic_conditions?.length > 0) && (
            <div className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1.5 rounded-xl text-center flex-shrink-0">
              ⚠️ Health<br />Alerts
            </div>
          )}
        </div>

        {/* Allergy detail — always visible if present */}
        {(pet.allergies?.length > 0 || pet.chronic_conditions?.length > 0) && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-700 font-bold text-sm mb-1">⚠️ Important health information</p>
            {pet.allergies?.length > 0 && (
              <p className="text-red-600 text-sm">
                <strong>Allergies:</strong> {Array.isArray(pet.allergies) ? pet.allergies.join(', ') : pet.allergies}
              </p>
            )}
            {pet.chronic_conditions?.length > 0 && (
              <p className="text-red-600 text-sm">
                <strong>Conditions:</strong> {Array.isArray(pet.chronic_conditions) ? pet.chronic_conditions.join(', ') : pet.chronic_conditions}
              </p>
            )}
          </div>
        )}

        {/* ── Tab switcher ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab('emergency')}
            className={`py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'emergency'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            🚨 Emergency Guide
          </button>
          <button
            onClick={() => setActiveTab('care')}
            className={`py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'care'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            📋 Full Care Plan
          </button>
        </div>

        {/* ── EMERGENCY TAB ─────────────────────────────────────────────── */}
        {activeTab === 'emergency' && (
          <EmergencyActionPanel
            petName={pet.name}
            petSpecies={pet.species}
            ownerName={ownerName}
            ownerPhone={ownerPhone}
            vetName={pet.vet_clinic || pet.primary_vet}
            vetPhone={pet.vet_phone}
          />
        )}

        {/* ── CARE PLAN TAB ─────────────────────────────────────────────── */}
        {activeTab === 'care' && (
          <GuardianCareDocument
            pet={pet}
            ownerName={ownerName}
            ownerPhone={ownerPhone}
          />
        )}

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">
            Shared securely via VuraPet · Your Pet's Lifetime Companion
          </p>
          <p className="text-xs text-gray-300 mt-1">
            🔒 This link is private. Please do not share it with others.
          </p>
        </div>

      </div>
    </div>
  );
}