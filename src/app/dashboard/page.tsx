{/* ── Quick Actions ── */}
<section className="vp-section">
  <h2 className="vp-section-title" style={{ marginBottom: '1rem' }}>Quick Actions</h2>
  <div className="vp-actions-grid">
    
    {/* FREE FEATURES - Always work */}
    <Link href="/dashboard/nutrition" className="vp-action-card">
      <div className="vp-action-icon" style={{ background: '#c47a3a22' }}>
        <span style={{ fontSize: 22 }}>🥗</span>
      </div>
      <p className="vp-action-label">Nutrition Plan</p>
      <p className="vp-action-sub">Custom meal plans</p>
    </Link>

    <Link href="/pets/safe-food" className="vp-action-card">
      <div className="vp-action-icon" style={{ background: '#c47a3a22' }}>
        <span style={{ fontSize: 22 }}>🍎</span>
      </div>
      <p className="vp-action-label">Food Checker</p>
      <p className="vp-action-sub">Safe or unsafe?</p>
    </Link>

    <Link href="/pets/guardian" className="vp-action-card">
      <div className="vp-action-icon" style={{ background: '#c47a3a22' }}>
        <span style={{ fontSize: 22 }}>🛡️</span>
      </div>
      <p className="vp-action-label">Guardians</p>
      <p className="vp-action-sub">Protect your pet</p>
    </Link>

    <Link href="/pets/memories" className="vp-action-card">
      <div className="vp-action-icon" style={{ background: '#c47a3a22' }}>
        <span style={{ fontSize: 22 }}>📸</span>
      </div>
      <p className="vp-action-label">Memory Book</p>
      <p className="vp-action-sub">Capture moments</p>
    </Link>

    {/* PRO FEATURES - Show badge, redirect to upgrade for free users */}
    {userPlan === 'pro' || userPlan === 'family' ? (
      <Link href="/dashboard/breed-intelligence" className="vp-action-card">
        <div className="vp-action-icon" style={{ background: '#c47a3a22' }}>
          <span style={{ fontSize: 22 }}>🧠</span>
        </div>
        <p className="vp-action-label">Breed Intelligence</p>
        <p className="vp-action-sub">Know your breed</p>
      </Link>
    ) : (
      <div onClick={() => window.location.href = '/upgrade?plan=pro'} className="vp-action-card" style={{ cursor: 'pointer' }}>
        <div className="vp-action-icon" style={{ background: '#c47a3a22', opacity: 0.7 }}>
          <span style={{ fontSize: 22 }}>🧠</span>
        </div>
        <p className="vp-action-label">
          Breed Intelligence 
          <span style={{ background: '#c47a3a', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '20px', marginLeft: '6px' }}>PRO</span>
        </p>
        <p className="vp-action-sub" style={{ color: '#c47a3a' }}>Tap to upgrade →</p>
      </div>
    )}

    {userPlan === 'pro' || userPlan === 'family' ? (
      <Link href="/dashboard/health-journal" className="vp-action-card">
        <div className="vp-action-icon" style={{ background: '#c47a3a22' }}>
          <span style={{ fontSize: 22 }}>📋</span>
        </div>
        <p className="vp-action-label">Health Journal</p>
        <p className="vp-action-sub">Track health</p>
      </Link>
    ) : (
      <div onClick={() => window.location.href = '/upgrade?plan=pro'} className="vp-action-card" style={{ cursor: 'pointer' }}>
        <div className="vp-action-icon" style={{ background: '#c47a3a22', opacity: 0.7 }}>
          <span style={{ fontSize: 22 }}>📋</span>
        </div>
        <p className="vp-action-label">
          Health Journal 
          <span style={{ background: '#c47a3a', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '20px', marginLeft: '6px' }}>PRO</span>
        </p>
        <p className="vp-action-sub" style={{ color: '#c47a3a' }}>Tap to upgrade →</p>
      </div>
    )}

    {userPlan === 'pro' || userPlan === 'family' ? (
      <Link href="/dashboard/vaccine-calendar" className="vp-action-card">
        <div className="vp-action-icon" style={{ background: '#c47a3a22' }}>
          <span style={{ fontSize: 22 }}>💉</span>
        </div>
        <p className="vp-action-label">Vaccine Calendar</p>
        <p className="vp-action-sub">Never miss a shot</p>
      </Link>
    ) : (
      <div onClick={() => window.location.href = '/upgrade?plan=pro'} className="vp-action-card" style={{ cursor: 'pointer' }}>
        <div className="vp-action-icon" style={{ background: '#c47a3a22', opacity: 0.7 }}>
          <span style={{ fontSize: 22 }}>💉</span>
        </div>
        <p className="vp-action-label">
          Vaccine Calendar 
          <span style={{ background: '#c47a3a', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '20px', marginLeft: '6px' }}>PRO</span>
        </p>
        <p className="vp-action-sub" style={{ color: '#c47a3a' }}>Tap to upgrade →</p>
      </div>
    )}

    {userPlan === 'pro' || userPlan === 'family' ? (
      <Link href="/dashboard/emergency-doc" className="vp-action-card">
        <div className="vp-action-icon" style={{ background: '#c47a3a22' }}>
          <span style={{ fontSize: 22 }}>🚑</span>
        </div>
        <p className="vp-action-label">Emergency Care</p>
        <p className="vp-action-sub">Vet-ready document</p>
      </Link>
    ) : (
      <div onClick={() => window.location.href = '/upgrade?plan=pro'} className="vp-action-card" style={{ cursor: 'pointer' }}>
        <div className="vp-action-icon" style={{ background: '#c47a3a22', opacity: 0.7 }}>
          <span style={{ fontSize: 22 }}>🚑</span>
        </div>
        <p className="vp-action-label">
          Emergency Care 
          <span style={{ background: '#c47a3a', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '20px', marginLeft: '6px' }}>PRO</span>
        </p>
        <p className="vp-action-sub" style={{ color: '#c47a3a' }}>Tap to upgrade →</p>
      </div>
    )}

  </div>
</section>