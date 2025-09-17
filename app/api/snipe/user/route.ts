import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Snipe from '@/models/Snipe';

/**
 * GET handler to retrieve all snipes created by the current user
 * Requires authenticated user
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
    
    // Find all snipes created by the user
    const userSnipes = await Snipe.find({ 
      userId: session.user.id 
    }).sort({ 
      createdAt: -1 // Sort by creation date, newest first
    }).lean();
    
    // Transform the data to match the expected format in the frontend
    const formattedSnipes = userSnipes.map(snipe => {
      // Convert to a regular object that we can safely manipulate
      const snipeData = JSON.parse(JSON.stringify(snipe));
      
      return {
        id: snipeData.shortId,
        title: snipeData.title || 'Untitled Snipe',
        accessType: 'public',
        language: snipeData.audioLanguage || 'english',
        questionsCount: snipeData.textInputs?.length || 0,
        personalDetailsEnabled: snipeData.personalDetailsConfig?.includePersonalDetails || false,
        createdAt: snipeData.createdAt,
        status: 'active', // Default status
        submissions: snipeData.submissions || 0,
        url: snipeData.shortId,
        // Include the detailed data needed for the dialog
        textInputs: snipeData.textInputs || [],
        personalDetailsConfig: snipeData.personalDetailsConfig || {
          includePersonalDetails: false,
          personalFields: []
        }
      };
    });
    
    return NextResponse.json(formattedSnipes);
    
  } catch (error: any) {
    console.error('Error retrieving user snipes:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while retrieving snipes' },
      { status: 500 }
    );
  }
}
