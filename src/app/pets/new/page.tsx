'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function NewPet() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  // Basic Info
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Dog');
  const [breed, setBreed] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState('');
  const [reproductiveStatus, setReproductiveStatus] = useState('');
  const [microchipNumber, setMicrochipNumber] = useState('');

  // Health Info
  const [allergies, setAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState('');

  // Vet Info
  const [primaryVetName, setPrimaryVetName] = useState('');
  const [primaryVetClinic, setPrimaryVetClinic] = useState('');
  const [primaryVetContact, setPrimaryVetContact] = useState('');
  const [emergencyVetName, setEmergencyVetName] = useState('');
  const [emergencyVetClinic, setEmergencyVetClinic] = useState('');
  const [emergencyVetContact, setEmergencyVetContact] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('Please log in first');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('pets').insert([
      {
        name,
        species,
        breed: breed || null,
        date_of_birth: dateOfBirth || null,
        sex: sex || null,
        reproductive_status: reproductiveStatus || null,
        microchip_number: microchipNumber || null,
        allergies: allergies || null,
        chronic_conditions: chronicConditions || null,
        special_needs: specialNeeds || null,
        primary_vet_name: primaryVetName || null,
        primary_vet_clinic: primaryVetClinic || null,
        primary_vet_contact: primaryVetContact || null,
        emergency_vet_name: emergencyVetName || null,
        emergency_vet_clinic: emergencyVetClinic || null,
        emergency_vet_contact: emergencyVetContact || null,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="text-blue-600 hover:underline font-medium">
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold mt-4 mb-2">Add New Pet</h1>
        <p className="text-gray-600 mb-6">Fill in what you know — you can always update later.</p>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Section 1: Basic Info */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">🐾 Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name *</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Buddy, Whiskers, Sylar..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Species *</label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg p-3"
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                >
                  <option value="Dog">🐕 Dog</option>
                  <option value="Cat">🐈 Cat</option>
                  <option value="Bird">🦜 Bird</option>
                  <option value="Rabbit">🐰 Rabbit</option>
                  <option value="Fish">🐠 Fish</option>
                  <option value="Hamster">🐹 Hamster</option>
                  <option value="Other">✨ Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder="e.g. Golden Retriever, Persian..."
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-3"
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                >
                  <option value="">Not specified</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reproductive Status</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-3"
                  value={reproductiveStatus}
                  onChange={(e) => setReproductiveStatus(e.target.value)}
                >
                  <option value="">Not specified</option>
                  <option value="Intact">Intact</option>
                  <option value="Neutered">Neutered</option>
                  <option value="Spayed">Spayed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Microchip Number</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder="Optional"
                  value={microchipNumber}
                  onChange={(e) => setMicrochipNumber(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Health Info */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">🏥 Health Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Known Allergies</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder="e.g. Chicken, certain medications..."
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chronic Conditions</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder="e.g. Hip dysplasia, diabetes..."
                  value={chronicConditions}
                  onChange={(e) => setChronicConditions(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Needs</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3"
                  rows={2}
                  placeholder="Any special care instructions..."
                  value={specialNeeds}
                  onChange={(e) => setSpecialNeeds(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Vet Info */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">👨‍⚕️ Veterinary Information</h2>

            <h3 className="font-medium text-gray-700 mb-3">Primary Vet</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vet Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder="e.g. Dr. Smith"
                  value={primaryVetName}
                  onChange={(e) => setPrimaryVetName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clinic</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder="e.g. ABC Vet Clinic"
                  value={primaryVetClinic}
                  onChange={(e) => setPrimaryVetClinic(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder="e.g. 021 123 4567"
                  value={primaryVetContact}
                  onChange={(e) => setPrimaryVetContact(e.target.value)}
                />
              </div>
            </div>

            <h3 className="font-medium text-gray-700 mb-3">Emergency Vet (24-hour)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vet Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder="e.g. Emergency Vet"
                  value={emergencyVetName}
                  onChange={(e) => setEmergencyVetName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clinic</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder="e.g. 24hr Animal Hospital"
                  value={emergencyVetClinic}
                  onChange={(e) => setEmergencyVetClinic(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder="e.g. 021 987 6543"
                  value={emergencyVetContact}
                  onChange={(e) => setEmergencyVetContact(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-blue-400 transition shadow-sm"
          >
            {loading ? 'Saving...' : '🐾 Create Pet Profile'}
          </button>

        </form>

        <Link href="/dashboard" className="block mt-6 text-center text-gray-500 hover:text-blue-600 underline">
          Cancel & go back
        </Link>
      </div>
    </div>
  );
}