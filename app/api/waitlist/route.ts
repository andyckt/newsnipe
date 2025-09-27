import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb-client';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('snipe'); // Specify your database name

    // Check if email already exists
    const existingUser = await db.collection('waitlist').findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 200 }
      );
    }

    // Insert new email
    await db.collection('waitlist').insertOne({
      email,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Successfully joined waitlist' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    );
  }
}
