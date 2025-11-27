'use client';

import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [phone, setPhone] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [receipt, setReceipt] = useState<string>('');

  const startPolling = (checkoutRequestID: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.post('/api/status', { checkoutRequestID });
        const data = res.data;

        if (data.status === 'PAID') {
          setStatus('✅ Payment Complete!');
          setReceipt(data.receipt);
          setLoading(false);
          clearInterval(interval);

          setTimeout(() => {
            setReceipt('');
            setStatus('');
            setPhone('');
            setAmount('');
          }, 5000);

        } else if (data.status === 'FAILED') {
          setStatus('❌ Payment Failed / Cancelled');
          setLoading(false);
          clearInterval(interval);
          
          setTimeout(() => {
            setStatus('');
          }, 3000);
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000); 
  };

  const handlePay = async () => {
    if (!phone) return alert("Please enter a phone number");
    if (!amount) return alert("Please enter an amount");

    setLoading(true);
    setStatus('📲 Check your phone for the PIN...');
    setReceipt('');

    try {
      const res = await axios.post('/api/stkpush', { 
        phone, 
        amount: amount 
      });
      
      const checkoutRequestID = res.data.CheckoutRequestID;
      startPolling(checkoutRequestID);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setStatus('System Error. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
        
        <div className="bg-emerald-600 p-6 text-center">
          <h1 className="text-white text-2xl font-bold tracking-tight">Web Hakikisha</h1>
          <p className="text-emerald-100 text-sm mt-1">Secure M-PESA Checkout</p>
        </div>

        <div className="p-8">
          
          {receipt ? (
            /* SUCCESS STATE */
            <div className="flex flex-col items-center animate-pulse">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Received</h2>
              <p className="text-gray-500 mb-1">Receipt: <span className="font-mono text-gray-800">{receipt}</span></p>
              <p className="text-gray-500 mb-6">Amount: <span className="font-bold text-gray-800">KES {amount}</span></p>
              
              <div className="w-full bg-gray-100 rounded-lg p-3 text-center text-sm text-gray-500">
                Resetting in 5 seconds...
              </div>
            </div>
          ) : (
            /* PAYMENT FORM STATE */
            <div className="flex flex-col gap-6">
              
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Pay (KES)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="e.g. 500" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading}
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-800 placeholder-gray-400 text-lg font-bold"
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">M-PESA Number</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="2547XXXXXXXX" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-800 placeholder-gray-400 text-lg"
                  />
                </div>
              </div>

              {/* Pay Button */}
              <button 
                onClick={handlePay} 
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/30'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : `Pay KES ${amount || '...'}`}
              </button>

              {/* Status Text */}
              {status && (
                <p className={`text-center text-sm font-medium animate-bounce ${status.includes('❌') ? 'text-red-500' : 'text-emerald-600'}`}>
                  {status}
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">Powered by Project Hakikisha & Safaricom</p>
        </div>

      </div>
    </main>
  );
}