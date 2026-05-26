'use client';
import CareProfile from '@/components/CareProfile';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
import * as React from 'react';
import WellnessScore from '@/components/WellnessScore';
import WellnessPassport from '@/components/WellnessPassport';
import PetAvatarUpload from '@/components/PetAvatarUpload';
import EmergencyPanelWrapper from '@/components/EmergencyPanelWrapper';
import { deletePetWithRelatedData } from '@/lib/pets/deletePet';

export default function PetProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState('free');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { id } = React.use(params);

  useEffect(() => {
    async function fetchPet() {
      const supabase = createSupabaseBrowserClient();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', session.user.id)
        .single();

      setUserPlan(profile?.subscription_plan || 'free');

      const { data: petData } = await supabase
        .from('pets')
        .select('*')
        .eq('id', id)
        .single();

      setPet(petData);
      setLoading(false);
    }

    fetchPet();
  }, [id, router]);

  async function handleDeletePet() {
    if (!pet) return;
    setDeleting(true);
    setDeleteError(null);

    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setDeleteError('You are not logged in.');
      setDeleting(false);
      return;
    }

    const { error } = await deletePetWithRelatedData(supabase, pet.id, session.user.id);

    if (error) {
      setDeleteError('Could not delete pet: ' + error);
      setDeleting(false);
      return;
    }

    router.push('/dashboard');
  }

  if (loading) {
    return <div className="text-center py-12">Loading pet profile...</div>;
  }

  if (!pet) {
    return (
      <div className="text-center py-12">
        <p>❌ Pet not found</p>
        <Link href="/dashboard" className="text-emerald-600 mt-4 inline-block">← Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/dashboard" className="text-emerald-600 mb-4 inline-block">← Back to Dashboard</Link>

      {/* Pet Header with Avatar Upload */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-2xl p-6 text-center">
        <PetAvatarUpload
          petId={pet.id}
          currentAvatarUrl={pet.profile_photo_url || pet.photo_url}
          petName={pet.name}
          onUploadComplete={(newUrl) => {
            setPet({ ...pet, profile_photo_url: newUrl });
          }}
        />
        <h1 className="text-2xl font-bold text-white mt-3">{pet.name}</h1>
        <p className="text-orange-100">{pet.breed} • {pet.species}</p>
      </div>

      {/* About Section — single, clean version with Edit link */}
      <div className="bg-[#1a1a2e] p-6 border-x border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">About {pet.name}</h2>
          <Link href={`/pets/${pet.id}/edit`} className="text-sm text-emerald-400 hover:text-emerald-300">
            ✏️ Edit Pet
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
  <span className="text-gray-400 text-sm">Age</span>
  <p className="font-medium text-white">
    {pet.date_of_birth
      ? (() => {
          const diff = Date.now() - new Date(pet.date_of_birth).getTime();
          const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
          const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.4));
          return years < 1 ? `${months} month${months !== 1 ? 's' : ''}` : `${years} year${years !== 1 ? 's' : ''}`;
        })()
      : 'Not specified'}
  </p>
</div>
          <div>
            <span className="text-gray-400 text-sm">Weight</span>
            <p className="font-medium text-white">{pet.weight || 'Not specified'} kg</p>
          </div>
          <div>
            <span className="text-gray-400 text-sm">Microchip</span>
            <p className="font-medium text-white">{pet.microchip || 'Not registered'}</p>
          </div>
          <div>
            <span className="text-gray-400 text-sm">Colour</span>
            <p className="font-medium text-white">{pet.colour || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Travel Planner — Pro / Family */}
      {(userPlan === 'pro' || userPlan === 'family') ? (
        <div className="bg-gradient-to-r from-[#0F6E56] to-[#1D9E75] p-6 border-x mt-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">✈️ Pet Travel Planner</h2>
              <p className="text-sm text-white/90 mt-1">
                Country requirements, timeline, airlines &amp; export checklist for {pet.name}
              </p>
            </div>
            <Link
              href={`/pets/${pet.id}/travel`}
              className="bg-white text-[#0F6E56] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50 shrink-0"
            >
              Open Travel Planner →
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-[#1a1a2e] p-6 border-x border-gray-800 mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">✈️ Pet Travel Planner</h2>
              <p className="text-sm text-gray-400 mt-1">
                International travel requirements &amp; timelines — Pro feature
              </p>
            </div>
            <Link
              href="/upgrade?plan=pro"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 shrink-0"
            >
              Upgrade to Pro →
            </Link>
          </div>
        </div>
      )}

      {/* Wellness Score */}
      <div className="bg-white p-6 border-x mt-6">
        <WellnessScore petId={pet.id} />
      </div>

      {/* Wellness Passport */}
      <div className="bg-white p-6 border-x mt-6">
        <WellnessPassport petId={pet.id} pet={pet} />
      </div>

      {/* Care Profile */}
      <div className="bg-white p-6 border-x mt-6">
        <CareProfile petId={pet.id} />
      </div>

      {/* Upgrade Section for Free Users */}
      {userPlan === 'free' && (
        <div className="bg-orange-50 p-6 border-x text-center mt-6">
          <p className="text-orange-700 font-bold">🔒 Upgrade to Pro</p>
          <p className="text-sm text-orange-600 mt-1">Get full wellness tracking, vaccine calendar, and health journal</p>
          <Link href="/upgrade?plan=pro" className="inline-block mt-3 bg-orange-500 text-white px-4 py-2 rounded-lg">
            Upgrade Now →
          </Link>
        </div>
      )}

      {/* Emergency Action Panel */}
      <div className="bg-[#1a1a2e] p-6 border-x border-gray-800 mt-6">
        <EmergencyPanelWrapper petId={pet.id} />
      </div>

      {/* Delete pet */}
      <div className="bg-[#1a1a2e] p-6 border-x border-gray-800 mt-6">
        <h2 className="text-lg font-bold text-red-400 mb-1">Danger zone</h2>
        <p className="text-sm text-gray-400 mb-4">
          Permanently delete {pet.name}&apos;s profile and all vaccines, weight history, travel plans, guardians, and memories linked to this pet.
        </p>
        {deleteError && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 rounded-lg p-3 mb-4 text-sm">
            {deleteError}
          </div>
        )}
        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="border border-red-500/60 text-red-400 hover:bg-red-950/40 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Delete pet profile
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-300">Delete {pet.name}? This cannot be undone.</span>
            <button
              type="button"
              onClick={handleDeletePet}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Yes, delete permanently'}
            </button>
            <button
              type="button"
              onClick={() => { setConfirmDelete(false); setDeleteError(null); }}
              disabled={deleting}
              className="border border-gray-600 text-gray-400 hover:text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* SOS Button */}
      <div className="bg-red-50 p-6 border rounded-b-2xl text-center mt-6">
        <h2 className="text-lg font-bold text-red-700 mb-2">🚨 Emergency SOS</h2>
        <button
          onClick={() => {
            const url = `https://vurapet.vercel.app/sos/${pet.id}`;
            navigator.clipboard.writeText(url);
            alert('✅ SOS link copied! Share with vets, pet sitters, or emergency contacts.');
          }}
          className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold"
        >
          Generate SOS Link
        </button>
      </div>
    </div>
  );
}