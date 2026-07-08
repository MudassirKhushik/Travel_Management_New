'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Footer() {
  const [tenant, setTenant] = useState(null);

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

  return (
    <footer className="bg-gray-950/50 border-t border-white/10 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">{tenant?.agency_name || 'TravelCraft'}</h3>
          <p className="text-gray-400 text-sm mb-4">
            {tenant?.address || '123 Travel Street, Adventure City'}
          </p>
          <p className="text-gray-400 text-sm">📞 +1 234 567 890</p>
          <p className="text-gray-400 text-sm">✉️ info@travelcraft.com</p>
          <p className="text-gray-500 text-xs mt-4">License #: TC-2024-001</p>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><button onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition">Packages</button></li>
            <li><button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition">About</button></li>
            <li><button onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition">Book Now</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Follow Us</h4>
          <div className="flex space-x-4 text-2xl">
            <a href="#" className="hover:text-blue-400 transition">📸</a>
            <a href="#" className="hover:text-pink-400 transition">📱</a>
            <a href="#" className="hover:text-blue-500 transition">🐦</a>
            <a href="#" className="hover:text-red-500 transition">▶️</a>
          </div>
          <p className="text-gray-500 text-xs mt-4">#TravelCraftMemories</p>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Trust & Safety</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>✓ Licensed Travel Agency</li>
            <li>✓ 24/7 Customer Support</li>
            <li>✓ Secure Payments</li>
            <li>✓ Privacy Protected</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-sm text-gray-500">
        <p>© 2026 {tenant?.agency_name || 'TravelCraft'}. All rights reserved. Made with ❤️ for travelers.</p>
      </div>
    </footer>
  );
}