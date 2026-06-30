// pages/api/travelers.js
import dbConnect from '../../lib/mongodb';
import Traveler from '../../models/Traveler';

export default async function handler(req, res) {
  // Set JSON content type
  res.setHeader('Content-Type', 'application/json');
  
  await dbConnect();

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        try {
          const travelers = await Traveler.find({});
          res.status(200).json({ success: true, data: travelers });
        } catch (error) {
          res.status(400).json({ success: false, error: error.message });
        }
        break;

      case 'POST':
        try {
          const travelerData = req.body;
          const traveler = await Traveler.create(travelerData);
          res.status(201).json({ success: true, data: traveler });
        } catch (error) {
          res.status(400).json({ success: false, error: error.message });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
        break;
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}