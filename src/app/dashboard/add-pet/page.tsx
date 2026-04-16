'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddPet() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Dog');
  const [breed, setBreed] = useState('');
  const [dob, setDob] = useState('');
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in first");
      return;
    }

    const { error } = await supabase.from('pets').insert([
      { 
        name, 
        species, 
        breed, 
        date_of_birth: dob ? new Date(dob).toISOString().split('T')[0] : null, 
        user_id: user.id 
      }
    ]);

    if (error) {
      console.error(error);
      alert("Error adding pet");
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Add New Pet</h1>
      <form onSubmit={handleAddPet} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Pet Name</label>
          <input 
            type="text" required 
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={name} onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Species</label>
            <select 
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={species} onChange={(e) => setSpecies(e.target.value)}
            >
              <option>Dog</option>
              <option>Cat</option>
              <option>Bird</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Breed</label>
            <input 
              type="text" required 
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={breed} onChange={(e) => setBreed(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input 
            type="date" required 
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={dob} onChange={(e) => setDob(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Saving...' : 'Create Profile'}
        </button>
      </form>
      
      <Link href="/dashboard" className="block mt-4 text-center text-blue-600">
        ← Back to Dashboard
      </Link>
    </div>
  );
}