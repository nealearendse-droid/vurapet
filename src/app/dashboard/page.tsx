        <section className="vp-section">
          <h2 className="vp-section-title" style={{ marginBottom: '1rem' }}>Quick Actions</h2>
          <div className="vp-actions-grid">
            
            {/* FREE FEATURES */}
            <Link href="/dashboard/nutrition" className="vp-action-card">
              <div className="vp-action-icon" style={{ background: '#c47a3a22' }}><span style={{ fontSize: 22 }}>🥗</span></div>
              <p className="vp-action-label">Nutrition Plan</p>
              <p className="vp-action-sub">Custom meal plans</p>
            </Link>

            <Link href="/pets/safe-food" className="vp-action-card">
              <div className="vp-action-icon" style={{ background: '#1d9e7522' }}><span style={{ fontSize: 22 }}>🍎</span></div>
              <p className="vp-action-label">Food Checker</p>
              <p className="vp-action-sub">Safe or unsafe?</p>
            </Link>

            <Link href="/pets/guardian" className="vp-action-card">
              <div className="vp-action-icon" style={{ background: '#378add22' }}><span style={{ fontSize: 22 }}>🛡️</span></div>
              <p className="vp-action-label">Guardians</p>
              <p className="vp-action-sub">Protect your pet</p>
            </Link>

            <Link href="/pets/memories" className="vp-action-card">
              <div className="vp-action-icon" style={{ background: '#d4537e22' }}><span style={{ fontSize: 22 }}>📸</span></div>
              <p className="vp-action-label">Memory Book</p>
              <p className="vp-action-sub">{userPlan === 'free' ? `${currentMemoriesCount}/${maxMemories} memories` : 'Unlimited memories'}</p>
            </Link>

            {/* Weight Tracker */}
            {firstPet ? (
              <Link href={`/pets/${firstPet.id}/weight-tracker`} className="vp-action-card">
                <div className="vp-action-icon" style={{ background: '#c47a3a22' }}><span style={{ fontSize: 22 }}>⚖️</span></div>
                <p className="vp-action-label">Weight Tracker</p>
                <p className="vp-action-sub">Track and analyse trends</p>
              </Link>
            ) : (
              <div className="vp-action-card" style={{ opacity: 0.5 }}>
                <div className="vp-action-icon" style={{ background: '#c47a3a22' }}><span style={{ fontSize: 22 }}>⚖️</span></div>
                <p className="vp-action-label">Weight Tracker</p>
                <p className="vp-action-sub">Add a pet first</p>
              </div>
            )}

            {/* Symptom Checker */}
            {firstPet ? (
              <Link href={`/pets/${firstPet.id}/symptom-checker`} className="vp-action-card">
                <div className="vp-action-icon" style={{ background: '#c47a3a22' }}><span style={{ fontSize: 22 }}>🩺</span></div>
                <p className="vp-action-label">Symptom Checker</p>
                <p className="vp-action-sub">Should you call the vet?</p>
              </Link>
            ) : (
              <div className="vp-action-card" style={{ opacity: 0.5 }}>
                <div className="vp-action-icon" style={{ background: '#c47a3a22' }}><span style={{ fontSize: 22 }}>🩺</span></div>
                <p className="vp-action-label">Symptom Checker</p>
                <p className="vp-action-sub">Add a pet first</p>
              </div>
            )}

            {/* PRO FEATURES */}
            
            {/* Breed Intelligence */}
            {hasPro ? (
              firstPet ? (
                <Link href="/dashboard/breed-intelligence" className="vp-action-card">
                  <div className="vp-action-icon" style={{ background: '#8b6dd422' }}><span style={{ fontSize: 22 }}>🧠</span></div>
                  <p className="vp-action-label">Breed Intelligence</p>
                  <p className="vp-action-sub">Know your breed</p>
                </Link>
              ) : (
                <div className="vp-action-card" style={{ opacity: 0.5 }}>
                  <div className="vp-action-icon" style={{ background: '#8b6dd422' }}><span style={{ fontSize: 22 }}>🧠</span></div>
                  <p className="vp-action-label">Breed Intelligence</p>
                  <p className="vp-action-sub">Add a pet first</p>
                </div>
              )
            ) : (
              <div onClick={() => router.push('/upgrade?plan=pro')} className="vp-action-card" style={{ cursor: 'pointer' }}>
                <div className="vp-action-icon" style={{ background: '#8b6dd422', opacity: 0.6 }}><span style={{ fontSize: 22 }}>🧠</span></div>
                <p className="vp-action-label">Breed Intelligence <span style={{ background: '#c47a3a', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '20px', marginLeft: '6px' }}>PRO</span></p>
                <p className="vp-action-sub" style={{ color: '#c47a3a' }}>Upgrade to unlock →</p>
              </div>
            )}

            {/* Vaccine Calendar */}
            {hasPro ? (
              firstPet ? (
                <Link href="/dashboard/vaccine-calendar" className="vp-action-card">
                  <div className="vp-action-icon" style={{ background: '#c47a3a22' }}><span style={{ fontSize: 22 }}>💉</span></div>
                  <p className="vp-action-label">Vaccine Calendar</p>
                  <p className="vp-action-sub">Never miss a shot</p>
                </Link>
              ) : (
                <div className="vp-action-card" style={{ opacity: 0.5 }}>
                  <div className="vp-action-icon" style={{ background: '#c47a3a22' }}><span style={{ fontSize: 22 }}>💉</span></div>
                  <p className="vp-action-label">Vaccine Calendar</p>
                  <p className="vp-action-sub">Add a pet first</p>
                </div>
              )
            ) : (
              <div onClick={() => router.push('/upgrade?plan=pro')} className="vp-action-card" style={{ cursor: 'pointer' }}>
                <div className="vp-action-icon" style={{ background: '#c47a3a22', opacity: 0.6 }}><span style={{ fontSize: 22 }}>💉</span></div>
                <p className="vp-action-label">Vaccine Calendar <span style={{ background: '#c47a3a', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '20px', marginLeft: '6px' }}>PRO</span></p>
                <p className="vp-action-sub" style={{ color: '#c47a3a' }}>Upgrade to unlock →</p>
              </div>
            )}

            {/* Health Journal */}
            {hasPro ? (
              firstPet ? (
                <Link href={`/pets/${firstPet.id}/health-journal`} className="vp-action-card">
                  <div className="vp-action-icon" style={{ background: '#c47a3a22' }}><span style={{ fontSize: 22 }}>📋</span></div>
                  <p className="vp-action-label">Health Journal</p>
                  <p className="vp-action-sub">Track daily health</p>
                </Link>
              ) : (
                <div className="vp-action-card" style={{ opacity: 0.5 }}>
                  <div className="vp-action-icon" style={{ background: '#c47a3a22' }}><span style={{ fontSize: 22 }}>📋</span></div>
                  <p className="vp-action-label">Health Journal</p>
                  <p className="vp-action-sub">Add a pet first</p>
                </div>
              )
            ) : (
              <div onClick={() => router.push('/upgrade?plan=pro')} className="vp-action-card" style={{ cursor: 'pointer' }}>
                <div className="vp-action-icon" style={{ background: '#c47a3a22', opacity: 0.6 }}><span style={{ fontSize: 22 }}>📋</span></div>
                <p className="vp-action-label">Health Journal <span style={{ background: '#c47a3a', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '20px', marginLeft: '6px' }}>PRO</span></p>
                <p className="vp-action-sub" style={{ color: '#c47a3a' }}>Upgrade to unlock →</p>
              </div>
            )}

            {/* Emergency Care */}
            {hasPro ? (
              firstPet ? (
                <Link href={`/pets/${firstPet.id}/emergency-care`} className="vp-action-card">
                  <div className="vp-action-icon" style={{ background: '#c47a3a22' }}><span style={{ fontSize: 22 }}>🚑</span></div>
                  <p className="vp-action-label">Emergency Care</p>
                  <p className="vp-action-sub">Get urgent advice</p>
                </Link>
              ) : (
                <div className="vp-action-card" style={{ opacity: 0.5 }}>
                  <div className="vp-action-icon" style={{ background: '#c47a3a22' }}><span style={{ fontSize: 22 }}>🚑</span></div>
                  <p className="vp-action-label">Emergency Care</p>
                  <p className="vp-action-sub">Add a pet first</p>
                </div>
              )
            ) : (
              <div onClick={() => router.push('/upgrade?plan=pro')} className="vp-action-card" style={{ cursor: 'pointer' }}>
                <div className="vp-action-icon" style={{ background: '#c47a3a22', opacity: 0.6 }}><span style={{ fontSize: 22 }}>🚑</span></div>
                <p className="vp-action-label">Emergency Care <span style={{ background: '#c47a3a', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '20px', marginLeft: '6px' }}>PRO</span></p>
                <p className="vp-action-sub" style={{ color: '#c47a3a' }}>Upgrade to unlock →</p>
              </div>
            )}

          </div>
        </section>