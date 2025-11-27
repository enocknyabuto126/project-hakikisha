import { NextResponse } from 'next/server';
import { redis } from '../../../lib/redis'; // Import Redis

export async function POST(req) {
  try {
    const data = await req.json();
    const checkoutRequestID = data.Body.stkCallback.CheckoutRequestID;
    const resultCode = data.Body.stkCallback.ResultCode;

    if (resultCode === 0) {
      // Save SUCCESS to Redis (Expire in 24 hours to save space)
      await redis.set(checkoutRequestID, {
        status: 'PAID',
        receipt: data.Body.stkCallback.CallbackMetadata.Item.find(
          (item) => item.Name === 'MpesaReceiptNumber'
        ).Value
      }, { ex: 86400 }); 
    } else {
      // Save FAILURE to Redis
      await redis.set(checkoutRequestID, {
        status: 'FAILED',
        receipt: null
      }, { ex: 86400 });
    }

    return NextResponse.json({ message: "Callback received" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}