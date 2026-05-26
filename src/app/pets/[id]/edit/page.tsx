'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
import * as React from 'react';
import { deletePetWithRelatedData } from '@/lib/pets/deletePet';

export default function EditPetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    species: '',
    breed: '',
    date_of_birth: '', // ✅ correct column name
    weight: '',        // ✅ correct column name
    microchip: '',
    colour: '',
    vet_clinic: '',
    vet_phone: '',
    emergency_vet: '',
    owner_phone: '',
  });

  useEffect(() => {
    async function loadPet() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.from('pets').select('*').eq('id', id).single();
      if (data) {
        setForm({
          name: data.name || '',
          species: data.species || '',
          breed: data.breed || '',
          date_of_birth: data.date_of_birth || '',
          weight: data.weight || '',
          microchip: data.microchip || '',
          colour: data.colour || '',
          vet_clinic: data.vet_clinic || '',
          vet_phone: data.vet_phone || '',
          emergency_vet: data.emergency_vet || '',
          owner_phone: data.owner_phone || '',
        });
      }
      setLoading(false);
    }
    loadPet();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    const supabase = createSupabaseBrowserClient();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setSaveError('You are not logged in. Please log in and try again.');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('pets')
      .update(form)
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Save error:', error);
      setSaveError('Could not save changes: ' + error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push(`/pets/${id}`);
  }

  async function handleDeletePet() {
    setDeleting(true);
    setDeleteError(null);

    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setDeleteError('You are not logged in.');
      setDeleting(false);
      return;
    }

    const { error } = await deletePetWithRelatedData(supabase, id, session.user.id);

    if (error) {
      setDeleteError('Could not delete pet: ' + error);
      setDeleting(false);
      return;
    }

    router.push('/dashboard');
  }

  if (loading) return <div className="p-8 text-center text-white">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link href={`/pets/${id}`} className="text-emerald-400 mb-4 inline-block">← Back to Profile</Link>
      <h1 className="text-2xl font-bold text-white mb-6">Edit {form.name || 'Pet'}</h1>

      {saveError && (
        <div className="bg-red-900 border border-red-500 text-red-200 rounded-lg p-4 mb-4 text-sm">
          ❌ {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Pet Name</label>
            <input type="text" placeholder="Pet name" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="w-full bg-gray-800 p-2 rounded text-white" />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Species</label>
            <input type="text" placeholder="e.g. Dog, Cat" value={form.species}
              onChange={e => setForm({...form, species: e.target.value})}
              className="w-full bg-gray-800 p-2 rounded text-white" />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Breed</label>
            <input type="text" placeholder="Breed" value={form.breed}
              onChange={e => setForm({...form, breed: e.target.value})}
              className="w-full bg-gray-800 p-2 rounded text-white" />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Date of Birth</label>
            <input type="date" value={form.date_of_birth}
              onChange={e => setForm({...form, date_of_birth: e.target.value})}
              className="w-full bg-gray-800 p-2 rounded text-white"
              style={{ colorScheme: 'dark' }} />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Weight (kg)</label>
            <input type="number" step="0.1" placeholder="e.g. 4.5" value={form.weight}
              onChange={e => setForm({...form, weight: e.target.value})}
              className="w-full bg-gray-800 p-2 rounded text-white" />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Microchip Number</label>
            <input type="text" placeholder="Microchip" value={form.microchip}
              onChange={e => setForm({...form, microchip: e.target.value})}
              className="w-full bg-gray-800 p-2 rounded text-white" />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Colour</label>
            <input type="text" placeholder="e.g. Black and white" value={form.colour}
              onChange={e => setForm({...form, colour: e.target.value})}
              className="w-full bg-gray-800 p-2 rounded text-white" />
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4 mt-4">
          <h2 className="text-lg font-bold text-white mb-3">Emergency Contacts</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Vet Clinic Name</label>
              <input type="text" placeholder="Vet clinic name" value={form.vet_clinic}
                onChange={e => setForm({...form, vet_clinic: e.target.value})}
                className="w-full bg-gray-800 p-2 rounded text-white" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Vet Phone</label>
              <input type="tel" placeholder="Vet phone" value={form.vet_phone}
                onChange={e => setForm({...form, vet_phone: e.target.value})}
                className="w-full bg-gray-800 p-2 rounded text-white" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Emergency Vet</label>
              <input type="tel" placeholder="Emergency vet number" value={form.emergency_vet}
                onChange={e => setForm({...form, emergency_vet: e.target.value})}
                className="w-full bg-gray-800 p-2 rounded text-white" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Owner Phone</label>
              <input type="tel" placeholder="Owner phone" value={form.owner_phone}
                onChange={e => setForm({...form, owner_phone: e.target.value})}
                className="w-full bg-gray-800 p-2 rounded text-white" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50">
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </form>

      <div className="border-t border-gray-700 mt-10 pt-6">
        <h2 className="text-lg font-bold text-red-400 mb-1">Danger zone</h2>
        <p className="text-sm text-gray-400 mb-4">
          Permanently delete this pet and all linked records. This cannot be undone.
        </p>
        {deleteError && (
          <div className="bg-red-900 border border-red-500 text-red-200 rounded-lg p-3 mb-4 text-sm">
            {deleteError}
          </div>
        )}
        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="border border-red-500 text-red-400 hover:bg-red-950 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Delete pet profile
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-300">Are you sure?</span>
            <button
              type="button"
              onClick={handleDeletePet}
              disabled={deleting}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Yes, delete permanently'}
            </button>
            <button
              type="button"
              onClick={() => { setConfirmDelete(false); setDeleteError(null); }}
              disabled={deleting}
              className="border border-gray-600 text-gray-400 px-4 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}