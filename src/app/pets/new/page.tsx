'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewPet() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Dog');
  const [breed, setBreed] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState('');
  const [microchipNumber, setMicrochipNumber] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState('');
  const [primaryVetName, setPrimaryVetName] = useState('');
  const [primaryVetClinic, setPrimaryVetClinic] = useState('');
  const [primaryVetContact, setPrimaryVetContact] = useState('');
  const [emergencyVetName, setEmergencyVetName] = useState('');
  const [emergencyVetClinic, setEmergencyVetClinic] = useState('');
  const [emergencyVetContact, setEmergencyVetContact] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('Please log in first');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('pets').insert([{
      name,
      species,
      breed: breed || null,
      date_of_birth: dateOfBirth || null,
      sex: sex || null,
      microchip: microchipNumber || null,
      allergies: allergies ? [allergies] : null,
      chronic_conditions: chronicConditions ? [chronicConditions] : null,
      primary_vet: primaryVetName || null,
      vet_clinic: primaryVetClinic || null,
      vet_phone: primaryVetContact || null,
      emergency_vet: emergencyVetName || null,
      user_id: user.id,
    }]);

    if (error) {
      alert(`Error: ${error.message}`);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div style={{ background: '#0c0a08', minHeight: '100vh', color: '#f0ebe4', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 24px 80px' }}>

        <Link href="/dashboard" style={{ color: '#c47a3a', fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>
          &larr; Back to Dashboard
        </Link>

        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>
          Create Pet Profile
        </h1>
        <p style={{ color: '#7a6050', fontSize: 14, marginBottom: 28 }}>
          Fill in your pet&apos;s details below.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Basic Info */}
          <div style={{ background: '#181411', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '22px 24px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: '#f0ebe4' }}>Basic Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Pet Name *</label>
                <input required style={inputStyle} placeholder="e.g. Buddy, Luna..." value={name} onChange={e => setName(e.target.value)} />
              </div>

              <div>
                <label style={labelStyle}>Species *</label>
                <select required style={inputStyle} value={species} onChange={e => setSpecies(e.target.value)}>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Breed</label>
                <input style={inputStyle} placeholder="e.g. Golden Retriever..." value={breed} onChange={e => setBreed(e.target.value)} />
              </div>

              <div>
                <label style={labelStyle}>Date of Birth</label>
                <input type="date" style={{ ...inputStyle, colorScheme: 'dark' }} value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
              </div>

              <div>
                <label style={labelStyle}>Sex</label>
                <select style={inputStyle} value={sex} onChange={e => setSex(e.target.value)}>
                  <option value="">Not specified</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Microchip Number</label>
                <input style={inputStyle} placeholder="Optional" value={microchipNumber} onChange={e => setMicrochipNumber(e.target.value)} />
              </div>

            </div>
          </div>

          {/* Health */}
          <div style={{ background: '#181411', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '22px 24px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: '#f0ebe4' }}>Health Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Known Allergies</label>
                <input style={inputStyle} placeholder="e.g. Chicken, certain medications..." value={allergies} onChange={e => setAllergies(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Chronic Conditions</label>
                <input style={inputStyle} placeholder="e.g. Hip dysplasia, diabetes..." value={chronicConditions} onChange={e => setChronicConditions(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Special Needs</label>
                <textarea style={{ ...inputStyle, resize: 'none' }} rows={3} placeholder="Any special care instructions..." value={specialNeeds} onChange={e => setSpecialNeeds(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Vet Info */}
          <div style={{ background: '#181411', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '22px 24px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: '#f0ebe4' }}>Veterinary Information</h2>

            <p style={{ fontSize: 13, fontWeight: 600, color: '#a08060', marginBottom: 12 }}>Primary Vet</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div><label style={labelStyle}>Vet Name</label><input style={inputStyle} placeholder="e.g. Dr. Smith" value={primaryVetName} onChange={e => setPrimaryVetName(e.target.value)} /></div>
              <div><label style={labelStyle}>Clinic</label><input style={inputStyle} placeholder="e.g. City Animal Clinic" value={primaryVetClinic} onChange={e => setPrimaryVetClinic(e.target.value)} /></div>
              <div><label style={labelStyle}>Contact</label><input style={inputStyle} placeholder="e.g. 021 123 4567" value={primaryVetContact} onChange={e => setPrimaryVetContact(e.target.value)} /></div>
            </div>

            <p style={{ fontSize: 13, fontWeight: 600, color: '#a08060', marginBottom: 12 }}>Emergency Vet</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div><label style={labelStyle}>Vet Name</label><input style={inputStyle} placeholder="e.g. Emergency Vet" value={emergencyVetName} onChange={e => setEmergencyVetName(e.target.value)} /></div>
              <div><label style={labelStyle}>Clinic</label><input style={inputStyle} placeholder="e.g. 24hr Animal Hospital" value={emergencyVetClinic} onChange={e => setEmergencyVetClinic(e.target.value)} /></div>
              <div><label style={labelStyle}>Contact</label><input style={inputStyle} placeholder="e.g. 021 987 6543" value={emergencyVetContact} onChange={e => setEmergencyVetContact(e.target.value)} /></div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !name}
            style={{ width: '100%', background: '#c47a3a', color: '#fff', fontSize: 16, fontWeight: 700, padding: 16, borderRadius: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading || !name ? 0.5 : 1, marginTop: 8 }}
          >
            {loading ? 'Saving...' : 'Create Pet Profile'}
          </button>

        </form>

        <Link href="/dashboard" style={{ display: 'block', textAlign: 'center', marginTop: 20, fontSize: 13, color: '#4a3828', textDecoration: 'underline' }}>
          Cancel &amp; go back
        </Link>

      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700,
  letterSpacing: '0.08em', textTransform: 'uppercase',
  color: '#6a5040', marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.05)',
  border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10,
  padding: '11px 14px', fontSize: 14, color: '#f0ebe4',
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
};