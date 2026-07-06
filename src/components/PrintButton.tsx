'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{ padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
    >
      🖨️ Print This Report
    </button>
  )
}