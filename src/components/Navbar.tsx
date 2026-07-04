'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (pathname?.startsWith('/auth')) return null;

  const navLinks = [
    { href: '/dashboard',            label: 'Dashboard',      emoji: '🏠' },
    { href: '/pets/guardian',        label: 'Guardians',      emoji: '🛡️' },
    { href: '/pets/safe-food',       label: 'Food Checker',   emoji: '🍎' },
  ];

  return (
    <>
      <style>{navStyles}</style>
      <nav className="vp-nav">
        <div className="vp-nav-inner">

          {/* Logo */}
          <Link href="/dashboard" className="vp-logo-link">
            <img
              src="/logo.white.png"
              alt="VuraPet"
              className="vp-logo-img"
            />
            <div className="vp-logo-text">
              <span className="vp-logo-name">VuraPet</span>
              <span className="vp-logo-sub">Lifetime Companion</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="vp-nav-links">
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`vp-nav-link ${isActive ? 'vp-nav-link-active' : ''}`}
                >
                  <span className="vp-nav-emoji">{link.emoji}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="vp-nav-right">
            {isLoggedIn && (
              <button onClick={handleLogout} className="vp-logout-btn">
                Logout
              </button>
            )}
            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="vp-hamburger"
              aria-label="Menu"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="vp-mobile-menu">
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`vp-mobile-link ${isActive ? 'vp-mobile-link-active' : ''}`}
                >
                  <span>{link.emoji}</span>
                  {link.label}
                </Link>
              );
            })}
            <div className="vp-mobile-divider" />
            <button onClick={handleLogout} className="vp-mobile-logout">
              🚪 Logout
            </button>
          </div>
        )}
      </nav>
    </>
  );
}

const navStyles = `
  .vp-nav {
    background: #1a1612;
    border-bottom: 0.5px solid rgba(196,122,58,0.2);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .vp-nav-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 24px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  /* Logo */
  .vp-logo-link {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    flex-shrink: 0;
  }
  .vp-logo-img {
    height: 40px;
    width: auto;
    object-fit: contain;
  }
  .vp-logo-text {
    display: flex;
    flex-direction: column;
    line-height: 1.15;
  }
  .vp-logo-name {
    font-size: 16px;
    font-weight: 700;
    color: #f0ebe4;
    letter-spacing: -0.01em;
  }
  .vp-logo-sub {
    font-size: 9px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #c47a3a;
    font-weight: 500;
  }

  /* Desktop nav links */
  .vp-nav-links {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    justify-content: center;
  }
  .vp-nav-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    color: #8a7060;
    text-decoration: none;
    border: 0.5px solid transparent;
    transition: color 0.2s, background 0.2s, border-color 0.2s;
  }
  .vp-nav-link:hover {
    color: #f0ebe4;
    background: rgba(255,255,255,0.05);
  }
  .vp-nav-link-active {
    color: #c47a3a !important;
    background: rgba(196,122,58,0.12) !important;
    border-color: rgba(196,122,58,0.25) !important;
  }
  .vp-nav-emoji {
    font-size: 14px;
  }

  /* Right side */
  .vp-nav-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .vp-logout-btn {
    font-size: 13px;
    font-weight: 500;
    color: #7a5040;
    background: none;
    border: 0.5px solid rgba(255,255,255,0.08);
    padding: 7px 14px;
    border-radius: 10px;
    cursor: pointer;
    transition: color 0.2s, background 0.2s;
  }
  .vp-logout-btn:hover {
    color: #e07060;
    background: rgba(224,112,96,0.1);
    border-color: rgba(224,112,96,0.2);
  }

  /* Hamburger */
  .vp-hamburger {
    display: none;
    background: none;
    border: 0.5px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 7px;
    color: #8a7060;
    cursor: pointer;
    transition: color 0.2s, background 0.2s;
  }
  .vp-hamburger:hover {
    color: #f0ebe4;
    background: rgba(255,255,255,0.06);
  }

  /* Mobile menu */
  .vp-mobile-menu {
    background: #1a1612;
    border-top: 0.5px solid rgba(255,255,255,0.06);
    padding: 8px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .vp-mobile-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    color: #8a7060;
    text-decoration: none;
    transition: color 0.2s, background 0.2s;
  }
  .vp-mobile-link:hover {
    color: #f0ebe4;
    background: rgba(255,255,255,0.05);
  }
  .vp-mobile-link-active {
    color: #c47a3a !important;
    background: rgba(196,122,58,0.12) !important;
  }
  .vp-mobile-divider {
    height: 0.5px;
    background: rgba(255,255,255,0.07);
    margin: 6px 0;
  }
  .vp-mobile-logout {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    color: #7a5040;
    background: none;
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
    transition: color 0.2s, background 0.2s;
  }
  .vp-mobile-logout:hover {
    color: #e07060;
    background: rgba(224,112,96,0.08);
  }

  /* Responsive */
  @media (max-width: 640px) {
    .vp-nav-links { display: none; }
    .vp-logout-btn { display: none; }
    .vp-hamburger { display: flex; }
  }
`;