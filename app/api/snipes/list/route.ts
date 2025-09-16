import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Snipe from '@/models/Snipe';

/**
 * GET handler to retrieve a list of all snipes created by the authenticated user
 * This is used for filtering in the submissions tab
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get all snipes created by the user - just the fields we need
    const userSnipes = await Snipe.find(
      { userId: session.user.id },
      { shortId: 1, title: 1, createdAt: 1 }
    ).sort({ createdAt: -1 }).lean();
    
    // Format the snipes for the frontend
    const snipesList = userSnipes.map(snipe => ({
      id: snipe.shortId,
      title: snipe.title || 'Untitled Snipe',
      createdAt: snipe.createdAt
    }));
    
    return NextResponse.json({ snipes: snipesList });
    
  } catch (error: any) {
    console.error('Error retrieving snipes list:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while retrieving snipes list' },
      { status: 500 }
    );
  }
}
