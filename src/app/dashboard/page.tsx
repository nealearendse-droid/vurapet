'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import ProtectionStatus from '@/components/ProtectionStatus';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();

    const fetchPets = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', session.user.id);

      if (!error) {
        setPets(data || []);
      }
      setLoading(false);
    };

    fetchPets();
  }, [router]);

  if (loading) return <div className="p-8 text-center">Loading your pets...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Pets</h1>
          <Link 
            href="/dashboard/add-pet" 
            className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-700"
          >
            + Add New Pet
          </Link>
        </div>

        {pets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-xl">You haven't added any pets yet!</p>
            <Link href="/dashboard/add-pet" className="text-orange-600 font-bold mt-4 inline-block">
              Click here to add your first pet
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {pets.map((pet) => (
              <div key={pet.id} className="space-y-4">
                {/* 🛡️ THIS IS THE NEW RED/GREEN PROTECTION BANNER */}
                <ProtectionStatus petId={pet.id} />

                {/* Pet Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-6">
                   <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-4xl">
                     🐾
                   </div>
                   <div>
                     <h2 className="text-2xl font-bold text-gray-800">{pet.name}</h2>
                     <p className="text-gray-500">{pet.breed} • {pet.species}</p>
                     <Link 
                        href={`/pets/${pet.id}`} 
                        className="text-orange-600 font-bold mt-2 inline-block hover:underline"
                     >
                       View Full Profile & Care Plan →
                     </Link>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}