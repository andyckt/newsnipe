import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Snipe from '@/models/Snipe';
import mongoose from 'mongoose';

/**
 * DELETE handler to remove a snipe by shortId
 * Requires authenticated user and ownership verification
 */
export async function DELETE(
  request: Request,
  { params }: { params: { shortId: string } }
) {
  try {
    // Get the shortId from the URL parameters
    const shortId = params.shortId;
    
    if (!shortId) {
      return NextResponse.json(
        { error: 'Short ID is required' },
        { status: 400 }
      );
    }
    
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
    
    // Find the snipe first to verify ownership
    const snipe = await Snipe.findOne({ shortId });
    
    if (!snipe) {
      return NextResponse.json(
        { error: 'Snipe not found' },
        { status: 404 }
      );
    }
    
    // Verify that the user owns this snipe
    if (snipe.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this snipe' },
        { status: 403 }
      );
    }
    
    // Delete the snipe
    await Snipe.deleteOne({ shortId });
    
    return NextResponse.json({
      success: true,
      message: 'Snipe deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Error deleting snipe:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while deleting the snipe' },
      { status: 500 }
    );
  }
}
