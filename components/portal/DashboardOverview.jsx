'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    travellers: 0,
    packages: 0,
    notifications: 0,
    profit: 0
  });

  useEffect(() => {
    async function fetchStats() {
      const [{ count: travellers }, { count: packages }, { count: notifications }] = await Promise.all([
        supabase.from('travellers').select('*', { count: 'exact', head: true }).eq('tenant_id', '011'),
        supabase.from('packages').select('*', { count: 'exact', head: true }).eq('tenant_id', '011'),
        supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('tenant_id', '011'),
      ]);
      
      setStats({
        travellers: travellers || 0,
        packages: packages || 0,
        notifications: notifications || 0,
        profit: 12500 // Mock for now
      });
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Travellers" value={stats.travellers} icon="👥" color="blue" />
        <StatCard title="Total Packages" value={stats.packages} icon="📦" color="purple" />
        <StatCard title="New Notifications" value={stats.notifications} icon="🔔" color="yellow" />
        <StatCard title="Monthly Profit" value={`$${stats.profit}`} icon="💰" color="green" />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-500/20 border-blue-500/50',
    purple: 'bg-purple-500/20 border-purple-500/50',
    yellow: 'bg-yellow-500/20 border-yellow-500/50',
    green: 'bg-green-500/20 border-green-500/50',
  };
  
  return (
    <div className={`p-6 rounded-xl border ${colors[color]} backdrop-blur-sm`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
    </div>
  );
}