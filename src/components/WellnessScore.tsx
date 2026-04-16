'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type VaccineRecord = {
  id: string;
  due_date: string | null;
};

type WeightEntry = {
  id: string;
  date: string;
  weight: number;
};

function daysBetween(a: Date, b: Date) {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateScore(vaccines: VaccineRecord[], weights: WeightEntry[]) {
  let score = 100;
  const reasons: string[] = [];
  const today = new Date();

  const overdueVaccines = vaccines.filter(
    (v) => v.due_date && new Date(v.due_date) < today
  );

  const dueSoonVaccines = vaccines.filter((v) => {
    if (!v.due_date) return false;
    const days = daysBetween(new Date(v.due_date), today);
    return days >= 0 && days <= 14;
  });

  if (vaccines.length === 0) {
    score -= 20;
    reasons.push('No vaccine records yet');
  } else if (overdueVaccines.length > 0) {
    score -= 35;
    reasons.push(`${overdueVaccines.length} vaccine${overdueVaccines.length > 1 ? 's are' : ' is'} overdue`);
  } else if (dueSoonVaccines.length > 0) {
    score -= 15;
    reasons.push(`${dueSoonVaccines.length} vaccine${dueSoonVaccines.length > 1 ? 's are' : ' is'} due soon`);
  } else {
    reasons.push('Vaccines look up to date');
  }

  if (weights.length === 0) {
    score -= 15;
    reasons.push('No weight history yet');
  } else {
    const sortedWeights = [...weights].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const latestWeight = sortedWeights[sortedWeights.length - 1];

    if (latestWeight) {
      const daysSince = daysBetween(today, new Date(latestWeight.date));
      if (daysSince > 30) {
        score -= 10;
        reasons.push('No recent weight entry');
      } else {
        reasons.push('Recent weight recorded');
      }
    }
  }

  score = Math.max(0, Math.min(100, score));

  let label = 'Thriving';
  let colorClass = 'bg-green-50 text-green-700 border-green-200';

  if (score < 80) {
    label = 'Needs attention';
    colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  if (score < 50) {
    label = 'Action required';
    colorClass = 'bg-red-50 text-red-700 border-red-200';
  }

  return { score, label, colorClass, reasons };
}

export default function WellnessScore({ petId }: { petId: string }) {
  const supabase = createSupabaseBrowserClient();

  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);

      const [vaccinesRes, weightsRes] = await Promise.all([
        supabase
          .from('vaccine_records')
          .select('id, due_date')
          .eq('pet_id', petId)
          .order('due_date', { ascending: true }),

        supabase
          .from('weight_entries')
          .select('id, date, weight')
          .eq('pet_id', petId)
          .order('date', { ascending: true }),
      ]);

      if (!mounted) return;

      if (vaccinesRes.error) {
        console.error(vaccinesRes.error);
      } else {
        setVaccines((vaccinesRes.data || []) as VaccineRecord[]);
      }

      if (weightsRes.error) {
        console.error(weightsRes.error);
      } else {
        setWeights((weightsRes.data || []) as WeightEntry[]);
      }

      setLoading(false);
    }

    if (petId) {
      loadData();
    }

    return () => {
      mounted = false;
    };
  }, [petId, supabase]);

  const result = calculateScore(vaccines, weights);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <p className="text-gray-600">Loading wellness score...</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-2xl p-6 shadow-sm ${result.colorClass}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Wellness Score</h2>
          <p className="text-sm opacity-80">{result.label}</p>
        </div>

        <div className="text-right">
          <div className="text-4xl font-extrabold">{result.score}</div>
          <div className="text-xs opacity-70">out of 100</div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {result.reasons.map((reason) => (
          <div key={reason} className="text-sm">
            • {reason}
          </div>
        ))}
      </div>
    </div>
  );
}