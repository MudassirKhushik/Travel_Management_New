'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { icon: '📊', label: 'Overview', href: '/portal' },
    { icon: '✈️', label: 'Book Traveller', href: '/portal/book-traveller' },
    { icon: '📦', label: 'Manage Packages', href: '/portal/packages' },
    { icon: '👥', label: 'Manage Travellers', href: '/portal/manage-travellers' },
    { icon: '🔔', label: 'Notifications', href: '/portal/notifications' },
    { icon: '⚙️', label: 'Settings', href: '/portal/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900/50 border-r border-white/10 transition-all duration-300`}>
        <div className="p-4 border-b border-white/10">
          <h1 className={`font-bold ${sidebarOpen ? 'text-xl' : 'text-center'}`}>
            {sidebarOpen ? 'TravelCraft' : '✈️'}
          </h1>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition ${sidebarOpen ? '' : 'justify-center'}`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-white/10 p-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-2xl">
            ☰
          </button>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}