'use client';
import * as React from 'react';
import Link from 'next/link';
import HealthJournal from '@/components/HealthJournal';

export default function HealthJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href={`/pets/${id}`} className="text-emerald-400 mb-4 inline-block">
        ← Back to Pet Profile
      </Link>
      <HealthJournal petId={id} />
    </div>
  );
}