'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ProtectionStatus({ petId }: { petId: string }) {
  const supabase = createSupabaseBrowserClient();
  const [hasGuardian, setHasGuardian] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkStatus() {
      const { count, error } = await supabase
        .from('guardians')
        .select('*', { count: 'exact', head: true })
        .eq('pet_id', petId)
        .eq('is_active', true);

      if (!error) {
        setHasGuardian(count && count > 0);
      }
    }

    checkStatus();
  }, [petId]);

  if (hasGuardian === null) return null;

  // ✅ Protected
  if (hasGuardian) {
    return (
      <div className="bg-green-50 border-2 border-green-400 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🛡️</div>
            <div>
              <h3 className="font-bold text-green-800 text-lg">✅ Your Pet is Protected</h3>
              <p className="text-sm text-green-700">Someone will know exactly what to do if something happens to you.</p>
            </div>
          </div>
          <Link href="/guardian" className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
            Manage Guardians
          </Link>
        </div>
      </div>
    );
  }

  // 🔴 NOT Protected
  return (
    <div className="bg-red-50 border-2 border-red-400 rounded-xl p-5 mb-6 shadow-md">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">⚠️</div>
          <div>
            <h3 className="font-bold text-red-800 text-xl">Your Pet is NOT Protected Yet</h3>
            <p className="text-sm text-red-700 mt-1">If something happens to you, no one will know how to care for your pet correctly.</p>
          </div>
        </div>
        <Link href="/guardian" className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold text-lg hover:bg-red-700 shadow-lg">
          Add a Guardian Now →
        </Link>
      </div>
    </div>
  );
}