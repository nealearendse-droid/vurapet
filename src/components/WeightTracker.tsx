'use client';

import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function WeightTracker({
  petId,
  onLatestWeightChange,
}: {
  petId: string;
  onLatestWeightChange?: (weightKg: number | null) => void;
}) {
  const supabase = createSupabaseBrowserClient();

  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [weight, setWeight] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState<string>('');

  async function loadEntries() {
    setLoading(true);
    const { data, error } = await supabase
      .from('weight_entries')
      .select('*')
      .eq('pet_id', petId)
      .order('date', { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setEntries(data || []);

      if (data && data.length > 0) {
        const latest = data[data.length - 1];
        const latestWeight = latest.weight_kg || latest.weight || null;
        onLatestWeightChange?.(Number(latestWeight));
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    loadEntries();
  }, [petId]);

  const chartData = useMemo(
    () =>
      entries.map((e) => ({
        date: e.date,
        weight: Number(e.weight_kg || e.weight || 0),
      })),
    [entries]
  );

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();

    const weightNum = Number(weight);
    if (!weight || Number.isNaN(weightNum) || weightNum <= 0) {
      alert('Please enter a valid weight (example: 12.4)');
      return;
    }
    if (!date) {
      alert('Please choose a date');
      return;
    }

    setSaving(true);

    // Fill in ALL columns so nothing is null
    const { error } = await supabase.from('weight_entries').insert({
      pet_id: petId,
      weight: weightNum,                       // original column
      weight_kg: weightNum,                    // extra column we added
      date: date,                              // original column
      recorded_at: new Date().toISOString(),   // extra column we added
      notes: notes ? notes : null,
    });

    setSaving(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setWeight('');
    setNotes('');
    await loadEntries();
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-2">⚖️ Weight Tracker</h2>
      <p className="text-sm text-gray-600 mb-4">
        Add your pet's weight over time to see trends.
      </p>

      {/* Add Weight Form */}
      <form onSubmit={addEntry} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
          <input
            className="w-full border rounded-lg p-2"
            value={weight}
            onChange={(ev) => setWeight(ev.target.value)}
            placeholder="e.g. 12.4"
            inputMode="decimal"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            className="w-full border rounded-lg p-2"
            value={date}
            onChange={(ev) => setDate(ev.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <input
            className="w-full border rounded-lg p-2"
            value={notes}
            onChange={(ev) => setNotes(ev.target.value)}
            placeholder="e.g. after vet visit"
          />
        </div>

        <div className="md:col-span-3">
          <button
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Add Weight'}
          </button>
        </div>
      </form>

      {/* Content */}
      {loading ? (
        <p className="text-gray-600">Loading weights...</p>
      ) : entries.length === 0 ? (
        <p className="text-gray-500">No weights yet. Add the first one above.</p>
      ) : (
        <>
          {/* Chart - shows after 2+ entries */}
          {entries.length >= 2 && (
            <div className="h-56 w-full mb-6">
              <h3 className="font-semibold mb-2">📈 Growth Trend</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value} kg`, 'Weight']} />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* History List */}
          <div>
            <h3 className="font-semibold mb-2">Recent entries</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              {[...entries].reverse().map((e) => (
                <li key={e.id} className="flex justify-between border-b py-2">
                  <span>{e.date}</span>
                  <span className="font-medium">
                    {Number(e.weight_kg || e.weight || 0).toFixed(1)} kg
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}