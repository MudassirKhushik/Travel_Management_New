// pages/ledger.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Ledger() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [travelers, setTravelers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth');
      return;
    }
    fetchTravelers();
  }, [user, authLoading, router]);

  const fetchTravelers = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('travelers')
        .select('id, name, adults, children, infants, profit, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching travelers:', error);
        return;
      }

      setTravelers(data);
    } catch (error) {
      console.error('Error fetching travelers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const exportToPDF = async () => {
  try {
    // Check if jsPDF is already available
    if (typeof window !== 'undefined' && window.jspdf) {
      generatePDFWithJsPDF(window.jspdf.jsPDF);
    } else {
      // Dynamic import with better error handling
      const jsPDFModule = await import('jspdf');
      const { jsPDF } = jsPDFModule.default || jsPDFModule;
      generatePDFWithJsPDF(jsPDF);
    }
  } catch (error) {
    console.error('Error loading jsPDF:', error);
    
    // More specific error messages
    if (error.message.includes('Failed to fetch')) {
      alert('Network error loading PDF library. Please check your internet connection.');
    } else if (error.message.includes('Cannot find module')) {
      alert('PDF library not found. Please try reinstalling the application.');
    } else {
      alert('Error generating PDF. Please try again.');
    }
  }
};

const generatePDFWithJsPDF = async (jsPDF) => {
  try {
    const doc = new jsPDF({ unit: 'mm', format: 'letter' });
    
    let y = 20; // Initial Y position
    const leftMargin = 20;
    const rightMargin = 180;
    const lineHeight = 7;
    const sectionSpacing = 10;
    
    // Add logo image
    try {
      // Convert image to base64 (you might need to adjust this based on your setup)
      const logoUrl = '/images/LOGO.jpg';
      const imgData = await getBase64ImageFromURL(logoUrl);
      
      // Add image with dynamic sizing
      const imgWidth = 100; // Width in mm
      const imgHeight = 35; // Height in mm
      const imgX = (doc.internal.pageSize.width - imgWidth) / 2; // Center horizontally
      
      doc.addImage(imgData, 'PNG', imgX, y, imgWidth, imgHeight);
      y += imgHeight + 5; // Adjust Y position after image
    } catch (imgError) {
      console.warn('Could not load logo image:', imgError);
      // Continue without the image if there's an error
    }
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text('Travel Craft Tours - Financial Ledger', 105, y, { align: 'center' });
    
    // Add date
    y += 10;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, y, { align: 'center' });
    
    // Add total profit
    y += 8;
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 0);
    doc.text(`Total Profit: Rs. ${totalProfit.toFixed(2)}`, 105, y, { align: 'center' });
    
    y += 15;
    
    // Helper function to add section
    const addSection = (title, data, color = [50, 100, 150]) => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(title.toUpperCase(), leftMargin, y);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      let currentY = y + 5;
      
      data.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, leftMargin, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(value || 'N/A', leftMargin + 40, currentY);
        currentY += lineHeight;
      });
      
      y = currentY + sectionSpacing;
      return y;
    };
    
    // Format date function
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString();
      } catch {
        return 'N/A';
      }
    };
    
    // Traveler Summary Section
    addSection('TRAVELER SUMMARY', [
      ['Total Travelers', travelers.length.toString()],
      ['Total Adults', travelers.reduce((sum, t) => sum + (t.adults || 0), 0).toString()],
      ['Total Children', travelers.reduce((sum, t) => sum + (t.children || 0), 0).toString()],
      ['Total Infants', travelers.reduce((sum, t) => sum + (t.infants || 0), 0).toString()],
      ['Total Profit', `Rs. ${totalProfit.toFixed(2)}`]
    ], [220, 53, 69]); // Red color
    
    // Profit Analysis Section
    const profitableTravelers = travelers.filter(t => (t.profit || 0) > 0).length;
    const breakEvenTravelers = travelers.filter(t => (t.profit || 0) === 0).length;
    const lossTravelers = travelers.filter(t => (t.profit || 0) < 0).length;
    
    addSection('PROFIT ANALYSIS', [
      ['Profitable Bookings', `${profitableTravelers} (${((profitableTravelers / travelers.length) * 100).toFixed(1)}%)`],
      ['Break-even Bookings', `${breakEvenTravelers} (${((breakEvenTravelers / travelers.length) * 100).toFixed(1)}%)`],
      ['Loss Bookings', `${lossTravelers} (${((lossTravelers / travelers.length) * 100).toFixed(1)}%)`],
      ['Average Profit ', `Rs. ${travelers.length > 0 ? (totalProfit / travelers.length).toFixed(2) : '0.00'}`],
      ['Highest Profit', `Rs. ${travelers.length > 0 ? Math.max(...travelers.map(t => t.profit || 0)).toFixed(2) : '0.00'}`]
    ], [46, 204, 113]); // Green color
    
    // Traveler Details Section Header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 100, 150);
    doc.text('TRAVELER DETAILS', leftMargin, y);
    y += 5;
    
    // Create table data
    const tableData = travelers.map(traveler => [
      traveler.name || 'N/A',
      traveler.adults || 0,
      traveler.children || 0,
      traveler.infants || 0,
      `Rs. ${(traveler.profit || 0).toFixed(2)}`,
      formatDate(traveler.created_at)
    ]);
    
    // Add table using autoTable (if available)
    if (typeof doc.autoTable === 'function') {
      doc.autoTable({
        head: [['Name', 'Adults', 'Children', 'Infants', 'Profit', 'Date Added']],
        body: tableData,
        startY: y,
        theme: 'grid',
        headStyles: {
          fillColor: [220, 53, 69],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak'
        },
        margin: { left: 15, right: 15 }
      });
      
      // Update y position after table
      y = doc.lastAutoTable.finalY + 10;
    } else {
      // Fallback: Create a simple table without autoTable
      y += 5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Name', leftMargin, y);
      doc.text('Adults', leftMargin + 40, y);
      doc.text('Children', leftMargin + 60, y);
      doc.text('Infants', leftMargin + 80, y);
      doc.text('Profit', leftMargin + 100, y);
      doc.text('Date', leftMargin + 140, y);
      
      y += 5;
      travelers.forEach(traveler => {
        doc.setFont('helvetica', 'normal');
        doc.text(traveler.name || 'N/A', leftMargin, y);
        doc.text(traveler.adults || 0, leftMargin + 40, y);
        doc.text(traveler.children || 0, leftMargin + 60, y);
        doc.text(traveler.infants || 0, leftMargin + 80, y);
        doc.text(`Rs. ${(traveler.profit || 0).toFixed(2)}`, leftMargin + 100, y);
        doc.text(formatDate(traveler.created_at), leftMargin + 140, y);
        y += 5;
        
        // Add new page if needed
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
      });
    }
    
    // Add footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('House No. B 10, Al Mustafa Town phase 2 Qasimabad, Hyderabad', 105, pageHeight - 20, { align: 'center' });
    doc.text('travelcraftstours@gmail.com', 105, pageHeight - 15, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, pageHeight - 10, { align: 'center' });
    
    // Save the PDF
    doc.save(`TravelCraft_Ledger_${new Date().toISOString().split('T')[0]}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF content:', error);
    alert('Error creating PDF content. Please try again.');
  }
};

// Helper function to convert image URL to base64
function getBase64ImageFromURL(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = img.naturalHeight;
      canvas.width = img.naturalWidth;
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    
    img.onerror = (error) => {
      reject(error);
    };
    
    img.src = url;
  });
}
  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = travelers.map(traveler => ({
      'Guest Name': traveler.name || 'N/A',
      'Adults': traveler.adults || 0,
      'Children': traveler.children || 0,
      'Infants': traveler.infants || 0,
      'Profit (Rs.)': traveler.profit || 0,
      'Date Added': new Date(traveler.created_at).toLocaleDateString()
    }));
    
    // Add total row
    excelData.push({
      'Guest Name': 'TOTAL',
      'Adults': travelers.reduce((sum, t) => sum + (t.adults || 0), 0),
      'Children': travelers.reduce((sum, t) => sum + (t.children || 0), 0),
      'Infants': travelers.reduce((sum, t) => sum + (t.infants || 0), 0),
      'Profit (Rs.)': totalProfit,
      'Date Added': ''
    });
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Style the total row
    const totalRowIndex = travelers.length;
    if (ws['!ref']) {
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({r: totalRowIndex, c: C});
        if (!ws[cellAddress]) ws[cellAddress] = {};
        ws[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "FFFF00" } } // Yellow background
        };
      }
    }
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Financial Ledger');
    
    // Export to Excel
    XLSX.writeFile(wb, `TravelCraft_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const totalProfit = travelers.reduce((sum, traveler) => sum + (traveler.profit || 0), 0);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Ledger & Reports | Travel Craft Tours</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
      </Head>
      
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <img src="/images/logo.png" alt="Logo" className="h-12 w-auto mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Travel Craft Tours</h1>
                <h2 className="text-lg text-gray-600">Ledger & Reports</h2>
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
                <li><Link href="/ledger" className="block py-2 px-4 rounded bg-red-700">Ledger & Reports</Link></li>
                <li><Link href="/settings" className="block py-2 px-4 rounded hover:bg-red-700">Settings</Link></li>
              </ul>
            </nav>
          </aside>

          <main className="flex-1 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Financial Ledger</h2>
              <div className="space-x-3">
                <button 
                  onClick={exportToExcel}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m4 2v-4m4 4V7a2 2 0 00-2-2H9a2 2 0 00-2 2v11a1 1 0 001 1h10a1 1 0 001-1z" />
                  </svg>
                  Export Excel
                </button>
                <button 
                  onClick={exportToPDF}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 极 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export PDF
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Total Profit: Rs. {totalProfit.toFixed(2)}</h3>
                <span className="text-sm text-gray-600">
                  {travelers.length} traveler{travelers.length !== 1 ? 's' : ''} total
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adults</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Children</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Infants</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {travelers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No travelers found. Add some travelers to see the financial ledger.
                      </td>
                    </tr>
                  ) : (
                    travelers.map((traveler) => (
                      <tr key={traveler.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {traveler.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {traveler.adults || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {traveler.children || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {traveler.infants || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          Rs. {(traveler.profit || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(traveler.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {travelers.length > 0 && (
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-6 py-3 text-sm font-bold text-gray-900">TOTAL</td>
                      <td className="px-6 py-3 text-sm font-bold text-gray-900">
                        {travelers.reduce((sum, t) => sum + (t.adults || 0), 0)}
                      </td>
                      <td className="px-6 py-3 text-sm font-bold text-gray-900">
                        {travelers.reduce((sum, t) => sum + (t.children || 0), 0)}
                      </td>
                      <td className="px-6 py-3 text-sm font-bold text-gray-900">
                        {travelers.reduce((sum, t) => sum + (t.infants || 0), 0)}
                      </td>
                      <td className="px-6 py-3 text-sm font-bold text-green-700">
                        Rs. {totalProfit.toFixed(2)}
                      </td>
                      <td className="px-6 py-3"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
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