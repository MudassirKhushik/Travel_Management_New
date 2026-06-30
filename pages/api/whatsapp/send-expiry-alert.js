// pages/api/whatsapp/send-expiry-alert.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { expiredDocuments } = req.body;

  try {
    // For now, we'll just log the message since Twilio setup might be complex
    let message = "🚨 *Document Expiry Alert* 🚨\n\n";
    
    expiredDocuments.forEach(doc => {
      message += `*Name:* ${doc.name}\n`;
      message += `*Phone:* ${doc.contactNumber}\n`;
      if (doc.visaExpired) {
        message += `*Visa Expired:* ${new Date(doc.visaExpiry).toLocaleDateString()}\n`;
      }
      if (doc.passportExpired) {
        message += `*Passport Expired:* ${new Date(doc.passportExpiry).toLocaleDateString()}\n`;
      }
      message += "――――――――――――――――――――\n";
    });

    console.log("WhatsApp message would be:", message);
    
    // In production, you would add Twilio code here:
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
    
    await client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${process.env.ADMIN_PHONE}`
    });
    */

    res.status(200).json({ success: true, message: 'Alert processed successfully' });
  } catch (error) {
    console.error('Error sending alert:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}