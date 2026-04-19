'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    // You can add Supabase logout here later
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl">🐾</span>
            <span className="text-xl font-bold text-orange-600">VuraPet</span>
          </Link>

          {/* Desktop Menu (bigger screens) */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/dashboard" 
              className="text-gray-700 hover:text-orange-600 px-3 py-2"
            >
              Dashboard
            </Link>
            
            <Link 
              href="/pets/new" 
              className="text-gray-700 hover:text-orange-600 px-3 py-2"
            >
              Add Pet
            </Link>
            
            {/* The NEW Food Checker link */}
            <Link 
              href="/pets/safe-food" 
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-1"
            >
              <span>🍖</span>
              <span>Food Checker</span>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 px-3 py-2"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button (hamburger icon) */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-orange-600"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                // X icon (close)
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              ) : (
                // Hamburger icon (menu)
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu (dropdown for phones) */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link 
              href="/dashboard" 
              className="block text-gray-700 hover:bg-orange-100 px-4 py-2 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              🏠 Dashboard
            </Link>
            
            <Link 
              href="/pets/new" 
              className="block text-gray-700 hover:bg-orange-100 px-4 py-2 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              ➕ Add Pet
            </Link>
            
            {/* The NEW Food Checker link (mobile) */}
            <Link 
              href="/pets/safe-food" 
              className="block bg-green-600 text-white px-4 py-2 rounded-lg text-center"
              onClick={() => setMenuOpen(false)}
            >
              🍖 Food Checker
            </Link>
            
            <button 
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="block w-full text-left text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg"
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}