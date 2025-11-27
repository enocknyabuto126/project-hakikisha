import { NextResponse } from 'next/server';
import { redis } from '../../../lib/redis';

export async function POST(req) { 
  const { checkoutRequestID } = await req.json();

  // Ask Cloud Redis: "Do you have data for this ID?"
  const statusData = await redis.get(checkoutRequestID);

  if (!statusData) {
    return NextResponse.json({ status: 'PENDING' });
  }

  return NextResponse.json(statusData);
}