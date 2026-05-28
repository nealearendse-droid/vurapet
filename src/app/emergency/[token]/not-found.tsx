export default function EmergencyNotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0f1117',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        textAlign: 'center',
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
        color: '#f0f0f0',
      }}
    >
      <div style={{ fontSize: 64 }}>🐾</div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Pet card not found</h1>
      <p style={{ fontSize: 18, color: '#888', maxWidth: 400, margin: 0 }}>
        This emergency link is invalid or has been deactivated by the owner.
      </p>
      <p style={{ fontSize: 14, color: '#555', maxWidth: 360 }}>
        If you found a pet in distress, please contact your local animal shelter or veterinary emergency line.
      </p>
    </main>
  )
}