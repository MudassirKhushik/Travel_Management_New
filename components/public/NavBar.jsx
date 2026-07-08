'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const [tenant, setTenant] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchTenant() {
      const { data } = await supabase
        .from('tenants')
        .select('*')
        .eq('tenant_id', '011')
        .single();
      if (data) setTenant(data);
    }
    fetchTenant();
  }, []);

  const scrollTo = (id) => {
  // Remove hash from URL without triggering scroll
  if (window.location.hash) {
    history.pushState(null, '', window.location.pathname);
  }
  
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  }
};
  // Match these IDs with the section IDs in page.js
  const navItems = [
    { label: 'Packages', id: 'packages' },
    { label: 'About', id: 'about' },
    { label: 'Gallery', id: 'gallery' },
    { label: 'Reviews', id: 'reviews' },
    { label : 'FAQs', id: 'faqs'}
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2"
        >
          {tenant?.logo_url ? (
            <img 
              src={tenant.logo_url} 
              alt={tenant.agency_name}
              className="h-10 w-auto object-contain"
            />
          ) : (
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {tenant?.agency_name || 'TravelCraft'}
            </span>
          )}
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-gray-300 hover:text-white transition hover:scale-105"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => scrollTo('booking')}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-medium hover:shadow-lg transition hover:scale-105"
          >
            Book Now
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 border-t border-white/10 py-4 px-4">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-gray-300 hover:text-white transition text-left py-2"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => scrollTo('booking')}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-medium hover:shadow-lg transition"
            >
              Book Now
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}