'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function VetReportPage() {
  const params = useParams();
  const supabase = createSupabaseBrowserClient();
  const petId = params?.id as string;

  const [pet, setPet] = useState<any>(null);
  const [vaccines, setVaccines] = useState<any[]>([]);
  const [weights, setWeights] = useState<any[]>([]);
  const [journal, setJournal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!petId) return;

    async function loadAll() {
      setLoading(true);

      // Load pet
      const { data: petData } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();

      if (petData) setPet(petData);

      // Load vaccines
      const { data: vaccineData } = await supabase
        .from('vaccine_records')
        .select('*')
        .eq('pet_id', petId)
        .order('date_given', { ascending: false });

      if (vaccineData) setVaccines(vaccineData);

      // Load weights
      const { data: weightData } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('pet_id', petId)
        .order('date', { ascending: false })
        .limit(10);

      if (weightData) setWeights(weightData);

      // Load recent journal entries
      const { data: journalData } = await supabase
        .from('health_journal')
        .select('*')
        .eq('pet_id', petId)
        .order('date', { ascending: false })
        .limit(10);

      if (journalData) setJournal(journalData);

      setLoading(false);
    }

    loadAll();
  }, [petId]);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Generating report...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="p-10">
        <p className="text-red-600">Pet not found</p>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const latestWeight = weights.length > 0
    ? Number(weights[0].weight_kg || weights[0].weight || 0).toFixed(1)
    : null;

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            font-size: 12pt;
            color: #000;
          }
          .print-page {
            padding: 0 !important;
            max-width: 100% !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      {/* Action Bar (hidden when printing) */}
      <div className="no-print bg-blue-600 text-white p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href={`/pets/${petId}`} className="text-white hover:underline">
            ← Back to {pet.name}
          </Link>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50"
            >
              🖨️ Print / Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="print-page max-w-4xl mx-auto p-8 bg-white min-h-screen">

        {/* Report Header */}
        <div className="border-b-4 border-blue-600 pb-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">
                Vet-Ready Report
              </h1>
              <p className="text-lg text-gray-500 mt-1">
                Complete health record for {pet.name}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">VuraPet</div>
              <div className="text-sm text-gray-500">Generated: {today}</div>
            </div>
          </div>
        </div>

        {/* Pet Information */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-600 border-b-2 border-blue-100 pb-2 mb-4">
            🐾 Pet Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500 text-sm">Name</span>
              <p className="font-semibold text-lg">{pet.name}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Species</span>
              <p className="font-semibold capitalize">{pet.species}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Breed</span>
              <p className="font-semibold">{pet.breed || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Date of Birth</span>
              <p className="font-semibold">
                {pet.date_of_birth
                  ? new Date(pet.date_of_birth).toLocaleDateString('en-ZA')
                  : 'Not specified'}
              </p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Sex</span>
              <p className="font-semibold">{pet.sex || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Microchip Number</span>
              <p className="font-semibold">{pet.microchip_number || 'Not recorded'}</p>
            </div>
            {latestWeight && (
              <div>
                <span className="text-gray-500 text-sm">Current Weight</span>
                <p className="font-semibold">{latestWeight} kg</p>
              </div>
            )}
          </div>

          {/* Allergies & Conditions */}
          {(pet.allergies || pet.chronic_conditions || pet.special_needs) && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-bold text-red-700 mb-2">⚠️ Important Health Notes</h3>
              {pet.allergies && (
                <p className="text-sm"><strong>Allergies:</strong> {pet.allergies}</p>
              )}
              {pet.chronic_conditions && (
                <p className="text-sm"><strong>Chronic Conditions:</strong> {pet.chronic_conditions}</p>
              )}
              {pet.special_needs && (
                <p className="text-sm"><strong>Special Needs:</strong> {pet.special_needs}</p>
              )}
            </div>
          )}
        </section>

        {/* Vaccine History */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-600 border-b-2 border-blue-100 pb-2 mb-4">
            🗓️ Vaccine & Treatment History
          </h2>
          {vaccines.length === 0 ? (
            <p className="text-gray-500">No vaccine records.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3 font-semibold">Vaccine / Treatment</th>
                  <th className="text-left p-3 font-semibold">Type</th>
                  <th className="text-left p-3 font-semibold">Date Given</th>
                  <th className="text-left p-3 font-semibold">Next Due</th>
                  <th className="text-left p-3 font-semibold">Vet</th>
                </tr>
              </thead>
              <tbody>
                {vaccines.map((v) => {
                  const isOverdue = v.due_date && new Date(v.due_date) < new Date();
                  return (
                    <tr key={v.id} className="border-b">
                      <td className="p-3 font-medium">{v.name}</td>
                      <td className="p-3">{v.type || '-'}</td>
                      <td className="p-3">
                        {new Date(v.date_given).toLocaleDateString('en-ZA')}
                      </td>
                      <td className={`p-3 ${isOverdue ? 'text-red-600 font-bold' : ''}`}>
                        {v.due_date
                          ? `${new Date(v.due_date).toLocaleDateString('en-ZA')}${isOverdue ? ' (OVERDUE)' : ''}`
                          : '-'}
                      </td>
                      <td className="p-3">{v.administering_vet || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        {/* Weight History */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-600 border-b-2 border-blue-100 pb-2 mb-4">
            ⚖️ Weight History (Last 10 entries)
          </h2>
          {weights.length === 0 ? (
            <p className="text-gray-500">No weight records.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3 font-semibold">Date</th>
                  <th className="text-left p-3 font-semibold">Weight</th>
                  <th className="text-left p-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {weights.map((w) => (
                  <tr key={w.id} className="border-b">
                    <td className="p-3">{w.date}</td>
                    <td className="p-3 font-medium">
                      {Number(w.weight_kg || w.weight || 0).toFixed(1)} kg
                    </td>
                    <td className="p-3 text-gray-600">{w.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Health Journal */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-600 border-b-2 border-blue-100 pb-2 mb-4">
            🏥 Recent Health Journal (Last 10 entries)
          </h2>
          {journal.length === 0 ? (
            <p className="text-gray-500">No journal entries.</p>
          ) : (
            <div className="space-y-4">
              {journal.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold">
                      {new Date(entry.date).toLocaleDateString('en-ZA')}
                    </span>
                    {entry.vet_visit && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        Vet Visit
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                    <div>
                      <span className="text-gray-500">Appetite: </span>
                      <span className="font-medium">{entry.appetite || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Energy: </span>
                      <span className="font-medium">{entry.energy_level || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Stool: </span>
                      <span className="font-medium">{entry.stool_quality || '-'}</span>
                    </div>
                  </div>

                  {entry.symptoms && (
                    <p className="text-sm text-red-700 bg-red-50 p-2 rounded mt-1">
                      <strong>Symptoms:</strong> {entry.symptoms}
                    </p>
                  )}

                  {entry.vet_notes && (
                    <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded mt-1">
                      <strong>Vet Notes:</strong> {entry.vet_notes}
                    </p>
                  )}

                  {entry.notes && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Notes:</strong> {entry.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 pt-6 mt-8">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              <p className="font-semibold text-gray-700">VuraPet — Your Pet's Lifetime Companion</p>
              <p>This report was generated on {today}</p>
            </div>
            <div className="text-right">
              <p>vurapet.co.za</p>
              <p>support@vurapet.co.za</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            This report is for informational purposes only and does not constitute medical advice.
            Always consult with a qualified veterinarian for your pet's health needs.
          </p>
        </div>
      </div>
    </>
  );
}