'use client';

import { useParams } from 'next/navigation';
import SymptomChecker from '@/components/SymptomChecker';

export default function SymptomCheckerPage() {
  const params = useParams();
  const petId = params.id as string;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <SymptomChecker petId={petId} />
    </div>
  );
}