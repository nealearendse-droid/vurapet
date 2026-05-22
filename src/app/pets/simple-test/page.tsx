'use client';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function SimpleTest() {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    async function loadPets() {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('pets')
          .select('id, name')
          .eq('user_id', session.user.id);
        setPets(data || []);
      }
    }
    loadPets();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Test Page</h1>
      <p>Your pets:</p>
      <ul>
        {pets.map(pet => (
          <li key={pet.id}>
            {pet.name} - 
            <a href={`/pets/${pet.id}`} className="text-blue-500 ml-2">View Profile</a>
          </li>
        ))}
      </ul>
    </div>
  );
}