'use client'

import { useState } from 'react'
import { EmergencyQRCode } from './EmergencyQRCode'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface Props {
  petId: string
  petName: string
  emergencyToken?: string
}

export function EmergencyCardButton({ petId, petName, emergencyToken }: Props) {
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState(emergencyToken)
  const [generating, setGenerating] = useState(false)
  const supabase = createSupabaseBrowserClient()

  const generateToken = async () => {
    setGenerating(true)
    const { data, error } = await supabase
      .from('pets')
      .update({ emergency_card_enabled: true })
      .eq('id', petId)
      .select('emergency_token')
      .single()

    if (data?.emergency_token) {
      setToken(data.emergency_token)
      setOpen(true)
    }
    setGenerating(false)
  }

  const handleClick = () => {
    if (token) {
      setOpen(!open)
    } else {
      generateToken()
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* THE BUTTON — place at top of dashboard */}
      <button
        onClick={handleClick}
        disabled={generating}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 20px',
          background: open ? '#dc2626' : 'rgba(220,38,38,0.1)',
          color: open ? '#fff' : '#dc2626',
          border: '1.5px solid #dc2626',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 700,
          cursor: generating ? 'wait' : 'pointer',
          letterSpacing: '0.03em',
          fontFamily: 'system-ui, sans-serif',
          transition: 'all 0.2s',
        }}
        title="Emergency Memory Card — share this with first responders"
      >
        🆘 {generating ? 'Generating…' : 'Emergency Card'}
      </button>

      {/* HOW TO USE INFO */}
      {open && token && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            left: 0,
            zIndex: 999,
            background: '#fff',
            border: '1px solid #eee',
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            padding: 24,
            width: 340,
            color: '#111',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: 'system-ui, sans-serif' }}>
              🆘 {petName}'s Emergency Card
            </h3>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#888' }}
            >
              ×
            </button>
          </div>

          <EmergencyQRCode emergencyToken={token} petName={petName} />

          {/* How to Use section */}
          <div
            style={{
              marginTop: 20,
              background: '#f9f9f9',
              borderRadius: 10,
              padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, fontFamily: 'system-ui, sans-serif', color: '#111' }}>
              📋 How to use this card
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#555', lineHeight: 1.7, fontFamily: 'system-ui, sans-serif' }}>
              <li><strong>Print the QR code</strong> and attach to your pet's collar tag, pet carrier, or your front door.</li>
              <li><strong>Save the link</strong> in your phone's notes, wallet card, or emergency contacts.</li>
              <li><strong>Share with neighbours</strong> or anyone who may care for your pet.</li>
              <li>Anyone scanning the code sees your pet's full emergency profile — <em>no login required.</em></li>
              <li>Keep your pet profile <strong>up to date</strong> — the card always shows the latest info.</li>
            </ul>
          </div>

          <a
            href={`/emergency/${token}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              marginTop: 12,
              textAlign: 'center',
              fontSize: 13,
              color: '#1d4ed8',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Preview emergency card ↗
          </a>
        </div>
      )}
    </div>
  )
}