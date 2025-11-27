import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
  const { phone, amount } = await req.json();

  // Use the secret vault
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const passkey = process.env.MPESA_PASSKEY;
  
  const shortCode = "174379"; 
  const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
  const authUrl = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  try {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResponse = await axios.get(authUrl, {
      headers: { Authorization: `Basic ${auth}` },
    });
    const accessToken = tokenResponse.data.access_token;

    const date = new Date();
    const timestamp = date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);
    
    const password = Buffer.from(shortCode + passkey + timestamp).toString('base64');

    // Use the Domain from the env file
    const callbackUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/api/callback`;

    const stkResponse = await axios.post(
      url,
      {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: shortCode,
        PhoneNumber: phone,
        CallBackURL: callbackUrl, 
        AccountReference: "WebHakikisha",
        TransactionDesc: "Payment",
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return NextResponse.json(stkResponse.data);

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}