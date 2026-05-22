'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
import * as React from 'react';

export default function EditPetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    weight: '',
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
          age: data.age || '',
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
    const supabase = createSupabaseBrowserClient();
    await supabase.from('pets').update(form).eq('id', id);
    setSaving(false);
    router.push(`/pets/${id}`);
  }

  if (loading) return <div className="p-8 text-center text-white">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link href={`/pets/${id}`} className="text-emerald-400 mb-4 inline-block">← Back to Profile</Link>
      <h1 className="text-2xl font-bold text-white mb-6">Edit {form.name || 'Pet'}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <input type="text" placeholder="Pet name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-gray-800 p-2 rounded text-white" />
          <input type="text" placeholder="Species" value={form.species} onChange={e => setForm({...form, species: e.target.value})} className="bg-gray-800 p-2 rounded text-white" />
          <input type="text" placeholder="Breed" value={form.breed} onChange={e => setForm({...form, breed: e.target.value})} className="bg-gray-800 p-2 rounded text-white" />
          <input type="text" placeholder="Age" value={form.age} onChange={e => setForm({...form, age: e.target.value})} className="bg-gray-800 p-2 rounded text-white" />
          <input type="text" placeholder="Weight (kg)" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} className="bg-gray-800 p-2 rounded text-white" />
          <input type="text" placeholder="Microchip" value={form.microchip} onChange={e => setForm({...form, microchip: e.target.value})} className="bg-gray-800 p-2 rounded text-white" />
          <input type="text" placeholder="Colour" value={form.colour} onChange={e => setForm({...form, colour: e.target.value})} className="bg-gray-800 p-2 rounded text-white" />
        </div>
        
        {/* Emergency Contacts */}
        <div className="border-t border-gray-700 pt-4 mt-4">
          <h2 className="text-lg font-bold text-white mb-3">Emergency Contacts</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input type="text" placeholder="Vet clinic name" value={form.vet_clinic} onChange={e => setForm({...form, vet_clinic: e.target.value})} className="bg-gray-800 p-2 rounded text-white" />
            <input type="tel" placeholder="Vet phone" value={form.vet_phone} onChange={e => setForm({...form, vet_phone: e.target.value})} className="bg-gray-800 p-2 rounded text-white" />
            <input type="tel" placeholder="Emergency vet" value={form.emergency_vet} onChange={e => setForm({...form, emergency_vet: e.target.value})} className="bg-gray-800 p-2 rounded text-white" />
            <input type="tel" placeholder="Owner phone" value={form.owner_phone} onChange={e => setForm({...form, owner_phone: e.target.value})} className="bg-gray-800 p-2 rounded text-white" />
          </div>
        </div>
        
        <button type="submit" disabled={saving} className="bg-emerald-600 text-white px-6 py-2 rounded-lg">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}