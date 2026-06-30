// pages/api/auth/login.js
import { setAuth } from '../../../lib/auth';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // Check credentials
  if (email === 'travelcraftstours@gmail.com' && password === 'abdul123') {
    // Set authentication
    setAuth(true);
    
    return res.status(200).json({ success: true, message: 'Login successful!' });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
}