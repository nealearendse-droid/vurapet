'use client';

import { useParams } from 'next/navigation';
import VaccinationTracker from '@/components/VaccineCalendar';

export default function VaccinesPage() {
  const params = useParams();
  const petId = params.id as string;

  return (
    <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
      <VaccinationTracker petId={petId} />
    </div>
  );
}