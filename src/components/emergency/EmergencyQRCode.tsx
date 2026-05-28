'use client'

import { useState, useRef } from 'react'
import QRCode from 'react-qr-code'

interface Props {
  emergencyToken: string
  petName: string
}

export function EmergencyQRCode({ emergencyToken, petName }: Props) {
  const [copied, setCopied] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/emergency/${emergencyToken}`

  const copyLink = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const canvas = document.createElement('canvas')
    const size = 400
    canvas.width = size
    canvas.height = size + 60
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new window.Image()
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const blobUrl = URL.createObjectURL(blob)

    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size)
      ctx.fillStyle = '#111111'
      ctx.font = 'bold 18px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`🐾 ${petName}'s Emergency Card`, size / 2, size + 26)
      ctx.font = '12px system-ui, sans-serif'
      ctx.fillStyle = '#555555'
      ctx.fillText('Scan for emergency pet info · VuraPet', size / 2, size + 48)
      URL.revokeObjectURL(blobUrl)

      const link = document.createElement('a')
      link.download = `${petName}-emergency-qr.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = blobUrl
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        maxWidth: 320,
      }}
    >
      <div ref={qrRef}>
        <QRCode
          value={url}
          size={220}
          bgColor="#ffffff"
          fgColor="#111111"
          level="H"
        />
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#555', margin: '0 0 4px', fontFamily: 'system-ui, sans-serif' }}>
          Print this QR code and attach to collar, wallet, or front door.
          First responders can scan it to see all critical information.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, width: '100%' }}>
        <button
          onClick={downloadQR}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: '#dc2626',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          ⬇ Download PNG
        </button>
        <button
          onClick={copyLink}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: copied ? '#16a34a' : '#1d4ed8',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'system-ui, sans-serif',
            transition: 'background 0.2s',
          }}
        >
          {copied ? '✓ Copied!' : '🔗 Copy Link'}
        </button>
      </div>
    </div>
  )
}