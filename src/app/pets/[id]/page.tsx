'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import WeightTracker from '@/components/WeightTracker';
import NutritionArchitect from '@/components/NutritionArchitect';
import VaccineCalendar from '@/components/VaccineCalendar';
import WellnessScore from '@/components/WellnessScore';
import HealthJournal from '@/components/HealthJournal';
import MemoryBook from '@/components/MemoryBook';
import GuardianSystem from '@/components/GuardianSystem';
import SymptomChecker from '@/components/SymptomChecker';

export default function PetDetailPage() {
  const params = useParams();
  const supabase = createSupabaseBrowserClient();
  const petId = params?.id as string;

  const [pet, setPet] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<string>('nutrition');
  const [latestWeightKg, setLatestWeightKg] = useState<number | null>(null);

  useEffect(() => {
    if (!petId) return;

    async function loadData() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) setUser(currentUser);

      const { data, error: dbError } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();

      if (dbError || !data) {
        setError('Pet not found');
      } else {
        setPet(data);
      }
      setLoading(false);
    }

    loadData();
  }, [petId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pet...</p>
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar userEmail={user?.email} />
        <div className="p-10 text-center">
          <Link href="/dashboard" className="text-blue-600 underline">← Back</Link>
          <p className="text-red-600 mt-4">{error || 'Pet not found'}</p>
        </div>
      </div>
    );
  }

  const getEmoji = () => {
    if (!pet.species) return '🐾';
    const s = pet.species.toLowerCase();
    if (s.includes('dog')) return '🐕';
    if (s.includes('cat')) return '🐈';
    if (s.includes('bird')) return '🦜';
    if (s.includes('fish')) return '🐠';
    return '🐾';
  };

  const tabs = [
    { id: 'nutrition', label: '🍎 Nutrition' },
    { id: 'weight', label: '⚖️ Weight' },
    { id: 'vaccines', label: '🗓️ Vaccines' },
    { id: 'journal', label: '🏥 Journal' },
    { id: 'symptoms', label: '🩺 Symptoms' },
    { id: 'memories', label: '📸 Memories' },
    { id: 'guardians', label: '🛡️ Guardians' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar with Logo */}
      <Navbar userEmail={user?.email} />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <Link href="/dashboard" className="text-blue-600 hover:underline font-medium">
          ← Back to Dashboard
        </Link>

        {/* Pet Header with Vet Report Button */}
        <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-4xl flex-shrink-0">
              {getEmoji()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
              <p className="text-gray-600 capitalize text-lg mt-1">
                {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
              </p>
            </div>
            <Link
              href={`/pets/${pet.id}/report`}
              className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-sm whitespace-nowrap"
            >
              📄 Vet Report
            </Link>
          </div>
        </div>

        {/* Wellness Score */}
        <div className="mt-6">
          <WellnessScore petId={pet.id} />
        </div>

        {/* Tabs */}
        <div className="mt-6 flex border-b gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6 pb-12">
          {activeTab === 'nutrition' && <NutritionArchitect species={pet.species} latestWeightKg={latestWeightKg} />}
          {activeTab === 'weight' && <WeightTracker petId={pet.id} onLatestWeightChange={setLatestWeightKg} />}
          {activeTab === 'vaccines' && <VaccineCalendar petId={pet.id} />}
          {activeTab === 'journal' && <HealthJournal petId={pet.id} />}
          {activeTab === 'symptoms' && <SymptomChecker petId={pet.id} petName={pet.name} petSpecies={pet.species} />}
          {activeTab === 'memories' && <MemoryBook petId={pet.id} />}
          {activeTab === 'guardians' && <GuardianSystem petId={pet.id} petName={pet.name} />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${
        active
          ? 'border-blue-600 text-blue-700 bg-blue-50 rounded-t-lg'
          : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}