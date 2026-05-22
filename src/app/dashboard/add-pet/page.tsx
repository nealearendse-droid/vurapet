'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
import PetAvatarUpload from '@/components/PetAvatarUpload';

export default function AddPetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newPetId, setNewPetId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    species: 'dog',
    breed: '',
    date_of_birth: '',
    weight: '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push('/auth/login');
      return;
    }

    const { data, error } = await supabase.from('pets').insert({
      user_id: session.user.id,
      name: form.name,
      species: form.species,
      breed: form.breed,
      date_of_birth: form.date_of_birth || null,
      weight: parseFloat(form.weight) || null,
    }).select('id').single();

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    // Save the new pet's ID so the avatar uploader can use it
    setNewPetId(data.id);
  };

  const handleAvatarDone = () => {
    router.push('/dashboard');
  };

  // ── After saving, show the photo upload step ──────────────────
  if (newPetId) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

          <div className="text-5xl mb-4">🐾</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {form.name} has been added!
          </h2>
          <p className="text-gray-500 mb-8">
            Would you like to add a profile photo for {form.name}?
          </p>

          {/* Avatar upload component */}
          <div className="flex justify-center mb-8">
            <PetAvatarUpload
              petId={newPetId}
              petName={form.name}
              onUploadComplete={handleAvatarDone}
            />
          </div>

          {/* Skip button */}
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            Skip for now
          </button>

        </div>
      </div>
    );
  }

  // ── Default: the original add-pet form ───────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

      {/* Back link */}
      <Link href="/dashboard" className="text-orange-600 font-medium hover:underline text-sm">
        ← Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-8">Add New Pet</h1>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-5">

        {/* Pet Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Pet Name *
          </label>
          <input
            required
            type="text"
            placeholder="e.g. Sylar"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Species */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Species *
          </label>
          <select
            value={form.species}
            onChange={e => setForm({ ...form, species: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
          >
            <option value="dog">🐕 Dog</option>
            <option value="cat">🐈 Cat</option>
            <option value="bird">🦜 Bird</option>
            <option value="rabbit">🐇 Rabbit</option>
            <option value="other">🐾 Other</option>
          </select>
        </div>

        {/* Breed */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Breed
          </label>
          <input
            type="text"
            placeholder="e.g. German Shepherd"
            value={form.breed}
            onChange={e => setForm({ ...form, breed: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Date of birth */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Date of Birth
          </label>
          <input
            type="date"
            value={form.date_of_birth}
            onChange={e => setForm({ ...form, date_of_birth: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Weight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="e.g. 32.5"
            value={form.weight}
            onChange={e => setForm({ ...form, weight: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !form.name}
          className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-2"
        >
          {loading ? 'Saving...' : '🐾 Save Pet'}
        </button>

      </form>
    </div>
  );
}