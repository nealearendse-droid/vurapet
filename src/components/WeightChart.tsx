'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function WeightChart({ petId }: { petId: string }) {
  const supabase = createSupabaseBrowserClient();
  const [weights, setWeights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeights() {
      const { data, error } = await supabase
        .from('weight_entries')
        .select('date, weight')
        .eq('pet_id', petId)
        .order('date', { ascending: true });

      if (error) {
        console.error(error);
      } else {
        setWeights(data || []);
      }
      setLoading(false);
    }

    loadWeights();
  }, [petId]);

  if (loading) return <p className="text-gray-600 text-sm">Loading chart...</p>;
  if (weights.length < 2) return <p className="text-gray-500 text-sm">Add at least two weights to see trends</p>;

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Weight Trend</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weights}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} kg`, 'Weight']} />
            <Line type="monotone" dataKey="weight" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}