'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
};

function daysFromToday(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const diff = d.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function badgeForScore(score: number) {
  if (score >= 75) return { text: 'Thriving', cls: 'bg-green-100 text-green-700 border-green-200' };
  if (score >= 50) return { text: 'Needs attention', cls: 'bg-amber-100 text-amber-700 border-amber-200' };
  return { text: 'Action required', cls: 'bg-red-100 text-red-700 border-red-200' };
}

export default function PetSummaryCard({ pet }: { pet: Pet }) {
  const supabase = createSupabaseBrowserClient();

  const [score, setScore] = useState<number | null>(null);
  const [nextVaccineDue, setNextVaccineDue] = useState<string | null>(null);
  const [vaccineLabel, setVaccineLabel] = useState<string>('No vaccines yet');
  const [lastWeight, setLastWeight] = useState<{ weight: number; date: string } | null>(null);

  // Very small “good enough” score to show on dashboard (fast).
  // (We keep the detailed score on the pet page.)
  useEffect(() => {
    async function load() {
      // next vaccine due
      const { data: vaccines } = await supabase
        .from('vaccine_records')
        .select('due_date,name')
        .eq('pet_id', pet.id)
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true })
        .limit(1);

      if (vaccines && vaccines.length > 0) {
        const v = vaccines[0] as any;
        setNextVaccineDue(v.due_date);
        const days = daysFromToday(v.due_date);
        if (days < 0) setVaccineLabel(`Overdue: ${v.name}`);
        else if (days <= 14) setVaccineLabel(`Due soon: ${v.name}`);
        else setVaccineLabel(`Next: ${v.name}`);
      } else {
        setNextVaccineDue(null);
        setVaccineLabel('No due dates set');
      }

      // last weight
      const { data: weights } = await supabase
        .from('weight_entries')
        .select('weight,date')
        .eq('pet_id', pet.id)
        .order('date', { ascending: false })
        .limit(1);

      if (weights && weights.length > 0) {
        setLastWeight({ weight: Number((weights[0] as any).weight), date: (weights[0] as any).date });
      } else {
        setLastWeight(null);
      }

      // quick score heuristic
      let s = 30; // base
      if (nextVaccineDue) {
        const days = daysFromToday(nextVaccineDue);
        if (days < 0) s += 0;
        else if (days <= 14) s += 20;
        else s += 40;
      } else {
        s += 10;
      }
      if (lastWeight) {
        const daysAgo = -daysFromToday(lastWeight.date);
        if (daysAgo <= 30) s += 30;
        else s += 10;
      }

      setScore(Math.min(100, s));
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pet.id]);

  const badge = useMemo(() => (score === null ? null : badgeForScore(score)), [score]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{pet.name}</h2>
          <p className="text-sm text-gray-500 capitalize">{pet.species}{pet.breed ? ` • ${pet.breed}` : ''}</p>
        </div>

        {score !== null && badge && (
          <div className={`text-xs px-2 py-1 rounded-full border ${badge.cls}`}>
            {score} • {badge.text}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div>
          <div className="text-gray-500">Vaccines</div>
          <div className="font-medium">
            {vaccineLabel}
            {nextVaccineDue ? ` • ${new Date(nextVaccineDue).toLocaleDateString()}` : ''}
          </div>
        </div>

        <div>
          <div className="text-gray-500">Weight</div>
          <div className="font-medium">
            {lastWeight
              ? `${lastWeight.weight.toFixed(1)} kg • ${new Date(lastWeight.date).toLocaleDateString()}`
              : 'No weight entries yet'}
          </div>
        </div>
      </div>

      <Link
        href={`/pets/${pet.id}`}
        className="mt-5 inline-block text-blue-600 hover:underline font-medium"
      >
        Open profile →
      </Link>
    </div>
  );
}