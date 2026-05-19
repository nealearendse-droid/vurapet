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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">📋 Care Profile</h2>
            <p className="text-orange-100 text-sm mt-1">
              Shared with your guardian when they open their link
            </p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              ✏️ Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg text-sm font-bold transition"
              >
                💾 Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        
        {/* Feeding Instructions - Orange themed */}
        <div className="border-l-4 border-orange-400 pl-4">
          <h3 className="font-bold text-gray-800 text-lg mb-2 flex items-center gap-2">
            <span className="text-2xl">🍽️</span> Feeding Instructions
          </h3>
          {!editing ? (
            <p className="text-gray-700 leading-relaxed">
              {formData.feeding_instructions || (
                <span className="text-gray-400 italic">Not set — tap Edit to add</span>
              )}
            </p>
          ) : (
            <textarea
              value={formData.feeding_instructions}
              onChange={(e) => setFormData({ ...formData, feeding_instructions: e.target.value })}
              placeholder="e.g. 1 cup of kibble at 8am and 5pm. No table scraps. Fresh water always available."
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none text-gray-800"
              rows={3}
            />
          )}
        </div>

        {/* Medications - Blue themed */}
        <div className="border-l-4 border-blue-400 pl-4">
          <h3 className="font-bold text-gray-800 text-lg mb-2 flex items-center gap-2">
            <span className="text-2xl">💊</span> Medications
          </h3>
          {!editing ? (
            <p className="text-gray-700 leading-relaxed">
              {formData.medications || (
                <span className="text-gray-400 italic">Not set — tap Edit to add</span>
              )}
            </p>
          ) : (
            <textarea
              value={formData.medications}
              onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
              placeholder="e.g. Apoquel 8mg - once daily with breakfast. Heartgard - 1st of every month."
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none text-gray-800"
              rows={3}
            />
          )}
        </div>

        {/* Daily Routine - Green themed */}
        <div className="border-l-4 border-green-400 pl-4">
          <h3 className="font-bold text-gray-800 text-lg mb-2 flex items-center gap-2">
            <span className="text-2xl">📋</span> Daily Routine
          </h3>
          {!editing ? (
            <p className="text-gray-700 leading-relaxed">
              {formData.daily_routine || (
                <span className="text-gray-400 italic">Not set — tap Edit to add</span>
              )}
            </p>
          ) : (
            <textarea
              value={formData.daily_routine}
              onChange={(e) => setFormData({ ...formData, daily_routine: e.target.value })}
              placeholder="e.g. 7am - Walk, 8am - Breakfast, 12pm - Potty break, 6pm - Dinner, 9pm - Last walk"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-400 focus:outline-none text-gray-800"
              rows={3}
            />
          )}
        </div>

        {/* Personality & Behaviour - Purple themed */}
        <div className="border-l-4 border-purple-400 pl-4">
          <h3 className="font-bold text-gray-800 text-lg mb-2 flex items-center gap-2">
            <span className="text-2xl">🎭</span> Personality & Behaviour
          </h3>
          {!editing ? (
            <p className="text-gray-700 leading-relaxed">
              {formData.personality || (
                <span className="text-gray-400 italic">Not set — tap Edit to add</span>
              )}
            </p>
          ) : (
            <textarea
              value={formData.personality}
              onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
              placeholder="e.g. Friendly with people, scared of loud noises, loves belly rubs, good with children"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none text-gray-800"
              rows={3}
            />
          )}
        </div>

        {/* Red Flags - Red themed */}
        <div className="border-l-4 border-red-400 bg-red-50/30 rounded-r-lg">
          <div className="pl-4 pr-4 py-3">
            <h3 className="font-bold text-red-700 text-lg mb-2 flex items-center gap-2">
              <span className="text-2xl">🚨</span> Red Flags & Warning Signs
            </h3>
            {!editing ? (
              <p className="text-gray-700 leading-relaxed">
                {formData.red_flags || (
                  <span className="text-gray-400 italic">Not set — tap Edit to add</span>
                )}
              </p>
            ) : (
              <textarea
                value={formData.red_flags}
                onChange={(e) => setFormData({ ...formData, red_flags: e.target.value })}
                placeholder="e.g. Lethargy, not eating for 24 hours, excessive vomiting, difficulty breathing"
                className="w-full p-3 border-2 border-red-200 rounded-lg focus:border-red-400 focus:outline-none text-gray-800"
                rows={3}
              />
            )}
          </div>
        </div>

        {/* Emergency Steps - Red themed */}
        <div className="border-l-4 border-red-400 bg-red-50/30 rounded-r-lg">
          <div className="pl-4 pr-4 py-3">
            <h3 className="font-bold text-red-700 text-lg mb-2 flex items-center gap-2">
              <span className="text-2xl">🆘</span> Emergency Steps
            </h3>
            {!editing ? (
              <p className="text-gray-700 leading-relaxed">
                {formData.emergency_steps || (
                  <span className="text-gray-400 italic">Not set — tap Edit to add</span>
                )}
              </p>
            ) : (
              <textarea
                value={formData.emergency_steps}
                onChange={(e) => setFormData({ ...formData, emergency_steps: e.target.value })}
                placeholder="e.g. Call vet immediately, keep calm, apply pressure to bleeding, transport safely"
                className="w-full p-3 border-2 border-red-200 rounded-lg focus:border-red-400 focus:outline-none text-gray-800"
                rows={3}
              />
            )}
          </div>
        </div>

        {/* Vet & Medical - Teal themed */}
        <div className="border-l-4 border-teal-400 pl-4">
          <h3 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2">
            <span className="text-2xl">🏥</span> Vet & Medical
          </h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">🏥 Primary Vet</label>
                {!editing ? (
                  <p className="text-gray-800 bg-gray-50 p-2 rounded">{formData.vet_name || <span className="text-gray-400 italic">Not set</span>}</p>
                ) : (
                  <input
                    type="text"
                    value={formData.vet_name}
                    onChange={(e) => setFormData({ ...formData, vet_name: e.target.value })}
                    placeholder="Dr. Smith"
                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none text-gray-800"
                  />
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">📞 Vet Phone</label>
                {!editing ? (
                  <p className="text-gray-800 bg-gray-50 p-2 rounded">{formData.vet_phone || <span className="text-gray-400 italic">Not set</span>}</p>
                ) : (
                  <input
                    type="text"
                    value={formData.vet_phone}
                    onChange={(e) => setFormData({ ...formData, vet_phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none text-gray-800"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">🏢 Vet Clinic</label>
              {!editing ? (
                <p className="text-gray-800 bg-gray-50 p-2 rounded">{formData.vet_clinic || <span className="text-gray-400 italic">Not set</span>}</p>
              ) : (
                <input
                  type="text"
                  value={formData.vet_clinic}
                  onChange={(e) => setFormData({ ...formData, vet_clinic: e.target.value })}
                  placeholder="Animal Wellness Clinic"
                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none text-gray-800"
                />
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">🚨 Emergency Vet</label>
              {!editing ? (
                <p className="text-gray-800 bg-gray-50 p-2 rounded">{formData.emergency_vet || <span className="text-gray-400 italic">Not set</span>}</p>
              ) : (
                <input
                  type="text"
                  value={formData.emergency_vet}
                  onChange={(e) => setFormData({ ...formData, emergency_vet: e.target.value })}
                  placeholder="Emergency Veterinary Hospital"
                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none text-gray-800"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          💡 This information is shared with your pet's guardian for emergency care
        </p>
      </div>
    </div>
  );
}