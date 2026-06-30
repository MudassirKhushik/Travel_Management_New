'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTravelers: 0,
    activeTrips: 0,
    totalProfit: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    console.log('Dashboard - User:', user, 'Auth Loading:', authLoading);
    if (authLoading) return;
    if (!user) {
      console.log('No user found, redirecting to /auth');
      router.push('/auth');
      return;
    }
    fetchDashboardData();
  }, [user, authLoading, router]);

  // pages/dashboard.js - Updated fetchDashboardData function
const fetchDashboardData = async () => {
  try {
    if (!user) return;
    
    // Get total travelers count
    const { count: totalTravelers, error: travelersError } = await supabase
      .from('travelers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get active trips (travelers with future departure dates)
    const today = new Date().toISOString().split('T')[0];
    const { count: activeTrips, error: tripsError } = await supabase
      .from('travelers')
      .select('*', { count: 'exact', head: true })
      .gte('departure_date', today)
      .eq('user_id', user.id);

    // Get total profit
    const { data: profitData, error: profitError } = await supabase
      .from('travelers')
      .select('profit')
      .eq('user_id', user.id);

    const totalProfit = profitData?.reduce((sum, traveler) => sum + (traveler.profit || 0), 0) || 0;

    if (travelersError || tripsError || profitError) {
      console.error('Error fetching dashboard data:', travelersError || tripsError || profitError);
      return;
    }

    setStats({
      totalTravelers: totalTravelers || 0,
      activeTrips: activeTrips || 0,
      totalProfit: totalProfit,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  } finally {
    setLoading(false);
  }
};
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('Logged out successfully');
      router.push('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard | Travel Craft Tours</title>
      </Head>

      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <img
                src="/images/logo.png"
                alt="Travel Craft Logo"
                width={75}
                height={75}
                className="mr-3 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Travel Craft Tours</h1>
                <h2 className="text-lg text-gray-600">Dashboard</h2>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="flex">
          <aside className="w-64 bg-red-800 text-white min-h-screen">
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard" className="block py-2 px-4 rounded bg-red-700">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/travelers" className="block py-2 px-4 rounded hover:bg-red-700">
                    Traveler Management
                  </Link>
                </li>
                <li>
                  <Link href="/addtraveler" className="block py-2 px-4 rounded hover:bg-red-700">
                    Add Traveler
                  </Link>
                </li>
                <li>
                  <Link href="/ledger" className="block py-2 px-4 rounded hover:bg-red-700">
                    Ledger & Reports
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="block py-2 px-4 rounded hover:bg-red-700">
                    Settings
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>

          <main className="flex-1 p-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Welcome to Dashboard</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-red-100 p-6 rounded-lg text-center">
                  <h3 className="font-semibold text-red-800">Total Travelers</h3>
                  <p className="text-3xl font-bold">{stats.totalTravelers}</p>
                </div>
                <div className="bg-green-100 p-6 rounded-lg text-center">
                  <h3 className="font-semibold text-green-800">Active Trips</h3>
                  <p className="text-3xl font-bold">{stats.activeTrips}</p>
                </div>
                <div className="bg-blue-100 p-6 rounded-lg text-center">
                  <h3 className="font-semibold text-blue-800">Total Profit</h3>
                  <p className="text-3xl font-bold">Rs. {stats.totalProfit.toFixed(2)}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/travelers" className="bg-red-600 text-white px-6 py-3 rounded-lg text-center hover:bg-red-700 block">
                    Manage Travelers
                  </Link>
                  <Link href="/ledger" className="bg-green-600 text-white px-6 py-3 rounded-lg text-center hover:bg-green-700 block">
                    View Reports
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>

        <footer className="bg-red-600 text-white text-center py-4 mt-8">
          <p>House No. B 10, Al Mustafa Town phase 2 Qasimabad, Hyderabad</p>
          <a href="mailto:travelcraftstours@gmail.com" className="text-white hover:underline">
            travelcraftstours@gmail.com
          </a>
        </footer>
      </div>
    </>
  );
}