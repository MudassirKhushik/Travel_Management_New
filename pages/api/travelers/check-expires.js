const checkExpiries = async () => {
  try {
    const response = await fetch('/api/travelers/check-expiries');
    const data = await response.json();
    
    if (data.success && data.expiredDocuments.length > 0) {
      // Send WhatsApp notification
      await fetch('/api/whatsapp/send-expiry-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiredDocuments: data.expiredDocuments })
      });
      
      // Show alert in UI
      alert(`Found ${data.expiredDocuments.length} expired documents! Check WhatsApp for details.`);
    }
  } catch (error) {
    console.error('Error checking expiries:', error);
  }
};