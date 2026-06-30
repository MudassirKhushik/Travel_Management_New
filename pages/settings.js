// pages/settings.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function Settings({ isAuthenticated }) {
  const router = useRouter();
  const [adminPhone, setAdminPhone] = useState('');

  useEffect(() => {
  if (!user) {
    router.push('/auth');
    return;
  }
    // Load saved settings
    const savedPhone = localStorage.getItem('adminPhone') || '';
    setAdminPhone(savedPhone);
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.push('/login');
  };

  const saveSettings = () => {
    localStorage.setItem('adminPhone', adminPhone);
    alert('Settings saved successfully!');
  };

  return (
    <>
      <Head><title>Settings | Travel Craft Tours</title></Head>
      
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <img src="/images/logo.png" alt="Logo" className="h-12 w-auto mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Travel Craft Tours</h1>
                <h2 className="text-lg text-gray-600">Settings</h2>
              </div>
            </div>
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Logout
            </button>
          </div>
        </header>

        <div className="flex">
          <aside className="w-64 bg-red-800 text-white min-h-screen">
            <nav className="p-4">
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="block py-2 px-4 rounded hover:bg-red-700">Dashboard</Link></li>
                <li><Link href="/travelers" className="block py-2 px-4 rounded hover:bg-red-700">Traveler Management</Link></li>
                <li><Link href="/addtraveler" className="block py-2 px-4 rounded hover:bg-red-700">Add Traveler</Link></li>
                <li><Link href="/ledger" className="block py-2 px-4 rounded hover:bg-red-700">Ledger & Reports</Link></li>
                <li><Link href="/settings" className="block py-2 px-4 rounded bg-red-700">Settings</Link></li>
              </ul>
            </nav>
          </aside>

          <main className="flex-1 p-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">System Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="+923001234567"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This number will receive monthly reports via WhatsApp
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">System Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Version:</strong> 1.0.0</p>
                    <p><strong>Database:</strong> MongoDB Atlas</p>
                    <p><strong>Reports:</strong> PDF & Excel Export</p>
                    <p><strong>Automation:</strong> Monthly WhatsApp Reports</p>
                  </div>
                </div>

                <button
                  onClick={saveSettings}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </main>
        </div>

        {/* Footer */}
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