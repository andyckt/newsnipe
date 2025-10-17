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
    const db = client.db('snipe');
    
    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Get users with pagination
    const users = await db
      .collection('users')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .project({
        password: 0, // Exclude password field
      })
      .toArray();
    
    // Get total count for pagination
    const totalUsers = await db.collection('users').countDocuments(query);
    
    return NextResponse.json({
      users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users data' },
      { status: 500 }
    );
  }
}
