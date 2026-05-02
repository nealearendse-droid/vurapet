'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

    const { error } = await supabase.from('pets').insert([{
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
    }]);

    if (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="np-page">
      <style>{styles}</style>

      <div className="np-inner">

        {/* Back */}
        <Link href="/dashboard" className="np-back">← Back to Dashboard</Link>

        {/* Page header */}
        <div className="np-page-header">
          <div className="np-page-header-left">
            <h1 className="np-title">Add New Pet</h1>
            <p className="np-subtitle">Fill in what you know — you can always update later.</p>
          </div>
          <div className="np-logo-mark">🐾</div>
        </div>

        {/* Progress hint */}
        <div className="np-steps-row">
          {['Basic Info', 'Health', 'Vet Details'].map((s, i) => (
            <div key={s} className="np-step">
              <div className="np-step-num">{i + 1}</div>
              <span className="np-step-label">{s}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="np-form">

          {/* ── Section 1: Basic Info ── */}
          <div className="np-section">
            <div className="np-section-header">
              <span className="np-section-icon">🐾</span>
              <h2 className="np-section-title">Basic Information</h2>
            </div>

            <div className="np-grid-2">

              <div className="np-field np-col-2">
                <label className="np-label">Pet Name <span className="np-required">*</span></label>
                <input
                  type="text"
                  required
                  className="np-input"
                  placeholder="e.g. Buddy, Whiskers, Luna…"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="np-field">
                <label className="np-label">Species <span className="np-required">*</span></label>
                <select
                  required
                  className="np-input"
                  value={species}
                  onChange={e => setSpecies(e.target.value)}
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

              <div className="np-field">
                <label className="np-label">Breed</label>
                <input
                  type="text"
                  className="np-input"
                  placeholder="e.g. Golden Retriever, Persian…"
                  value={breed}
                  onChange={e => setBreed(e.target.value)}
                />
              </div>

              <div className="np-field">
                <label className="np-label">Date of Birth</label>
                <input
                  type="date"
                  className="np-input np-date"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                />
              </div>

              <div className="np-field">
                <label className="np-label">Sex</label>
                <select className="np-input" value={sex} onChange={e => setSex(e.target.value)}>
                  <option value="">Not specified</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="np-field">
                <label className="np-label">Reproductive Status</label>
                <select className="np-input" value={reproductiveStatus} onChange={e => setReproductiveStatus(e.target.value)}>
                  <option value="">Not specified</option>
                  <option value="Intact">Intact</option>
                  <option value="Neutered">Neutered</option>
                  <option value="Spayed">Spayed</option>
                </select>
              </div>

              <div className="np-field">
                <label className="np-label">Microchip Number</label>
                <input
                  type="text"
                  className="np-input"
                  placeholder="Optional"
                  value={microchipNumber}
                  onChange={e => setMicrochipNumber(e.target.value)}
                />
              </div>

            </div>
          </div>

          {/* ── Section 2: Health ── */}
          <div className="np-section">
            <div className="np-section-header">
              <span className="np-section-icon">🏥</span>
              <h2 className="np-section-title">Health Information</h2>
            </div>

            <div className="np-grid-1">
              <div className="np-field">
                <label className="np-label">Known Allergies</label>
                <input
                  type="text"
                  className="np-input"
                  placeholder="e.g. Chicken, certain medications…"
                  value={allergies}
                  onChange={e => setAllergies(e.target.value)}
                />
              </div>

              <div className="np-field">
                <label className="np-label">Chronic Conditions</label>
                <input
                  type="text"
                  className="np-input"
                  placeholder="e.g. Hip dysplasia, diabetes…"
                  value={chronicConditions}
                  onChange={e => setChronicConditions(e.target.value)}
                />
              </div>

              <div className="np-field">
                <label className="np-label">Special Needs</label>
                <textarea
                  className="np-input np-textarea"
                  rows={3}
                  placeholder="Any special care instructions…"
                  value={specialNeeds}
                  onChange={e => setSpecialNeeds(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Section 3: Vet ── */}
          <div className="np-section">
            <div className="np-section-header">
              <span className="np-section-icon">👨‍⚕️</span>
              <h2 className="np-section-title">Veterinary Information</h2>
            </div>

            <p className="np-vet-sub">Primary Vet</p>
            <div className="np-grid-3">
              <div className="np-field">
                <label className="np-label">Vet Name</label>
                <input type="text" className="np-input" placeholder="e.g. Dr. Smith"
                  value={primaryVetName} onChange={e => setPrimaryVetName(e.target.value)} />
              </div>
              <div className="np-field">
                <label className="np-label">Clinic</label>
                <input type="text" className="np-input" placeholder="e.g. City Animal Clinic"
                  value={primaryVetClinic} onChange={e => setPrimaryVetClinic(e.target.value)} />
              </div>
              <div className="np-field">
                <label className="np-label">Contact Number</label>
                <input type="text" className="np-input" placeholder="e.g. 021 123 4567"
                  value={primaryVetContact} onChange={e => setPrimaryVetContact(e.target.value)} />
              </div>
            </div>

            <div className="np-divider" />

            <p className="np-vet-sub">Emergency Vet <span className="np-vet-24">24-hour</span></p>
            <div className="np-grid-3">
              <div className="np-field">
                <label className="np-label">Vet Name</label>
                <input type="text" className="np-input" placeholder="e.g. Emergency Vet"
                  value={emergencyVetName} onChange={e => setEmergencyVetName(e.target.value)} />
              </div>
              <div className="np-field">
                <label className="np-label">Clinic</label>
                <input type="text" className="np-input" placeholder="e.g. 24hr Animal Hospital"
                  value={emergencyVetClinic} onChange={e => setEmergencyVetClinic(e.target.value)} />
              </div>
              <div className="np-field">
                <label className="np-label">Contact Number</label>
                <input type="text" className="np-input" placeholder="e.g. 021 987 6543"
                  value={emergencyVetContact} onChange={e => setEmergencyVetContact(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="np-submit">
            {loading
              ? <><span className="np-spinner" /> Saving…</>
              : '🐾 Create Pet Profile'
            }
          </button>

        </form>

        <Link href="/dashboard" className="np-cancel">Cancel & go back</Link>

      </div>
    </div>
  );
}

const styles = `
  .np-page {
    background: #0c0a08;
    min-height: 100vh;
    font-family: 'Geist', 'Inter', sans-serif;
    color: #f0ebe4;
  }

  .np-inner {
    max-width: 720px;
    margin: 0 auto;
    padding: 28px 24px 80px;
  }

  /* Back */
  .np-back {
    display: inline-block;
    font-size: 13px; font-weight: 500;
    color: #c47a3a; text-decoration: none;
    margin-bottom: 24px;
    transition: color 0.2s;
  }
  .np-back:hover { color: #e8963d; }

  /* Page header */
  .np-page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .np-title {
    font-size: 28px; font-weight: 700;
    color: #f0ebe4; letter-spacing: -0.02em;
    margin-bottom: 6px;
  }
  .np-subtitle { font-size: 14px; color: #7a6050; }
  .np-logo-mark { font-size: 40px; opacity: 0.3; }

  /* Steps */
  .np-steps-row {
    display: flex;
    gap: 8px;
    margin-bottom: 28px;
  }
  .np-step {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.04);
    border: 0.5px solid rgba(255,255,255,0.08);
    border-radius: 999px;
    padding: 6px 14px;
  }
  .np-step-num {
    width: 20px; height: 20px; border-radius: 50%;
    background: rgba(196,122,58,0.2);
    border: 0.5px solid rgba(196,122,58,0.4);
    color: #c47a3a;
    font-size: 11px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .np-step-label { font-size: 12px; color: #8a7060; font-weight: 500; }

  /* Form */
  .np-form { display: flex; flex-direction: column; gap: 16px; }

  /* Section card */
  .np-section {
    background: #181411;
    border: 0.5px solid rgba(255,255,255,0.07);
    border-radius: 18px;
    padding: 22px 24px;
  }
  .np-section-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 0.5px solid rgba(255,255,255,0.06);
  }
  .np-section-icon { font-size: 20px; }
  .np-section-title {
    font-size: 15px; font-weight: 700; color: #f0ebe4;
  }

  /* Grids */
  .np-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .np-grid-1 { display: flex; flex-direction: column; gap: 14px; }
  .np-grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 14px;
    margin-bottom: 4px;
  }
  .np-col-2 { grid-column: span 2; }

  /* Field */
  .np-field { display: flex; flex-direction: column; gap: 6px; }
  .np-label {
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: #6a5040;
  }
  .np-required { color: #c47a3a; }

  /* Inputs */
  .np-input {
    background: rgba(255,255,255,0.05);
    border: 0.5px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 11px 14px;
    font-size: 14px;
    color: #f0ebe4;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    width: 100%;
  }
  .np-input:focus {
    border-color: rgba(196,122,58,0.5);
    background: rgba(196,122,58,0.05);
  }
  .np-input::placeholder { color: #4a3828; }
  .np-input option { background: #1a1612; color: #f0ebe4; }
  .np-textarea { resize: none; }
  .np-date { color-scheme: dark; }

  /* Vet sub-labels */
  .np-vet-sub {
    font-size: 13px; font-weight: 600; color: #a08060;
    margin-bottom: 12px;
    display: flex; align-items: center; gap: 8px;
  }
  .np-vet-24 {
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    background: rgba(226,75,74,0.15);
    color: #e24b4a;
    border: 0.5px solid rgba(226,75,74,0.3);
    padding: 2px 8px; border-radius: 999px;
  }
  .np-divider {
    height: 0.5px;
    background: rgba(255,255,255,0.06);
    margin: 20px 0;
  }

  /* Submit */
  .np-submit {
    width: 100%;
    background: #c47a3a;
    color: #fff;
    font-size: 16px; font-weight: 700;
    padding: 16px;
    border-radius: 14px;
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: background 0.2s, transform 0.15s;
    margin-top: 8px;
    letter-spacing: 0.01em;
  }
  .np-submit:hover:not(:disabled) {
    background: #d48a46;
    transform: translateY(-1px);
  }
  .np-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Spinner */
  .np-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: np-spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes np-spin { to { transform: rotate(360deg); } }

  /* Cancel */
  .np-cancel {
    display: block; text-align: center;
    margin-top: 20px;
    font-size: 13px; color: #4a3828;
    text-decoration: underline;
    transition: color 0.2s;
  }
  .np-cancel:hover { color: #c47a3a; }

  /* Responsive */
  @media (max-width: 600px) {
    .np-inner { padding: 20px 16px 60px; }
    .np-grid-2 { grid-template-columns: 1fr; }
    .np-grid-3 { grid-template-columns: 1fr; }
    .np-col-2 { grid-column: span 1; }
    .np-steps-row { flex-wrap: wrap; }
    .np-title { font-size: 22px; }
  }
`;