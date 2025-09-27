import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb-client';

export async function GET(request: Request) {
  // Check authorization
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const token = authHeader.substring(7);
  
  // Simple password check - in a real app, use a more secure method
  if (token.toUpperCase() !== 'SNIPE2025') {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 403 });
  }
  
  try {
    const client = await clientPromise;
    const db = client.db('snipe'); // Specify your database name
    
    // Get all waitlist entries, sorted by most recent first
    const waitlist = await db
      .collection('waitlist')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json(waitlist);
  } catch (error) {
    console.error('Error fetching waitlist data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist data' },
      { status: 500 }
    );
  }
}
