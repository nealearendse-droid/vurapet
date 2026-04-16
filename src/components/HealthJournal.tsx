'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type JournalEntry = {
  id: string;
  pet_id: string;
  date: string;
  appetite: string | null;
  energy_level: string | null;
  stool_quality: string | null;
  symptoms: string | null;
  vet_visit: boolean;
  vet_notes: string | null;
  notes: string | null;
  created_at: string;
};

function getStatusEmoji(value: string | null) {
  if (!value) return '⚪';
  const v = value.toLowerCase();
  if (v === 'good' || v === 'normal' || v === 'high') return '🟢';
  if (v === 'fair' || v === 'medium' || v === 'reduced') return '🟡';
  if (v === 'poor' || v === 'low' || v === 'abnormal') return '🔴';
  return '⚪';
}

export default function HealthJournal({ petId }: { petId: string }) {
  const supabase = createSupabaseBrowserClient();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [appetite, setAppetite] = useState('Good');
  const [energyLevel, setEnergyLevel] = useState('Normal');
  const [stoolQuality, setStoolQuality] = useState('Normal');
  const [symptoms, setSymptoms] = useState('');
  const [vetVisit, setVetVisit] = useState(false);
  const [vetNotes, setVetNotes] = useState('');
  const [notes, setNotes] = useState('');

  async function loadEntries() {
    setLoading(true);

    const { data, error } = await supabase
      .from('health_journal')
      .select('*')
      .eq('pet_id', petId)
      .order('date', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setEntries(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (petId) loadEntries();
  }, [petId]);

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();

    if (!date) {
      alert('Please select a date');
      return;
    }

    setSaving(true);

    const { error } = await supabase.from('health_journal').insert({
      pet_id: petId,
      date: date,
      appetite: appetite,
      energy_level: energyLevel,
      stool_quality: stoolQuality,
      symptoms: symptoms.trim() || null,
      vet_visit: vetVisit,
      vet_notes: vetNotes.trim() || null,
      notes: notes.trim() || null,
    });

    setSaving(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    // Reset form
    setDate(new Date().toISOString().slice(0, 10));
    setAppetite('Good');
    setEnergyLevel('Normal');
    setStoolQuality('Normal');
    setSymptoms('');
    setVetVisit(false);
    setVetNotes('');
    setNotes('');
    setShowForm(false);

    await loadEntries();
  }

  async function deleteEntry(entryId: string) {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const { error } = await supabase
      .from('health_journal')
      .delete()
      .eq('id', entryId);

    if (error) {
      alert(error.message);
    } else {
      await loadEntries();
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">🏥 Health Journal</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track daily health observations for your vet visits.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            showForm
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {showForm ? 'Cancel' : '+ New Entry'}
        </button>
      </div>

      {/* Add Entry Form */}
      {showForm && (
        <form onSubmit={addEntry} className="bg-gray-50 rounded-xl p-6 mb-6 border">
          <h3 className="font-semibold mb-4">New Journal Entry</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                required
                className="w-full border rounded-lg p-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Appetite */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appetite {getStatusEmoji(appetite)}
              </label>
              <select
                className="w-full border rounded-lg p-2"
                value={appetite}
                onChange={(e) => setAppetite(e.target.value)}
              >
                <option value="Good">😋 Good - eating normally</option>
                <option value="Reduced">😐 Reduced - eating less than usual</option>
                <option value="Poor">😟 Poor - barely eating</option>
                <option value="None">🚫 None - not eating at all</option>
              </select>
            </div>

            {/* Energy Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Energy Level {getStatusEmoji(energyLevel)}
              </label>
              <select
                className="w-full border rounded-lg p-2"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value)}
              >
                <option value="High">⚡ High - very active and playful</option>
                <option value="Normal">✅ Normal - usual activity</option>
                <option value="Low">😴 Low - more tired than usual</option>
                <option value="Lethargic">🛌 Lethargic - barely moving</option>
              </select>
            </div>

            {/* Stool Quality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stool Quality {getStatusEmoji(stoolQuality)}
              </label>
              <select
                className="w-full border rounded-lg p-2"
                value={stoolQuality}
                onChange={(e) => setStoolQuality(e.target.value)}
              >
                <option value="Normal">✅ Normal</option>
                <option value="Soft">🟡 Soft</option>
                <option value="Diarrhea">🔴 Diarrhea</option>
                <option value="Hard">🟡 Hard / Constipated</option>
                <option value="Blood">🚨 Blood present - see vet!</option>
              </select>
            </div>
          </div>

          {/* Symptoms */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Symptoms (if any)
            </label>
            <textarea
              className="w-full border rounded-lg p-2"
              rows={2}
              placeholder="e.g. Vomiting once this morning, slight limp on left back leg..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
          </div>

          {/* Vet Visit Toggle */}
          <div className="mb-4 flex items-center gap-3">
            <input
              type="checkbox"
              id="vetVisit"
              checked={vetVisit}
              onChange={(e) => setVetVisit(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300"
            />
            <label htmlFor="vetVisit" className="text-sm font-medium text-gray-700">
              This was a vet visit day
            </label>
          </div>

          {/* Vet Notes - only shows if vet visit checked */}
          {vetVisit && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vet Notes
              </label>
              <textarea
                className="w-full border rounded-lg p-2"
                rows={3}
                placeholder="What did the vet say? Any diagnoses, prescriptions, or follow-ups..."
                value={vetNotes}
                onChange={(e) => setVetNotes(e.target.value)}
              />
            </div>
          )}

          {/* General Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other Notes (optional)
            </label>
            <textarea
              className="w-full border rounded-lg p-2"
              rows={2}
              placeholder="Anything else you noticed today..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
          >
            {saving ? 'Saving...' : 'Save Journal Entry'}
          </button>
        </form>
      )}

      {/* Entries List */}
      {loading ? (
        <p className="text-gray-600">Loading journal entries...</p>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500">No journal entries yet.</p>
          <p className="text-gray-400 text-sm mt-1">
            Click "+ New Entry" to start tracking your pet's health.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="border rounded-xl p-4 hover:bg-gray-50 transition">
              {/* Entry Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {new Date(entry.date).toLocaleDateString('en-ZA', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  {entry.vet_visit && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                      🏥 Vet Visit
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="text-gray-400 hover:text-red-500 text-sm transition"
                >
                  Delete
                </button>
              </div>

              {/* Status Indicators */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-500">Appetite</div>
                  <div className="font-medium text-sm">
                    {getStatusEmoji(entry.appetite)} {entry.appetite || '-'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-500">Energy</div>
                  <div className="font-medium text-sm">
                    {getStatusEmoji(entry.energy_level)} {entry.energy_level || '-'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-500">Stool</div>
                  <div className="font-medium text-sm">
                    {getStatusEmoji(entry.stool_quality)} {entry.stool_quality || '-'}
                  </div>
                </div>
              </div>

              {/* Symptoms */}
              {entry.symptoms && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-2">
                  <div className="text-xs font-semibold text-red-700 mb-1">⚠️ Symptoms</div>
                  <div className="text-sm text-red-800">{entry.symptoms}</div>
                </div>
              )}

              {/* Vet Notes */}
              {entry.vet_notes && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-2">
                  <div className="text-xs font-semibold text-blue-700 mb-1">🏥 Vet Notes</div>
                  <div className="text-sm text-blue-800">{entry.vet_notes}</div>
                </div>
              )}

              {/* General Notes */}
              {entry.notes && (
                <div className="text-sm text-gray-600 mt-2">
                  📝 {entry.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}