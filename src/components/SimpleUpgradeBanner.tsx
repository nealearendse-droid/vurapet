'use client';
import Link from 'next/link';

export default function SimpleUpgradeBanner() {
  return (
    <div style={{ background: '#c47a3a', padding: '20px', borderRadius: '12px', margin: '20px' }}>
      <h3 style={{ color: 'white' }}>⭐ Upgrade to Pro ⭐</h3>
      <Link href="/upgrade?plan=pro&billing=monthly" style={{ color: 'white', fontWeight: 'bold' }}>
        Click Here to Upgrade →
      </Link>
    </div>
  );
}