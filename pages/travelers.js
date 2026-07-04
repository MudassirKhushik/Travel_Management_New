// pages/travelers.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

export default function Travelers({ isAuthenticated }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [travelers, setTravelers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTraveler, setSelectedTraveler] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Form state with all required fields
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: '',
    nationality: '',
    travelDates: { from: '', to: '' },
    visaExpiry: '',
    visaType: '',
    visaNumber: '',
    passportNumber: '',
    passportExpiry: '',
    familyMembers: { adults: 1, children: 0, infants: 0 },
    flightDetails: {
      carrier: '',
      flightNumber: '',
      departureDate: '',
      arrivalDate: '',
      flightType: 'Direct'
    },
    transport: {
      vehicle: '',
      seats: '',
      sector: '',
      airportTransfer: 'No'
    },
    profit: 0,
    notes: ''
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth');
      return;
    }
    fetchTravelers();
  }, [isAuthenticated, user, router]);

  const fetchTravelers = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('travelers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching travelers:', error);
        return;
      }

      // Transform Supabase data to match your expected format
      const formattedTravelers = data.map(traveler => ({
        id: traveler.id, // Use id instead of _id for consistency
        name: traveler.name,
        contactNumber: traveler.whatsapp,
        email: traveler.email || '',
        nationality: traveler.nationality,
        travelDates: { 
          from: traveler.departure_date, 
          to: traveler.arrival_date 
        },
        visaExpiry: traveler.visa_expiry_date,
        visaType: traveler.visa_type,
        visaNumber: traveler.visa_number || '',
        passportNumber: traveler.passport_number,
        passportExpiry: traveler.passport_expiry,
        familyMembers: { 
          adults: traveler.adults || 1, 
          children: traveler.children || 0, 
          infants: traveler.infants || 0 
        },
        flightDetails: {
          carrier: traveler.carrier,
          flightNumber: traveler.flight_number,
          departureDate: traveler.departure_date,
          arrivalDate: traveler.arrival_date,
          flightType: traveler.flight_type
        },
        transport: {
          vehicle: traveler.vehicle,
          seats: traveler.seats,
          sector: traveler.sector,
          airportTransfer: traveler.airport_transfer
        },
        profit: traveler.profit || 0,
        notes: traveler.notes
      }));

      setTravelers(formattedTravelers);
    } catch (error) {
      console.error('Error fetching travelers:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.push('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For demo purposes, we'll add to the local state
      const newTraveler = {
        id: Date.now().toString(),
        ...formData
      };
      
      setTravelers([...travelers, newTraveler]);
      setShowForm(false);
      resetForm();
      alert('Traveler added successfully!');
    } catch (error) {
      console.error('Error saving traveler:', error);
      alert('Error saving traveler. Please try again.');
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contactNumber: '',
      email: '',
      nationality: '',
      travelDates: { from: '', to: '' },
      visaExpiry: '',
      visaType: '',
      visaNumber: '',
      passportNumber: '',
      passportExpiry: '',
      familyMembers: { adults: 1, children: 0, infants: 0 },
      flightDetails: {
        carrier: '',
        flightNumber: '',
        departureDate: '',
        arrivalDate: '',
        flightType: 'Direct'
      },
      transport: {
        vehicle: '',
        seats: '',
        sector: '',
        airportTransfer: 'No'
      },
      profit: 0,
      notes: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const handleView = (traveler) => {
    // Open modal with traveler details
    setSelectedTraveler(traveler);
    setShowViewModal(true);
  };

  // In travelers.js - update the handleEdit function
const handleEdit = (traveler) => {
  // Convert traveler data to URL-friendly format
  const queryParams = new URLSearchParams({
    edit: 'true',
    id: traveler.id,
    name: traveler.name,
    contact: traveler.contactNumber,
    email: traveler.email || '',
    nationality: traveler.nationality || '',
    departure: traveler.travelDates.from,
    arrival: traveler.travelDates.to,
    visaExpiry: traveler.visaExpiry,
    visaType: traveler.visaType || '',
    visaNumber: traveler.visaNumber || '',
    passportNumber: traveler.passportNumber || '',
    passportExpiry: traveler.passportExpiry || '',
    adults: traveler.familyMembers.adults,
    children: traveler.familyMembers.children,
    infants: traveler.familyMembers.infants,
    carrier: traveler.flightDetails.carrier || '',
    flightNumber: traveler.flightDetails.flightNumber || '',
    flightType: traveler.flightDetails.flightType || 'Direct',
    vehicle: traveler.transport.vehicle || '',
    seats: traveler.transport.seats || '',
    sector: traveler.transport.sector || '',
    airportTransfer: traveler.transport.airportTransfer || 'No',
    profit: traveler.profit,
    notes: traveler.notes || ''
  }).toString();

  router.push(`/addtraveler?${queryParams}`);
};

  const handleDelete = async (travelerId) => {
    if (confirm('Are you sure you want to delete this traveler?')) {
      try {
        const { error } = await supabase
          .from('travelers')
          .delete()
          .eq('id', travelerId);
        
        if (error) {
          console.error('Error deleting traveler:', error);
          alert('Error deleting traveler');
          return;
        }
        
        // Remove from local state
        setTravelers(travelers.filter(t => t.id !== travelerId));
        alert('Traveler deleted successfully');
      } catch (error) {
        console.error('Error deleting traveler:', error);
        alert('Error deleting traveler');
      }
    }
  };

  const filteredTravelers = travelers.filter(traveler => {
    if (filter === 'visaExpired') {
      return new Date(traveler.visaExpiry) < new Date();
    }
    if (filter === 'passportExpired') {
      return new Date(traveler.passportExpiry) < new Date();
    }
    if (filter === 'active') {
      return new Date(traveler.travelDates.to) >= new Date();
    }
    if (searchTerm) {
      return traveler.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             traveler.contactNumber.includes(searchTerm);
    }
    return true;
  });

  const totalProfit = filteredTravelers.reduce((sum, traveler) => sum + (traveler.profit || 0), 0);

  return (
    <>
      <Head>
        <title>Traveler Management | Travel Craft Tours</title>
      </Head>
      
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <img src="/images/logo.png" alt="Logo" className="h-12 w-auto mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Travel Craft Tours</h1>
                <h2 className="text-lg text-gray-600">Traveler Management</h2>
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
                <li><Link href="/dashboard" className="block py-2 px-4 rounded hover:bg-red-700">Dashboard</Link></li>
                <li><Link href="/travelers" className="block py-2 px-4 rounded bg-red-700">Traveler Management</Link></li>
                <li><Link href="/addtraveler" className="block py-2 px-4 rounded hover:bg-red-700">Add Traveler</Link></li>
                <li><Link href="/ledger" className="block py-2 px-4 rounded hover:bg-red-700">Ledger & Reports</Link></li>
                <li><Link href="/settings" className="block py-2 px-4 rounded hover:bg-red-700">Settings</Link></li>
              </ul>
            </nav>
          </aside>

          <main className="flex-1 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Traveler Management</h2>
              
              <Link href="/addtraveler" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                + Add Traveler
              </Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
                  <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg p-2"
                  >
                    <option value="all">All Travelers</option>
                    <option value="active">Active Trips</option>
                    <option value="visaExpired">Visa Expired</option>
                    <option value="passportExpired">Passport Expired</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <p className="text-sm text-red-800">
                    Total Profit: <span className="font-bold">{totalProfit.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Travel Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visa Expiry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passport Expiry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Family</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTravelers.map((traveler) => {
                    const visaExpired = new Date(traveler.visaExpiry) < new Date();
                    const passportExpired = new Date(traveler.passportExpiry) < new Date();
                    const isActive = new Date(traveler.travelDates.to) >= new Date();
                    
                    return (
                      <tr key={traveler.id} className={visaExpired || passportExpired ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{traveler.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{traveler.contactNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(traveler.travelDates.from).toLocaleDateString()} - {new Date(traveler.travelDates.to).toLocaleDateString()}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${visaExpired ? 'text-red-600 font-bold' : ''}`}>
                          {new Date(traveler.visaExpiry).toLocaleDateString()}
                          {visaExpired && ' (Expired)'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${passportExpired ? 'text-red-600 font-bold' : ''}`}>
                          {new Date(traveler.passportExpiry).toLocaleDateString()}
                          {passportExpired && ' (Expired)'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          A: {traveler.familyMembers.adults}, C: {traveler.familyMembers.children}, I: {traveler.familyMembers.infants}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">Rs. {traveler.profit}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            visaExpired || passportExpired ? 'bg-red-100 text-red-800' :
                            isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {visaExpired || passportExpired ? 'Alert' : isActive ? 'Active' : 'Completed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleView(traveler)}
                              className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>

                            <button 
                              onClick={() => handleEdit(traveler)}
                              className="flex items-center text-green-600 hover:text-green-800 text-sm"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>

                            <button 
                              onClick={() => handleDelete(traveler.id)}
                              className="flex items-center text-red-600 hover:text-red-800 text-sm"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Add New Traveler</h3>
                    <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                      ✕
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Traveler Name *</label>
                        <input 
                          type="text" 
                          name="name" 
                          value={formData.name} 
                          onChange={handleInputChange} 
                          required 
                          className="w-full p-2 border rounded" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Number *</label>
                        <input 
                          type="tel" 
                          name="contactNumber" 
                          value={formData.contactNumber} 
                          onChange={handleInputChange} 
                          required 
                          className="w-full p-2 border rounded" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input 
                          type="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleInputChange} 
                          className="w-full p-2 border rounded" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nationality</label>
                        <input 
                          type="text" 
                          name="nationality" 
                          value={formData.nationality} 
                          onChange={handleInputChange} 
                          className="w-full p-2 border rounded" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Travel From *</label>
                        <input 
                          type="date" 
                          value={formData.travelDates.from} 
                          onChange={(e) => handleNestedChange('travelDates', 'from', e.target.value)} 
                          required 
                          className="w-full p-2 border rounded" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Travel To *</label>
                        <input 
                          type="date" 
                          value={formData.travelDates.to} 
                          onChange={(e) => handleNestedChange('travelDates', 'to', e.target.value)} 
                          required 
                          className="w-full p-2 border rounded" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Visa Expiry Date *</label>
                        <input 
                          type="date" 
                          name="visaExpiry" 
                          value={formData.visaExpiry} 
                          onChange={handleInputChange} 
                          required 
                          className="w-full p-2 border rounded" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Visa Type</label>
                        <input 
                          type="text" 
                          name="visaType" 
                          value={formData.visaType} 
                          onChange={handleInputChange} 
                          className="w-full p-2 border rounded" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Visa Number</label>
                        <input 
                          type="text" 
                          name="visaNumber" 
                          value={formData.visaNumber} 
                          onChange={handleInputChange} 
                          className="w-full p-2 border rounded" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Passport Number</label>
                        <input 
                          type="text" 
                          name="passportNumber" 
                          value={formData.passportNumber} 
                          onChange={handleInputChange} 
                          className="w-full p-2 border rounded" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Passport Expiry Date</label>
                        <input 
                          type="date" 
                          name="passportExpiry" 
                          value={formData.passportExpiry} 
                          onChange={handleInputChange} 
                          className="w-full p-2 border rounded" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Adults</label>
                        <input 
                          type="number" 
                          value={formData.familyMembers.adults} 
                          onChange={(e) => handleNestedChange('familyMembers', 'adults', parseInt(e.target.value))} 
                          className="w-full p-2 border rounded" 
                          min="1" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Children</label>
                        <input 
                          type="number" 
                          value={formData.familyMembers.children} 
                          onChange={(e) => handleNestedChange('familyMembers', 'children', parseInt(e.target.value))} 
                          className="w-full p-2 border rounded" 
                          min="0" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Infants</label>
                        <input 
                          type="number" 
                          value={formData.familyMembers.infants} 
                          onChange={(e) => handleNestedChange('familyMembers', 'infants', parseInt(e.target.value))} 
                          className="w-full p-2 border rounded" 
                          min="0" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Carrier Name</label>
                        <input 
                          type="text" 
                          value={formData.flightDetails.carrier} 
                          onChange={(e) => handleNestedChange('flightDetails', 'carrier', e.target.value)} 
                          className="w-full p-2 border rounded" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Flight Number</label>
                        <input 
                          type="text" 
                          value={formData.flightDetails.flightNumber} 
                          onChange={(e) => handleNestedChange('flightDetails', 'flightNumber', e.target.value)} 
                          className="w-full p-2 border rounded" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Departure Date</label>
                        <input 
                          type="date" 
                          value={formData.flightDetails.departureDate} 
                          onChange={(e) => handleNestedChange('flightDetails', 'departureDate', e.target.value)} 
                          className="w-full p-2 border rounded" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Arrival Date</label>
                        <input 
                          type="date" 
                          value={formData.flightDetails.arrivalDate} 
                          onChange={(e) => handleNestedChange('flightDetails', 'arrivalDate', e.target.value)} 
                          className="w-full p-2 border rounded" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Flight Type</label>
                        <select 
                          value={formData.flightDetails.flightType} 
                          onChange={(e) => handleNestedChange('flightDetails', 'flightType', e.target.value)} 
                          className="w-full p-2 border rounded"
                        >
                          <option value="Direct">Direct</option>
                          <option value="Indirect">Indirect</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Vehicle Name</label>
                        <input 
                          type="text" 
                          value={formData.transport.vehicle} 
                          onChange={(e) => handleNestedChange('transport', 'vehicle', e.target.value)} 
                          className="w-full p-2 border rounded" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Number of Seats</label>
                        <input 
                          type="number" 
                          value={formData.transport.seats} 
                          onChange={(e) => handleNestedChange('transport', 'seats', e.target.value)} 
                          className="w-full p-2 border rounded" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Sector</label>
                        <input 
                          type="text" 
                          value={formData.transport.sector} 
                          onChange={(e) => handleNestedChange('transport', 'sector', e.target.value)} 
                          className="w-full p-2 border rounded" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Airport Transfer</label>
                        <select 
                          value={formData.transport.airportTransfer} 
                          onChange={(e) => handleNestedChange('transport', 'airportTransfer', e.target.value)} 
                          className="w-full p-2 border rounded"
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Profit (Rs. )</label>
                      <input 
                        type="number" 
                        name="profit" 
                        value={formData.profit} 
                        onChange={handleInputChange} 
                        required 
                        className="w-full p-2 border rounded" 
                        step="0.01" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <textarea 
                        name="notes" 
                        value={formData.notes} 
                        onChange={handleInputChange} 
                        className="w-full p-2 border rounded" 
                        rows="3" 
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button 
                        type="button" 
                        onClick={() => setShowForm(false)} 
                        className="px-4 py-2 border border-gray-300 rounded"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                      >
                        {isLoading ? 'Saving...' : 'Save Traveler'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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
      {showViewModal && selectedTraveler && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Traveler Details</h3>
              <button 
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700">Personal Information</h4>
                <p><span className="font-medium">Name:</span> {selectedTraveler.name}</p>
                <p><span className="font-medium">Contact:</span> {selectedTraveler.contactNumber}</p>
                <p><span className="font-medium">Nationality:</span> {selectedTraveler.nationality}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700">Passport Details</h4>
                <p><span className="font-medium">Passport #:</span> {selectedTraveler.passportNumber}</p>
                <p><span className="font-medium">Expiry:</span> {new Date(selectedTraveler.passportExpiry).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700">Travel Dates</h4>
                <p><span className="font-medium">From:</span> {new Date(selectedTraveler.travelDates.from).toLocaleDateString()}</p>
                <p><span className="font-medium">To:</span> {new Date(selectedTraveler.travelDates.to).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700">Family Members</h4>
                <p><span className="font-medium">Adults:</span> {selectedTraveler.familyMembers.adults}</p>
                <p><span className="font-medium">Children:</span> {selectedTraveler.familyMembers.children}</p>
                <p><span className="font-medium">Infants:</span> {selectedTraveler.familyMembers.infants}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700">Financial</h4>
                <p><span className="font-medium">Profit:</span> Rs. {selectedTraveler.profit}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}