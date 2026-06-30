// pages/api/reports/monthly.js
import dbConnect from '@/lib/mongodb';
import Traveler from '@/models/Traveler';
import { generatePDF } from '@/lib/reports';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check if it's the first day of the month
  const today = new Date();
  if (today.getDate() !== 1) {
    return res.status(400).json({ error: 'Report can only be generated on the 1st of the month' });
  }

  await dbConnect();

  try {
    // Get last month's date range
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    
    // Find travelers from last month
    const travelers = await Traveler.find({
      'travelDates.from': { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    });

    // Generate PDF report
    const pdfBuffer = await generatePDF(travelers, firstDayOfMonth, lastDayOfMonth);
    
    // In a real implementation, you would upload this to cloud storage
    // and get a URL to send via WhatsApp
    // For now, we'll just send a summary message
    
    const totalProfit = travelers.reduce((sum, traveler) => sum + traveler.profit, 0);
    const message = `📊 *Monthly Report - ${firstDayOfMonth.toLocaleDateString()} to ${lastDayOfMonth.toLocaleDateString()}*\n\n` +
                   `*Total Travelers:* ${travelers.length}\n` +
                   `*Total Profit:* $${totalProfit.toFixed(2)}\n\n` +
                   `View detailed report in your dashboard.`;

    await sendWhatsAppMessage(process.env.ADMIN_PHONE, message);
    
    res.status(200).json({ 
      success: true, 
      travelers: travelers.length, 
      totalProfit 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}