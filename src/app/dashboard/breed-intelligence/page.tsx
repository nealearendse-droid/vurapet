'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import BreedIntelligenceBrief from '@/components/BreedIntelligenceBrief';
import { allBreeds } from '@/data/breeds';

export default function BreedIntelligencePage() {
  const router = useRouter();
  const [pets, setPets] = useState<any[]>([]);
  const [selectedBreed, setSelectedBreed] = useState<string>('');
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth/login'); return; }
      const { data: petsData } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });
      const list = petsData || [];
      setPets(list);
      if (list.length > 0) {
        setSelectedPet(list[0]);
        setSelectedBreed(list[0].breed || '');
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const dogBreeds = allBreeds.filter((b) => b.species === 'dog');
  const catBreeds = allBreeds.filter((b) => b.species === 'cat');

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🧠</div>
        <p style={{ color: '#6b7280', fontWeight: 500 }}>Loading Breed Intelligence...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => router.push('/dashboard')}>
          ← Dashboard
        </button>
        <div>
          <h1 style={styles.pageTitle}>🧠 Breed Intelligence</h1>
          <p style={styles.pageSubtitle}>AI-powered breed analysis — know what you're actually dealing with.</p>
        </div>
      </div>

      {/* Breed selector */}
      <div style={styles.selectorCard}>
        {/* Pet selector if user has pets */}
        {pets.length > 0 && (
          <div style={styles.selectorRow}>
            <label style={styles.selectorLabel}>Your Pets</label>
            <div style={styles.petPills}>
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  style={{
                    ...styles.petPill,
                    ...(selectedPet?.id === pet.id ? styles.petPillActive : {}),
                  }}
                  onClick={() => {
                    setSelectedPet(pet);
                    setSelectedBreed(pet.breed || '');
                  }}
                >
                  {pet.name}
                </button>
              ))}
              <button
                style={{
                  ...styles.petPill,
                  ...(!selectedPet ? styles.petPillActive : {}),
                }}
                onClick={() => {
                  setSelectedPet(null);
                  setSelectedBreed('');
                }}
              >
                Other breed
              </button>
            </div>
          </div>
        )}

        {/* Manual breed selector */}
        <div style={styles.selectorRow}>
          <label style={styles.selectorLabel}>Select a Breed to Analyse</label>
          <div style={styles.breedColumns}>
            <div>
              <p style={styles.speciesLabel}>🐶 Dogs</p>
              <div style={styles.breedGrid}>
                {dogBreeds.map((b) => (
                  <button
                    key={b.name}
                    style={{
                      ...styles.breedChip,
                      ...(selectedBreed === b.name ? styles.breedChipActive : {}),
                    }}
                    onClick={() => {
                      setSelectedBreed(b.name);
                      setSelectedPet(null);
                    }}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p style={styles.speciesLabel}>🐱 Cats</p>
              <div style={styles.breedGrid}>
                {catBreeds.map((b) => (
                  <button
                    key={b.name}
                    style={{
                      ...styles.breedChip,
                      ...(selectedBreed === b.name ? styles.breedChipActive : {}),
                    }}
                    onClick={() => {
                      setSelectedBreed(b.name);
                      setSelectedPet(null);
                    }}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main feature */}
      {selectedBreed ? (
        <BreedIntelligenceBrief
          breed={selectedBreed}
          petName={selectedPet?.name}
          key={selectedBreed}
        />
      ) : (
        <div style={styles.emptyState}>
          <span style={{ fontSize: 36 }}>🧠</span>
          <p style={styles.emptyTitle}>Select a breed above to begin your analysis</p>
          <p style={styles.emptySub}>25 breeds available — dogs and cats.</p>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '24px 16px 48px',
    fontFamily: 'system-ui, sans-serif',
  },
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
  },
  header: { marginBottom: 24 },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#f97316',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    padding: '0 0 12px',
    display: 'block',
  },
  pageTitle: { fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 4px' },
  pageSubtitle: { fontSize: 14, color: '#6b7280', margin: 0 },
  selectorCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: '20px',
    marginBottom: 20,
  },
  selectorRow: { marginBottom: 20 },
  selectorLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#6b7280',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    display: 'block',
    marginBottom: 10,
  },
  petPills: { display: 'flex', gap: 8, flexWrap: 'wrap' as const },
  petPill: {
    background: '#f3f4f6',
    border: '2px solid transparent',
    borderRadius: 20,
    padding: '6px 16px',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    cursor: 'pointer',
  },
  petPillActive: {
    background: '#fff7ed',
    borderColor: '#f97316',
    color: '#f97316',
  },
  breedColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
  },
  speciesLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#374151',
    margin: '0 0 8px',
  },
  breedGrid: { display: 'flex', flexWrap: 'wrap' as const, gap: 6 },
  breedChip: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '5px 10px',
    fontSize: 12,
    fontWeight: 500,
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  breedChipActive: {
    background: '#fff7ed',
    borderColor: '#f97316',
    color: '#f97316',
    fontWeight: 700,
  },
  emptyState: {
    background: '#f9fafb',
    border: '2px dashed #e5e7eb',
    borderRadius: 16,
    padding: '48px 24px',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: 600, color: '#374151', margin: 0 },
  emptySub: { fontSize: 13, color: '#9ca3af', margin: 0 },
};