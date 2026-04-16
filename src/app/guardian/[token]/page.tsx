'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';

export default function GuardianViewPage() {
  const params = useParams();
  const token = params?.token as string;
  const supabase = createSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [guardian, setGuardian] = useState<any>(null);
  const [pet, setPet] = useState<any>(null);
  const [vaccines, setVaccines] = useState<any[]>([]);
  const [weights, setWeights] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    async function loadGuardianData() {
      setLoading(true);

      // Find guardian by token
      const { data: guardianData, error: guardianError } = await supabase
        .from('guardians')
        .select('*')
        .eq('token', token)
        .single();

      if (guardianError || !guardianData) {
        setError('This link is invalid or has been revoked.');
        setLoading(false);
        return;
      }

      setGuardian(guardianData);

      // Load pet info
      const { data: petData } = await supabase
        .from('pets')
        .select('name, species, breed, date_of_birth')
        .eq('id', guardianData.pet_id)
        .single();

      if (petData) setPet(petData);

      // Load vaccines
      const { data: vaccineData } = await supabase
        .from('vaccine_records')
        .select('name, date_given, due_date')
        .eq('pet_id', guardianData.pet_id)
        .order('date_given', { ascending: false });

      if (vaccineData) setVaccines(vaccineData);

      // Load weights
      const { data: weightData } = await supabase
        .from('weight_entries')
        .select('date, weight, weight_kg')
        .eq('pet_id', guardianData.pet_id)
        .order('date', { ascending: false })
        .limit(5);

      if (weightData) setWeights(weightData);

      // Load memories (only for family/primary roles)
      if (guardianData.role === 'family' || guardianData.role === 'primary') {
        const { data: memoryData } = await supabase
          .from('memories')
          .select('title, date, content, tags')
          .eq('pet_id', guardianData.pet_id)
          .order('date', { ascending: false });

        if (memoryData) setMemories(memoryData);
      }

      setLoading(false);
    }

    loadGuardianData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading pet information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border max-w-md">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!pet || !guardian) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
              🐾
            </div>
            <div>
              <h1 className="text-3xl font-bold">{pet.name}</h1>
              <p className="text-gray-600 capitalize">
                {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
              </p>
            </div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3 text-sm text-indigo-700">
            👋 You are viewing this as <strong>{guardian.name}</strong> ({guardian.role.replace('_', ' ')})
          </div>
        </div>

        {/* Vaccines */}
        {vaccines.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
            <h2 className="text-xl font-bold mb-4">🗓️ Vaccines</h2>
            <div className="space-y-2">
              {vaccines.map((v, i) => (
                <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{v.name}</span>
                  <span className="text-sm text-gray-600">
                    Given: {new Date(v.date_given).toLocaleDateString()}
                    {v.due_date && ` • Due: ${new Date(v.due_date).toLocaleDateString()}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Weights */}
        {weights.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
            <h2 className="text-xl font-bold mb-4">⚖️ Recent Weights</h2>
            <div className="space-y-2">
              {weights.map((w, i) => (
                <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span>{w.date}</span>
                  <span className="font-medium">{Number(w.weight_kg || w.weight || 0).toFixed(1)} kg</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Memories (only for family/primary) */}
        {memories.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
            <h2 className="text-xl font-bold mb-4">📸 Memories</h2>
            <div className="space-y-4">
              {memories.map((m, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <h3 className="font-bold">{m.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(m.date).toLocaleDateString()}
                    {m.tags && ` • ${m.tags}`}
                  </p>
                  {m.content && <p className="mt-2 text-gray-700">{m.content}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-400 mt-8 pb-8">
          <p>Powered by <strong>VuraPet</strong> 🐾</p>
          <p className="mt-1">Your Pet's Lifetime Companion</p>
        </div>
      </div>
    </div>
  );
}