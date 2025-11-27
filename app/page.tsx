'use client';

import { useState } from 'react'; // Removed useEffect (not needed anymore)
import axios from 'axios';

export default function Home() {
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Ready to pay');
  const [receipt, setReceipt] = useState<string>('');

  // CHANGE 1: Function now accepts the "Ticket Number" (ID)
  const startPolling = (checkoutRequestID: string) => {
    
    const interval = setInterval(async () => {
      try {
        // CHANGE 2: We use POST to send the specific ID we want to check
        const res = await axios.post('/api/status', { checkoutRequestID });
        const data = res.data;

        if (data.status === 'PAID') {
          setStatus('✅ Payment Complete!');
          setReceipt(data.receipt);
          setLoading(false);
          clearInterval(interval); // Stop checking
        } else if (data.status === 'FAILED') {
          setStatus('❌ Payment Failed / Cancelled');
          setLoading(false);
          clearInterval(interval); // Stop checking
        }
        // If PENDING, loop continues...
      } catch (err) {
        console.error(err);
      }
    }, 2000); 
  };

  const handlePay = async () => {
    if (!phone) return alert("Enter phone number");
    setLoading(true);
    setStatus('📲 Check your phone...');
    setReceipt('');

    try {
      // CHANGE 3: We capture the response to get the ID
      const res = await axios.post('/api/stkpush', { phone, amount: 1 });
      
      // Grab the Ticket Number (CheckoutRequestID) from Safaricom
      const checkoutRequestID = res.data.CheckoutRequestID;
      console.log("Tracking Transaction:", checkoutRequestID);

      // Start checking specifically for THIS transaction
      startPolling(checkoutRequestID);

    } catch (error) {
      console.error(error);
      setLoading(false);
      setStatus('System Error');
    }
  };

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px', fontFamily: 'Arial' }}>
      <h1>Project Hakikisha v2</h1>
      
      {/* Dynamic Status Box */}
      <div style={{ 
        padding: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '10px', 
        textAlign: 'center',
        background: receipt ? '#e8f5e9' : '#fff', // Changed to light green for better readability
        width: '300px'
      }}>
        {receipt ? (
          <>
            <h2 style={{ color: 'green', margin: 0 }}>PAID</h2>
            <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{receipt}</p>
            <p>Thank you for your business!</p>
            <button 
              onClick={() => { setReceipt(''); setStatus('Ready to pay'); setPhone(''); }}
              style={{ padding: '8px 16px', marginTop: '10px', cursor: 'pointer' }}
            >
              Pay Again
            </button>
          </>
        ) : (
          <>
             <p style={{ fontSize: '18px', fontWeight: 'bold' }}>KES 1.00</p>
             <input 
              type="text" 
              placeholder="2547XXXXXXXX" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              style={{ padding: '10px', width: '80%', marginBottom: '10px', color: 'black' }}
            />
            <button 
              onClick={handlePay} 
              disabled={loading}
              style={{ 
                padding: '10px 20px', 
                background: loading ? '#ccc' : '#00D15B', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px',
                width: '90%',
                cursor: loading ? 'wait' : 'pointer'
              }}
            >
              {loading ? 'Waiting for PIN...' : 'Pay Now'}
            </button>
            <p style={{ marginTop: '15px', color: '#666' }}>{status}</p>
          </>
        )}
      </div>
    </main>
  );
}