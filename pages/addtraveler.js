// pages/addtraveler.js (fully updated with proper edit functionality)
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../hooks/useAuth';

const AddTraveler = ({ isAuthenticated }) => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { query } = router;
  const [hotels, setHotels] = useState([{ id: 1 }]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Traveler Details
    name: '',
    whatsapp: '',
    nationality: '',
    adults: 1,
    children: 0,
    infants: 0,
    
    // Passport Details
    passportNumber: '',
    passportExpiry: '',
    passportIssueDate: '',
    passportIssuePlace: '',
    
    // Visa Details
    visaType: '',
    visaStatus: '',
    visaApplicationDate: '',
    visaExpiryDate: '',
    
    // Flight Details
    carrier: '',
    flightNumber: '',
    departureDate: '',
    arrivalDate: '',
    totalDays: 0,
    flightType: '',
    route: '',
    
    // Transport Details
    vehicle: '',
    seats: '',
    sector: '',
    transfer: '',
    airport: '',
    
    // Pricing Details
    adultPrice: '',
    childPrice: '',
    infantPrice: '',
    serviceCost: '',
    profit: '',
    grandTotal: '',
    
    // Notes
    notes: ''
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth');
      return;
    }
    
    // Check if we're in edit mode
    if (query.edit === 'true' && query.id) {
      setIsEditMode(true);
      setEditingId(query.id);
      fetchTravelerData(query.id);
    } else {
      // Initialize hotel dates for new traveler only
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
      
      const updatedHotels = hotels.map(hotel => ({
        ...hotel,
        checkIn: tomorrow.toISOString().split('T')[0],
        checkOut: dayAfterTomorrow.toISOString().split('T')[0],
        nights: 1
      }));
      
      setHotels(updatedHotels);
    }
  }, [isAuthenticated, router, query]);

  // Fetch traveler data for editing
  const fetchTravelerData = async (travelerId) => {
    try {
      setIsLoading(true);
      
      // Fetch traveler data
      const { data: travelerData, error: travelerError } = await supabase
        .from('travelers')
        .select('*')
        .eq('id', travelerId)
        .single();

      if (travelerError) {
        console.error('Error fetching traveler:', travelerError);
        alert('Error loading traveler data');
        return;
      }

      if (travelerData) {
        // Populate form with traveler data
        setFormData({
          name: travelerData.name || '',
          whatsapp: travelerData.whatsapp || '',
          nationality: travelerData.nationality || '',
          adults: travelerData.adults || 1,
          children: travelerData.children || 0,
          infants: travelerData.infants || 0,
          passportNumber: travelerData.passport_number || '',
          passportExpiry: travelerData.passport_expiry || '',
          passportIssueDate: travelerData.passport_issue_date || '',
          passportIssuePlace: travelerData.passport_issue_place || '',
          visaType: travelerData.visa_type || '',
          visaStatus: travelerData.visa_status || '',
          visaApplicationDate: travelerData.visa_application_date || '',
          visaExpiryDate: travelerData.visa_expiry_date || '',
          carrier: travelerData.carrier || '',
          flightNumber: travelerData.flight_number || '',
          departureDate: travelerData.departure_date || '',
          arrivalDate: travelerData.arrival_date || '',
          totalDays: travelerData.total_days || 0,
          flightType: travelerData.flight_type || '',
          route: travelerData.route || '',
          vehicle: travelerData.vehicle || '',
          seats: travelerData.seats || '',
          sector: travelerData.sector || '',
          transfer: travelerData.airport_transfer || '',
          airport: travelerData.airport || '',
          adultPrice: travelerData.adult_price || '',
          childPrice: travelerData.child_price || '',
          infantPrice: travelerData.infant_price || '',
          serviceCost: travelerData.service_cost || '',
          profit: travelerData.profit || '',
          grandTotal: travelerData.grand_total || '',
          notes: travelerData.notes || ''
        });

        // Fetch hotel data for this traveler
        const { data: hotelData, error: hotelError } = await supabase
          .from('hotels')
          .select('*')
          .eq('traveler_id', travelerId);

        if (!hotelError && hotelData && hotelData.length > 0) {
          const formattedHotels = hotelData.map((hotel, index) => ({
            id: index + 1,
            city: hotel.city || '',
            hotelName: hotel.hotel_name || '',
            rooms: hotel.rooms || 1,
            roomType: hotel.room_type || '',
            checkIn: hotel.check_in || '',
            checkOut: hotel.check_out || '',
            nights: hotel.nights || 1
          }));
          
          setHotels(formattedHotels);
        }
      }
    } catch (error) {
      console.error('Error fetching traveler data:', error);
      alert('Error loading traveler data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
  const { id, value } = e.target;
  
  // Update the form data first
  setFormData(prev => ({
    ...prev,
    [id]: value
  }));
  
  // Calculate total days if departure or arrival date changes
  if (id === 'departureDate' || id === 'arrivalDate') {
    // Use a timeout to ensure state is updated before calculation
    setTimeout(() => {
      // Get the current form data values
      const departureDate = id === 'departureDate' ? value : formData.departureDate;
      const arrivalDate = id === 'arrivalDate' ? value : formData.arrivalDate;
      
      if (departureDate && arrivalDate) {
        const departure = new Date(departureDate);
        const arrival = new Date(arrivalDate);
        
        // Ensure dates are valid
        if (isNaN(departure.getTime()) || isNaN(arrival.getTime())) {
          return;
        }
        
        // Ensure arrival date is after departure date
        if (arrival <= departure) {
          // If arrival is on or before departure, set to minimum 1 day
          setFormData(prev => ({
            ...prev,
            totalDays: arrival.getTime() === departure.getTime() ? 1 : 0
          }));
          return;
        }
        
        // Calculate difference in days (number of nights)
        const timeDiff = arrival - departure;
        const nights = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        
        // Total days = nights + 1 (includes both check-in and check-out days)
        const totalDays = nights + 1;
        
        setFormData(prev => ({
          ...prev,
          totalDays: totalDays
        }));
      }
    }, 0);
  }
  
  // Calculate grand total if pricing changes
  if (id === 'adultPrice' || id === 'childPrice' || id === 'infantPrice' || 
      id === 'adults' || id === 'children' || id === 'infants' || id === 'serviceCost' || id === 'profit') {
    calculateTotal();
  }
};

  const handleHotelChange = (id, field, value) => {
    setHotels(prev => prev.map(hotel => {
      if (hotel.id === id) {
        const updatedHotel = { ...hotel, [field]: value };
        
        // Calculate nights if check-in or check-out changes
        if ((field === 'checkIn' || field === 'checkOut') && updatedHotel.checkIn && updatedHotel.checkOut) {
          const diff = Math.ceil((new Date(updatedHotel.checkOut) - new Date(updatedHotel.checkIn)) / (1000 * 60 * 60 * 24));
          updatedHotel.nights = (diff > 0 ? diff : 0) + 1;
        }
        
        return updatedHotel;
      }
      return hotel;
    }));
  };

  const calculateTotal = () => {
    const adults = parseInt(formData.adults) || 0;
    const children = parseInt(formData.children) || 0;
    const infants = parseInt(formData.infants) || 0;
    const adultPrice = parseFloat(formData.adultPrice) || 0;
    const childPrice = parseFloat(formData.childPrice) || 0;
    const infantPrice = parseFloat(formData.infantPrice) || 0;

    const subtotal = (adults * adultPrice) + (children * childPrice) + (infants * infantPrice);
    
    setFormData(prev => ({
      ...prev,
      grandTotal: subtotal.toFixed(2)
    }));
  };

  // Add this function to automatically calculate profit
  const calculateProfit = () => {
    const adults = parseInt(formData.adults) || 0;
    const children = parseInt(formData.children) || 0;
    const infants = parseInt(formData.infants) || 0;
    const adultPrice = parseFloat(formData.adultPrice) || 0;
    const childPrice = parseFloat(formData.childPrice) || 0;
    const infantPrice = parseFloat(formData.infantPrice) || 0;
    const serviceCost = parseFloat(formData.serviceCost) || 0;
    const grandTotal = parseFloat(formData.grandTotal) || 0;

    // Calculate profit if grandTotal is set but profit isn't
    if (grandTotal > 0 && !formData.profit) {
      const cost = (adults * adultPrice) + (children * childPrice) + (infants * infantPrice) + serviceCost;
      const profit = grandTotal - cost;
      
      setFormData(prev => ({
        ...prev,
        profit: profit > 0 ? profit.toFixed(2) : '0'
      }));
    }
  };

  // Call this function when relevant fields change
  useEffect(() => {
    calculateProfit();
  }, [formData.adults, formData.children, formData.infants, 
      formData.adultPrice, formData.childPrice, formData.infantPrice, 
      formData.serviceCost, formData.grandTotal]);

  const addHotel = () => {
    const newId = hotels.length > 0 ? Math.max(...hotels.map(h => h.id)) + 1 : 1;
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    
    setHotels(prev => [
      ...prev,
      {
        id: newId,
        city: '',
        hotelName: '',
        rooms: 1,
        roomType: '',
        checkIn: tomorrow.toISOString().split('T')[0],
        checkOut: dayAfterTomorrow.toISOString().split('T')[0],
        nights: 1
      }
    ]);
  };

  const removeHotel = (id) => {
    if (hotels.length > 1) {
      setHotels(prev => prev.filter(hotel => hotel.id !== id));
    } else {
      alert('You must have at least one hotel section.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.push('/login');
  };

  // Updated saveTraveler function with edit support
  const saveTraveler = async (e) => {
    if (e) e.preventDefault();
    
    try {
      if (!user) {
        alert('Please log in to save travelers');
        return;
      }

      // Calculate profit if not explicitly set
      const calculatedProfit = parseFloat(formData.profit) || 
        (parseFloat(formData.grandTotal) - 
         (parseFloat(formData.serviceCost) || 0) - 
         ((parseInt(formData.adults) || 0) * (parseFloat(formData.adultPrice) || 0) +
          (parseInt(formData.children) || 0) * (parseFloat(formData.childPrice) || 0) +
          (parseInt(formData.infants) || 0) * (parseFloat(formData.infantPrice) || 0)));

      if (isEditMode) {
        // UPDATE existing traveler
        const { error: travelerError } = await supabase
          .from('travelers')
          .update({
            name: formData.name,
            whatsapp: formData.whatsapp,
            nationality: formData.nationality,
            adults: parseInt(formData.adults) || 1,
            children: parseInt(formData.children) || 0,
            infants: parseInt(formData.infants) || 0,
            passport_number: formData.passportNumber,
            passport_expiry: formData.passportExpiry,
            passport_issue_date: formData.passportIssueDate,
            passport_issue_place: formData.passportIssuePlace,
            visa_type: formData.visaType,
            visa_status: formData.visaStatus,
            visa_application_date: formData.visaApplicationDate,
            visa_expiry_date: formData.visaExpiryDate,
            carrier: formData.carrier,
            flight_number: formData.flightNumber,
            departure_date: formData.departureDate,
            arrival_date: formData.arrivalDate,
            total_days: parseInt(formData.totalDays) || 0,
            flight_type: formData.flightType,
            route: formData.route,
            vehicle: formData.vehicle,
            seats: parseInt(formData.seats) || 0,
            sector: formData.sector,
            airport_transfer: formData.transfer,
            airport: formData.airport,
            adult_price: parseFloat(formData.adultPrice) || 0,
            child_price: parseFloat(formData.childPrice) || 0,
            infant_price: parseFloat(formData.infantPrice) || 0,
            service_cost: parseFloat(formData.serviceCost) || 0,
            profit: calculatedProfit,
            grand_total: parseFloat(formData.grandTotal) || 0,
            notes: formData.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (travelerError) {
          console.error('Error updating traveler:', travelerError);
          alert('Error updating traveler. Please try again.');
          return;
        }

        // Delete existing hotels and add updated ones
        await supabase
          .from('hotels')
          .delete()
          .eq('traveler_id', editingId);

        // Save updated hotels
        const hotelPromises = hotels.map(hotel => 
          supabase.from('hotels').insert([{
            traveler_id: editingId,
            city: hotel.city,
            hotel_name: hotel.hotelName,
            rooms: parseInt(hotel.rooms) || 1,
            room_type: hotel.roomType,
            check_in: hotel.checkIn,
            check_out: hotel.checkOut,
            nights: parseInt(hotel.nights) || 1
          }])
        );

        await Promise.all(hotelPromises);

        alert('Traveler updated successfully!');
      } else {
        // CREATE new traveler
        const refNum = `TRV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        const { data: travelerData, error: travelerError } = await supabase
          .from('travelers')
          .insert([{
            ref_num: refNum,
            name: formData.name,
            whatsapp: formData.whatsapp,
            nationality: formData.nationality,
            adults: parseInt(formData.adults) || 1,
            children: parseInt(formData.children) || 0,
            infants: parseInt(formData.infants) || 0,
            passport_number: formData.passportNumber,
            passport_expiry: formData.passportExpiry,
            passport_issue_date: formData.passportIssueDate,
            passport_issue_place: formData.passportIssuePlace,
            visa_type: formData.visaType,
            visa_status: formData.visaStatus,
            visa_application_date: formData.visaApplicationDate,
            visa_expiry_date: formData.visaExpiryDate,
            carrier: formData.carrier,
            flight_number: formData.flightNumber,
            departure_date: formData.departureDate,
            arrival_date: formData.arrivalDate,
            total_days: parseInt(formData.totalDays) || 0,
            flight_type: formData.flightType,
            route: formData.route,
            vehicle: formData.vehicle,
            seats: parseInt(formData.seats) || 0,
            sector: formData.sector,
            airport_transfer: formData.transfer,
            airport: formData.airport,
            adult_price: parseFloat(formData.adultPrice) || 0,
            child_price: parseFloat(formData.childPrice) || 0,
            infant_price: parseFloat(formData.infantPrice) || 0,
            service_cost: parseFloat(formData.serviceCost) || 0,
            profit: calculatedProfit,
            grand_total: parseFloat(formData.grandTotal) || 0,
            notes: formData.notes,
            user_id: user.id
          }])
          .select();

        if (travelerError) {
          console.error('Error saving traveler:', travelerError);
          alert('Error saving traveler. Please try again.');
          return;
        }

        // Save hotels if traveler was successfully created
        if (travelerData && travelerData.length > 0) {
          const travelerId = travelerData[0].id;
          
          const hotelPromises = hotels.map(hotel => 
            supabase.from('hotels').insert([{
              traveler_id: travelerId,
              city: hotel.city,
              hotel_name: hotel.hotelName,
              rooms: parseInt(hotel.rooms) || 1,
              room_type: hotel.roomType,
              check_in: hotel.checkIn,
              check_out: hotel.checkOut,
              nights: parseInt(hotel.nights) || 1
            }])
          );

          await Promise.all(hotelPromises);
        }

        alert('Traveler added successfully!');
      }

      router.push('/travelers');
    } catch (error) {
      console.error('Error saving traveler:', error);
      alert('Error saving traveler. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (dateString === 'N/A' || !dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(2);
    return `${dd}/${mm}/${yy}`;
  };

  
const generatePDF = async (e) => {
  if (e) e.preventDefault();
  
  try {
    // Dynamic import to avoid SSR issues
    const jsPDFModule = await import('jspdf');
    const AutoTableModule = await import('jspdf-autotable');
    
    // Get the jsPDF constructor
    const jsPDF = jsPDFModule.default;
    
    // Create document instance
    const doc = new jsPDF({ unit: 'mm', format: 'letter' });

    // Add logo
    try {
      // Convert image to base64
      const logoUrl = '/images/logo.png';
      const imgData = await getBase64ImageFromURL(logoUrl);
      doc.addImage(imgData, 'PNG', 15, 10, 30, 20);
    } catch (e) {
      console.error("Logo not loaded:", e);
    }

    // Company header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 100, 150);
    doc.text('TRAVELCRAFT TOURS', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Booking Confirmation', 105, 22, { align: 'center' });
    
    let y = 30;

    // Format date function
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      } catch {
        return 'N/A';
      }
    };

    // Helper function to get value safely
    const getValue = (field) => {
      return formData[field] || 'N/A';
    };

    // Traveler Details
    doc.setFontSize(11);
    doc.setTextColor(50, 100, 150);
    doc.text('TRAVELER DETAILS', 20, y);
    
    // Use the autotable function directly from the imported module
    AutoTableModule.default(doc, {
      startY: y + 3,
      head: [['Field', 'Value']],
      body: [
        ['Guest Name', getValue('name')],
        ['Phone (WhatsApp)', getValue('whatsapp')],
        ['Nationality', getValue('nationality')],
        ['No. of Adults', getValue('adults') || '0'],
        ['No. of Children', getValue('children') || '0'],
        ['No. of Infants', getValue('infants') || '0']
      ],
      theme: 'grid',
      headStyles: { fillColor: [50, 100, 150], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 }
    });

    y = doc.lastAutoTable.finalY + 4;

    // Passport Details
    doc.text('PASSPORT DETAILS', 20, y);
    AutoTableModule.default(doc, {
      startY: y + 2,
      head: [['Field', 'Value']],
      body: [
        ['Passport Number', getValue('passportNumber')],
        ['Passport Expiry Date', formatDate(getValue('passportExpiry'))],
        ['Passport Issue Date', formatDate(getValue('passportIssueDate'))],
        ['Passport Issue Place', getValue('passportIssuePlace')]
      ],
      theme: 'grid',
      headStyles: { fillColor: [230, 126, 34], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 }
    });

    y = doc.lastAutoTable.finalY + 4;

    // Visa Details
    doc.text('VISA DETAILS', 20, y);
    AutoTableModule.default(doc, {
      startY: y + 2,
      head: [['Field', 'Value']],
      body: [
        ['Visa Type', getValue('visaType')],
        ['Visa Status', getValue('visaStatus')],
        ['Visa Application Date', formatDate(getValue('visaApplicationDate'))],
        ['Visa Expiry Date', formatDate(getValue('visaExpiryDate'))]
      ],
      theme: 'grid',
      headStyles: { fillColor: [155, 89, 182], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 }
    });

    y = doc.lastAutoTable.finalY + 4;

    // Flight Details
    doc.text('FLIGHT DETAILS', 20, y);
    AutoTableModule.default(doc, {
      startY: y + 2,
      head: [['Field', 'Value']],
      body: [
        ['Carrier Name', getValue('carrier')],
        ['Flight No.', getValue('flightNumber')],
        ['Departure Date', formatDate(getValue('departureDate'))],
        ['Arrival Date', formatDate(getValue('arrivalDate'))],
        ['Total Days', getValue('totalDays') || '0'],
        ['Flight Type', getValue('flightType')]
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 }
    });

    y = doc.lastAutoTable.finalY + 4;

    // Accommodation Details
    doc.text('ACCOMMODATION DETAILS', 20, y);
    
    const hotelData = [];
    hotels.forEach((hotel, index) => {
      hotelData.push(
        [`Hotel ${index + 1} Name`, hotel.hotelName || 'N/A'],
        [`City ${index + 1}`, hotel.city || 'N/A'],
        [`No. of Rooms ${index + 1}`, hotel.rooms || '1'],
        [`Room Type ${index + 1}`, hotel.roomType || 'N/A'],
        [`Check-in Date ${index + 1}`, formatDate(hotel.checkIn)],
        [`Check-out Date ${index + 1}`, formatDate(hotel.checkOut)],
        [`No. of Nights ${index + 1}`, hotel.nights || '0']
      );
      
      // Add empty row between hotels except for the last one
      if (index < hotels.length - 1) {
        hotelData.push(['', '']);
      }
    });

    // If no hotels, add a placeholder
    if (hotels.length === 0) {
      hotelData.push(['No accommodation details', 'N/A']);
    }

    AutoTableModule.default(doc, {
      startY: y + 2,
      head: [['Field', 'Value']],
      body: hotelData,
      theme: 'grid',
      headStyles: { fillColor: [46, 204, 113], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 }
    });

    y = doc.lastAutoTable.finalY + 4;

    // Transport Details
    doc.text('TRANSPORT DETAILS', 20, y);
    AutoTableModule.default(doc, {
      startY: y + 2,
      head: [['Field', 'Value']],
      body: [
        ['Vehicle Name', getValue('vehicle')],
        ['No. of Seats', getValue('seats') || '0'],
        ['Sector', getValue('sector')],
        ['Airport Transfer', getValue('transfer')]
      ],
      theme: 'grid',
      headStyles: { fillColor: [231, 76, 60], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 }
    });

    y = doc.lastAutoTable.finalY + 4;

    // Pricing Details
    doc.text('PRICING DETAILS', 20, y);
    
    const adults = parseInt(getValue('adults')) || 0;
    const children = parseInt(getValue('children')) || 0;
    const infants = parseInt(getValue('infants')) || 0;
    const adultPrice = parseFloat(getValue('adultPrice')) || 0;
    const childPrice = parseFloat(getValue('childPrice')) || 0;
    const infantPrice = parseFloat(getValue('infantPrice')) || 0;
    const serviceCost = parseFloat(getValue('serviceCost')) || 0;
    
    const subtotal = (adults * adultPrice) + (children * childPrice) + (infants * infantPrice);
    const profit = parseFloat(getValue('profit')) || 0;
    const grandTotal = subtotal + serviceCost;

    AutoTableModule.default(doc, {
      startY: y + 2,
      head: [['Field', 'Value']],
      body: [
        ['Price per Adult', adultPrice ? `$${adultPrice.toFixed(2)}` : '$0.00'],
        ['Price per Child', childPrice ? `$${childPrice.toFixed(2)}` : '$0.00'],
        ['Price per Infant', infantPrice ? `$${infantPrice.toFixed(2)}` : '$0.00'],
        ['Service Cost', serviceCost ? `$${serviceCost.toFixed(2)}` : '$0.00'],
        ['Profit', profit ? `$${profit.toFixed(2)}` : '$0.00'],
        ['GRAND TOTAL', grandTotal ? `$${grandTotal.toFixed(2)}` : '$0.00']
      ],
      theme: 'grid',
      headStyles: { fillColor: [155, 89, 182], textColor: 255 },
      styles: { 
        fontSize: 9,
        cellPadding: 3
      },
      margin: { left: 20, right: 20 }
    });

    // Airport Transfer details if applicable
    if (getValue('transfer') === 'Yes') {
      y = doc.lastAutoTable.finalY + 4;
      doc.text('AIRPORT TRANSFER', 20, y);
      AutoTableModule.default(doc, {
        startY: y + 2,
        head: [['Field', 'Value']],
        body: [['Airport Name', getValue('airport') || 'N/A']],
        theme: 'grid',
        headStyles: { fillColor: [241, 196, 15], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 20, right: 20 }
      });
    }

    // Additional Notes
    if (getValue('notes')) {
      y = doc.lastAutoTable.finalY + 4;
      doc.text('ADDITIONAL NOTES', 20, y);
      
      // Split notes into multiple lines if too long
      const notesLines = doc.splitTextToSize(getValue('notes'), 170);
      
      AutoTableModule.default(doc, {
        startY: y + 2,
        head: [['Notes']],
        body: [[notesLines]],
        theme: 'grid',
        headStyles: { fillColor: [100, 100, 100], textColor: 255 },
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          minCellHeight: 6
        },
        margin: { left: 20, right: 20 }
      });
    }

    // Footer
    const footerY = doc.lastAutoTable.finalY + 6;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('House No. B 10, Al Mustafa Town phase 2 Qasimabad, Hyderabad', 105, footerY, { align: 'center' });
    doc.text('Email: travelcraftstours@gmail.com', 105, footerY + 4, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, footerY + 8, { align: 'center' });

    // Save the PDF
    const travelerName = (getValue('name') || 'booking').replace(/\s+/g, '_');
    doc.save(`${travelerName}_Booking.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
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
}  const resetForm = () => {
    setFormData({
      name: '',
      whatsapp: '',
      nationality: '',
      adults: 1,
      children: 0,
      infants: 0,
      passportNumber: '',
      passportExpiry: '',
      passportIssueDate: '',
      passportIssuePlace: '',
      visaType: '',
      visaStatus: '',
      visaApplicationDate: '',
      visaExpiryDate: '',
      carrier: '',
      flightNumber: '',
      departureDate: '',
      arrivalDate: '',
      totalDays: 0,
      flightType: '',
      route: '',
      vehicle: '',
      seats: '',
      sector: '',
      transfer: '',
      airport: '',
      adultPrice: '',
      childPrice: '',
      infantPrice: '',
      serviceCost: '',
      profit: '',
      grandTotal: '',
      notes: ''
    });
    
    // Reset hotels but keep one
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    
    setHotels([{
      id: 1,
      city: '',
      hotelName: '',
      rooms: 1,
      roomType: '',
      checkIn: tomorrow.toISOString().split('T')[0],
      checkOut: dayAfterTomorrow.toISOString().split('T')[0],
      nights: 1
    }]);
    
    // Reset edit mode if we were editing
    if (isEditMode) {
      setIsEditMode(false);
      setEditingId('');
      router.push('/addtraveler', undefined, { shallow: true });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading traveler data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{isEditMode ? 'Edit Traveler' : 'Add Traveler'} | Travel Craft Tours</title>
      </Head>
      
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <img src="/images/logo.png" alt="Logo" className="h-12 w-auto mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Travel Craft Tours</h1>
                <h2 className="text-lg text-gray-600">{isEditMode ? 'Edit Traveler' : 'Add Traveler'}</h2>
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
                <li><Link href="/addtraveler" className="block py-2 px-4 rounded bg-red-700">Add Traveler</Link></li>
                <li><Link href="/ledger" className="block py-2 px-4 rounded hover:bg-red-700">Ledger & Reports</Link></li>
                <li><Link href="/settings" className="block py-2 px-4 rounded hover:bg-red-700">Settings</Link></li>
              </ul>
            </nav>
          </aside>

          <main className="flex-1 p-8">
            <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
              <div className="text-center mb-6">
                <img src="/images/logo.png" alt="Travel Craft Tours Logo" className="h-16 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-blue-800">
                  {isEditMode ? 'Edit Traveler' : 'TravelCraft Tours Booking Form'}
                </h1>
              </div>

              <form onSubmit={saveTraveler} className="space-y-6">
                {/* Traveler Details */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
                  <h2 className="text-xl font-semibold text-blue-600 mb-4 pb-2 border-b-2 border-blue-600">Traveler Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">Phone (WhatsApp)</label>
                      <input
                        type="text"
                        id="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div>
                      <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                      <input
                        type="text"
                        id="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="adults" className="block text-sm font-medium text-gray-700 mb-1">No. of Adults</label>
                      <input
                        type="number"
                        id="adults"
                        value={formData.adults}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="children" className="block text-sm font-medium text-gray-700 mb-1">No. of Children</label>
                      <input
                        type="number"
                        id="children"
                        value={formData.children}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="infants" className="block text-sm font-medium text-gray-700 mb-1">No. of Infants</label>
                      <input
                        type="number"
                        id="infants"
                        value={formData.infants}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Passport Details */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
                  <h2 className="text-xl font-semibold text-blue-600 mb-4 pb-2 border-b-2 border-blue-600">Passport Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                      <input
                        type="text"
                        id="passportNumber"
                        value={formData.passportNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="passportExpiry" className="block text-sm font-medium text-gray-700 mb-1">Passport Expiry Date</label>
                      <input
                        type="date"
                        id="passportExpiry"
                        value={formData.passportExpiry}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="passportIssueDate" className="block text-sm font-medium text-gray-700 mb-1">Passport Issue Date</label>
                      <input
                        type="date"
                        id="passportIssueDate"
                        value={formData.passportIssueDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="passportIssuePlace" className="block text-sm font-medium text-gray-700 mb-1">Passport Issue Place</label>
                      <input
                        type="text"
                        id="passportIssuePlace"
                        value={formData.passportIssuePlace}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Visa Details */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
                  <h2 className="text-xl font-semibold text-blue-600 mb-4 pb-2 border-b-2 border-blue-600">Visa Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="visaType" className="block text-sm font-medium text-gray-700 mb-1">Visa Type</label>
                      <select
                        id="visaType"
                        value={formData.visaType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Select</option>
                        <option value="Umrah">Umrah</option>
                        <option value="Tourist">Tourist</option>
                        <option value="Business">Business</option>
                        <option value="Student">Student</option>
                        <option value="Work">Work</option>
                        <option value="Transit">Transit</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="visaStatus" className="block text-sm font-medium text-gray-700 mb-1">Visa Status</label>
                      <select
                        id="visaStatus"
                        value={formData.visaStatus}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Select</option>
                        <option value="Applied">Applied</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Not Required">Not Required</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="visaApplicationDate" className="block text-sm font-medium text-gray-700 mb-1">Visa Application Date</label>
                      <input
                        type="date"
                        id="visaApplicationDate"
                        value={formData.visaApplicationDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="visaExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">Visa Expiry Date</label>
                      <input
                        type="date"
                        id="visaExpiryDate"
                        value={formData.visaExpiryDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Flight Details */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
                  <h2 className="text-xl font-semibold text-blue-600 mb-4 pb-2 border-b-2 border-blue-600">Flight Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="carrier" className="block text-sm font-medium text-gray-700 mb-1">Carrier Name</label>
                      <input
                        type="text"
                        id="carrier"
                        value={formData.carrier}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700 mb-1">Flight No.</label>
                      <input
                        type="text"
                        id="flightNumber"
                        value={formData.flightNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                      <input
                        type="date"
                        id="departureDate"
                        value={formData.departureDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="arrivalDate" className="block text-sm font-medium text-gray-700 mb-1">Arrival Date</label>
                      <input
                        type="date"
                        id="arrivalDate"
                        value={formData.arrivalDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="totalDays" className="block text-sm font-medium text-gray-700 mb-1">Total Days</label>
                      <input
                        type="number"
                        id="totalDays"
                        value={formData.totalDays}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="flightType" className="block text-sm font-medium text-gray-700 mb-1">Flight Type</label>
                      <select
                        id="flightType"
                        value={formData.flightType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Select</option>
                        <option value="Direct">Direct</option>
                        <option value="Indirect">Indirect</option>
                      </select>
                    </div>
                    <div className={formData.flightType === 'Indirect' ? 'block' : 'hidden'}>
                      <label htmlFor="route" className="block text-sm font-medium text-gray-700 mb-1">Route (if via)</label>
                      <input
                        type="text"
                        id="route"
                        value={formData.route}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Accommodation Details */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
                  <h2 className="text-xl font-semibold text-blue-600 mb-4 pb-2 border-b-2 border-blue-600">Accommodation Details</h2>
                  <div className="mb-4">
                    <button 
                      type="button" 
                      onClick={addHotel}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Add Hotel
                    </button>
                  </div>
                  
                  {hotels.map((hotel) => (
                    <div key={hotel.id} className="bg-gray-100 p-4 rounded-lg mb-4 relative">
                      <button 
                        type="button" 
                        onClick={() => removeHotel(hotel.id)}
                        className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor={`city-${hotel.id}`} className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            id={`city-${hotel.id}`}
                            value={hotel.city || ''}
                            onChange={(e) => handleHotelChange(hotel.id, 'city', e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label htmlFor={`hotelName-${hotel.id}`} className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
                          <input
                            type="text"
                            id={`hotelName-${hotel.id}`}
                            value={hotel.hotelName || ''}
                            onChange={(e) => handleHotelChange(hotel.id, 'hotelName', e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor={`rooms-${hotel.id}`} className="block text-sm font-medium text-gray-700 mb-1">No. of Rooms</label>
                          <input
                            type="number"
                            id={`rooms-${hotel.id}`}
                            value={hotel.rooms || 1}
                            onChange={(e) => handleHotelChange(hotel.id, 'rooms', e.target.value)}
                            min="1"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label htmlFor={`roomType-${hotel.id}`} className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                          <input
                            type="text"
                            id={`roomType-${hotel.id}`}
                            value={hotel.roomType || ''}
                            onChange={(e) => handleHotelChange(hotel.id, 'roomType', e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor={`checkIn-${hotel.id}`} className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                          <input
                            type="date"
                            id={`checkIn-${hotel.id}`}
                            value={hotel.checkIn || ''}
                            onChange={(e) => handleHotelChange(hotel.id, 'checkIn', e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label htmlFor={`checkOut-${hotel.id}`} className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                          <input
                            type="date"
                            id={`checkOut-${hotel.id}`}
                            value={hotel.checkOut || ''}
                            onChange={(e) => handleHotelChange(hotel.id, 'checkOut', e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label htmlFor={`nights-${hotel.id}`} className="block text-sm font-medium text-gray-700 mb-1">No. of Nights</label>
                          <input
                            type="number"
                            id={`nights-${hotel.id}`}
                            value={hotel.nights || 0}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Transport Details */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
                  <h2 className="text-xl font-semibold text-blue-600 mb-4 pb-2 border-b-2 border-blue-600">Transport Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700 mb-1">Vehicle Name</label>
                      <input
                        type="text"
                        id="vehicle"
                        value={formData.vehicle}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="seats" className="block text-sm font-medium text-gray-700 mb-1">No. of Seats</label>
                      <input
                        type="number"
                        id="seats"
                        value={formData.seats}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                      <input
                        type="text"
                        id="sector"
                        value={formData.sector}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="transfer" className="block text-sm font-medium text-gray-700 mb-1">Airport Transfer</label>
                      <select
                        id="transfer"
                        value={formData.transfer}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>
                  <div className={formData.transfer === 'Yes' ? 'grid grid-cols-1 gap-4' : 'hidden'}>
                    <div>
                      <label htmlFor="airport" className="block text-sm font-medium text-gray-700 mb-1">Airport Name</label>
                      <input
                        type="text"
                        id="airport"
                        value={formData.airport}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing Details */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
                  <h2 className="text-xl font-semibold text-blue-600 mb-4 pb-2 border-b-2 border-blue-600">Pricing Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label htmlFor="adultPrice" className="block text-sm font-medium text-gray-700 mb-1">Price per Adult</label>
                      <input
                        type="number"
                        id="adultPrice"
                        value={formData.adultPrice}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label htmlFor="childPrice" className="block text-sm font-medium text-gray-700 mb-1">Price per Child</label>
                      <input
                        type="number"
                        id="childPrice"
                        value={formData.childPrice}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label htmlFor="infantPrice" className="block text-sm font-medium text-gray-700 mb-1">Price per Infant</label>
                      <input
                        type="number"
                        id="infantPrice"
                        value={formData.infantPrice}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label htmlFor="serviceCost" className="block text-sm font-medium text-gray-700 mb-1">Service Cost</label>
                      <input
                        type="number"
                        id="serviceCost"
                        value={formData.serviceCost}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label htmlFor="profit" className="block text-sm font-medium text-gray-700 mb-1">Profit</label>
                      <input
                        type="number"
                        id="profit"
                        value={formData.profit}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label htmlFor="grandTotal" className="block text-sm font-medium text-gray-700 mb-1">Grand Total</label>
                      <input
                        type="number"
                        id="grandTotal"
                        value={formData.grandTotal}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-gray-100"
                        placeholder="0.00"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
                  <h2 className="text-xl font-semibold text-blue-600 mb-4 pb-2 border-b-2 border-blue-600">Additional Notes</h2>
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder="Any additional information or special requests..."
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Reset Form
                  </button>
                  <button
                    type="button"
                    onClick={generatePDF}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Generate PDF
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {isEditMode ? 'Update Traveler' : 'Save Traveler'}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AddTraveler;
