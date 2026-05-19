'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

interface CareProfileProps {
  petId: string;
}

export default function CareProfile({ petId }: CareProfileProps) {
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    feeding_instructions: '',
    medications: '',
    daily_routine: '',
    personality: '',
    red_flags: '',
    emergency_steps: '',
    vet_name: '',
    vet_phone: '',
    vet_clinic: '',
    emergency_vet: '',
  });

  useEffect(() => {
    async function loadPet() {
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();
      
      if (data) {
        setPet(data);
        setFormData({
          feeding_instructions: data.feeding_instructions || '',
          medications: data.medications || '',
          daily_routine: data.daily_routine || '',
          personality: data.personality || '',
          red_flags: data.red_flags || '',
          emergency_steps: data.emergency_steps || '',
          vet_name: data.vet_name || '',
          vet_phone: data.vet_phone || '',
          vet_clinic: data.vet_clinic || '',
          emergency_vet: data.emergency_vet || '',
        });
      }
      setLoading(false);
    }
    
    loadPet();
  }, [petId]);

  const handleSave = async () => {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from('pets')
      .update({
        feeding_instructions: formData.feeding_instructions,
        medications: formData.medications,
        daily_routine: formData.daily_routine,
        personality: formData.personality,
        red_flags: formData.red_flags,
        emergency_steps: formData.emergency_steps,
        vet_name: formData.vet_name,
        vet_phone: formData.vet_phone,
        vet_clinic: formData.vet_clinic,
        emergency_vet: formData.emergency_vet,
      })
      .eq('id', petId);
    
    if (!error) {
      setEditing(false);
      alert('✅ Care profile saved!');
    } else {
      alert('❌ Error saving: ' + error.message);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading care profile...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">📋 Care Profile</h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-emerald-600 hover:text-emerald-700"
          >
            ✏️ Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-sm bg-emerald-600 text-white px-3 py-1 rounded-lg hover:bg-emerald-700"
            >
              💾 Save
            </button>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500 -mt-2">
        Shared with your guardian when they open their link.
      </p>

      {/* Feeding Instructions */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-700 mb-2">🍽️ Feeding Instructions</h3>
        {!editing ? (
          <p className="text-gray-600">{formData.feeding_instructions || <span className="text-gray-400 italic">Not set — tap Edit to add</span>}</p>
        ) : (
          <textarea
            value={formData.feeding_instructions}
            onChange={(e) => setFormData({ ...formData, feeding_instructions: e.target.value })}
            placeholder="e.g. 1 cup of kibble at 8am and 5pm. No table scraps."
            className="w-full p-2 border rounded-lg"
            rows={2}
          />
        )}
      </div>

      {/* Medications */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-700 mb-2">💊 Medications</h3>
        {!editing ? (
          <p className="text-gray-600">{formData.medications || <span className="text-gray-400 italic">Not set — tap Edit to add</span>}</p>
        ) : (
          <textarea
            value={formData.medications}
            onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
            placeholder="e.g. Apoquel 8mg - once daily with breakfast"
            className="w-full p-2 border rounded-lg"
            rows={2}
          />
        )}
      </div>

      {/* Daily Routine */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-700 mb-2">📋 Daily Routine</h3>
        {!editing ? (
          <p className="text-gray-600">{formData.daily_routine || <span className="text-gray-400 italic">Not set — tap Edit to add</span>}</p>
        ) : (
          <textarea
            value={formData.daily_routine}
            onChange={(e) => setFormData({ ...formData, daily_routine: e.target.value })}
            placeholder="e.g. Walk at 7am, nap 10am-2pm, dinner at 6pm"
            className="w-full p-2 border rounded-lg"
            rows={2}
          />
        )}
      </div>

      {/* Personality & Behaviour */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-700 mb-2">🎭 Personality & Behaviour</h3>
        {!editing ? (
          <p className="text-gray-600">{formData.personality || <span className="text-gray-400 italic">Not set — tap Edit to add</span>}</p>
        ) : (
          <textarea
            value={formData.personality}
            onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
            placeholder="e.g. Friendly with people, scared of loud noises, loves belly rubs"
            className="w-full p-2 border rounded-lg"
            rows={2}
          />
        )}
      </div>

      {/* Red Flags */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-red-600 mb-2">🚨 Red Flags & Warning Signs</h3>
        {!editing ? (
          <p className="text-gray-600">{formData.red_flags || <span className="text-gray-400 italic">Not set — tap Edit to add</span>}</p>
        ) : (
          <textarea
            value={formData.red_flags}
            onChange={(e) => setFormData({ ...formData, red_flags: e.target.value })}
            placeholder="e.g. Lethargy, not eating for 24 hours, excessive vomiting"
            className="w-full p-2 border rounded-lg"
            rows={2}
          />
        )}
      </div>

      {/* Emergency Steps */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-red-600 mb-2">🆘 Emergency Steps</h3>
        {!editing ? (
          <p className="text-gray-600">{formData.emergency_steps || <span className="text-gray-400 italic">Not set — tap Edit to add</span>}</p>
        ) : (
          <textarea
            value={formData.emergency_steps}
            onChange={(e) => setFormData({ ...formData, emergency_steps: e.target.value })}
            placeholder="e.g. Call vet immediately, keep calm, apply pressure to bleeding"
            className="w-full p-2 border rounded-lg"
            rows={2}
          />
        )}
      </div>

      {/* Vet & Medical */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-700 mb-2">🏥 Vet & Medical</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-500 block">Primary Vet</label>
            {!editing ? (
              <p className="text-gray-600">{formData.vet_name || <span className="text-gray-400 italic">Not set</span>}</p>
            ) : (
              <input
                type="text"
                value={formData.vet_name}
                onChange={(e) => setFormData({ ...formData, vet_name: e.target.value })}
                placeholder="Dr. Smith"
                className="w-full p-2 border rounded-lg"
              />
            )}
          </div>

          <div>
            <label className="text-sm text-gray-500 block">Vet Phone</label>
            {!editing ? (
              <p className="text-gray-600">{formData.vet_phone || <span className="text-gray-400 italic">Not set</span>}</p>
            ) : (
              <input
                type="text"
                value={formData.vet_phone}
                onChange={(e) => setFormData({ ...formData, vet_phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="w-full p-2 border rounded-lg"
              />
            )}
          </div>

          <div>
            <label className="text-sm text-gray-500 block">Vet Clinic</label>
            {!editing ? (
              <p className="text-gray-600">{formData.vet_clinic || <span className="text-gray-400 italic">Not set</span>}</p>
            ) : (
              <input
                type="text"
                value={formData.vet_clinic}
                onChange={(e) => setFormData({ ...formData, vet_clinic: e.target.value })}
                placeholder="Animal Wellness Clinic"
                className="w-full p-2 border rounded-lg"
              />
            )}
          </div>

          <div>
            <label className="text-sm text-gray-500 block">Emergency Vet</label>
            {!editing ? (
              <p className="text-gray-600">{formData.emergency_vet || <span className="text-gray-400 italic">Not set</span>}</p>
            ) : (
              <input
                type="text"
                value={formData.emergency_vet}
                onChange={(e) => setFormData({ ...formData, emergency_vet: e.target.value })}
                placeholder="Emergency Veterinary Hospital"
                className="w-full p-2 border rounded-lg"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}