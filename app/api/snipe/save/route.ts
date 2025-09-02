import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Snipe from '@/models/Snipe';

/**
 * POST handler to save snipe configuration to the database
 * Requires authenticated user
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const snipeConfig = await request.json();
    
    // Validate required fields
    if (!snipeConfig.numRecordings || !snipeConfig.audioLanguage || !snipeConfig.textInputs || !snipeConfig.mode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Create a new snipe configuration in the database
    const newSnipe = await Snipe.create({
      userId: session.user.id,
      numRecordings: snipeConfig.numRecordings,
      audioLanguage: snipeConfig.audioLanguage,
      textInputs: snipeConfig.textInputs,
      mode: snipeConfig.mode,
      timeLimit: snipeConfig.timeLimit || 'no_limit',
      personalDetailsConfig: snipeConfig.personalDetailsConfig || {
        includePersonalDetails: false,
        personalFields: []
      }
    });
    
    // Return the shortId for the new snipe configuration
    return NextResponse.json({
      shortId: newSnipe.shortId
    });
    
  } catch (error: any) {
    console.error('Error saving snipe configuration:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while saving the configuration' },
      { status: 500 }
    );
  }
}
