'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type VaccineRecord = {
  id: string;
  pet_id: string;
  type: string | null;
  name: string;
  date_given: string;         // <-- your real column
  due_date: string | null;
  administering_vet: string | null;
  dosage: string | null;
  status: string | null;
  created_at: string;
};

function getDueStatus(dueDate: string | null) {
  if (!dueDate) return { label: 'No due date', color: 'text-gray-500 bg-gray-50 border-gray-200' };

  const today = new Date();
  const due = new Date(dueDate);
  const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (days < 0) return { label: 'Overdue', color: 'text-red-700 bg-red-50 border-red-200' };
  if (days <= 14) return { label: 'Due soon', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  return { label: 'Up to date', color: 'text-green-700 bg-green-50 border-green-200' };
}

export default function VaccineCalendar({ petId }: { petId: string }) {
  const supabase = createSupabaseBrowserClient();

  const [records, setRecords] = useState<VaccineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields (match your schema)
  const [name, setName] = useState('');
  const [type, setType] = useState('Vaccine'); // default
  const [dateGiven, setDateGiven] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [administeringVet, setAdministeringVet] = useState('');
  const [dosage, setDosage] = useState('');

  async function loadRecords() {
    setLoading(true);

    const { data, error } = await supabase
      .from('vaccine_records')
      .select('*')
      .eq('pet_id', petId)
      .order('date_given', { ascending: false });

    if (error) {
      console.error(error);
      alert(error.message);
      setRecords([]);
    } else {
      setRecords((data || []) as VaccineRecord[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (!petId) return;
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petId]);

  async function addRecord(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !dateGiven) {
      alert('Please enter Vaccine Name and Date Given');
      return;
    }

    setSaving(true);

    const { error } = await supabase.from('vaccine_records').insert({
      pet_id: petId,
      type: type || null,
      name,
      date_given: dateGiven,                 // <-- your real column
      due_date: dueDate || null,
      administering_vet: administeringVet || null,
      dosage: dosage || null,
      // status optional (we can compute from due date; leave null for now)
    });

    setSaving(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    // reset form
    setName('');
    setType('Vaccine');
    setDateGiven('');
    setDueDate('');
    setAdministeringVet('');
    setDosage('');

    await loadRecords();
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Vaccine Calendar</h2>

      <form onSubmit={addRecord} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            className="w-full border rounded-lg p-3"
            placeholder="e.g. Rabies, DHPP"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            className="w-full border rounded-lg p-3"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="Vaccine">Vaccine</option>
            <option value="Deworming">Deworming</option>
            <option value="Flea/Tick">Flea/Tick</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date Given *</label>
          <input
            type="date"
            className="w-full border rounded-lg p-3"
            value={dateGiven}
            onChange={(e) => setDateGiven(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Next Due Date</label>
          <input
            type="date"
            className="w-full border rounded-lg p-3"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Administering Vet / Clinic</label>
          <input
            className="w-full border rounded-lg p-3"
            placeholder="e.g. Dr Smith, ABC Vet"
            value={administeringVet}
            onChange={(e) => setAdministeringVet(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Dosage (optional)</label>
          <input
            className="w-full border rounded-lg p-3"
            placeholder="e.g. 1 tablet"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Add Vaccine Record'}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-gray-600">Loading records...</p>
      ) : records.length === 0 ? (
        <p className="text-gray-500">No vaccines recorded yet.</p>
      ) : (
        <div className="space-y-3">
          {records.map((r) => {
            const due = getDueStatus(r.due_date);
            return (
              <div key={r.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-sm text-gray-600">
                      Given: {new Date(r.date_given).toLocaleDateString()}
                      {r.due_date ? ` • Due: ${new Date(r.due_date).toLocaleDateString()}` : ''}
                    </div>
                    {(r.type || r.administering_vet || r.dosage) && (
                      <div className="text-xs text-gray-500 mt-1">
                        {r.type ? `Type: ${r.type}` : ''}
                        {r.type && (r.administering_vet || r.dosage) ? ' • ' : ''}
                        {r.administering_vet ? `Vet: ${r.administering_vet}` : ''}
                        {(r.administering_vet && r.dosage) ? ' • ' : ''}
                        {r.dosage ? `Dosage: ${r.dosage}` : ''}
                      </div>
                    )}
                  </div>

                  <span className={`text-xs px-2 py-1 rounded-full border ${due.color}`}>
                    {due.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}