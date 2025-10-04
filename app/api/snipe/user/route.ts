import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Snipe from '@/models/Snipe';
import User from '@/models/User';
import Company from '@/models/Company';

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
    
    // Find the user's company
    const companies = await Company.find({
      members: session.user.id
    }).lean();
    
    let query = {};
    
    // If user is in a company, get snipes from all company members
    if (companies.length > 0) {
      // Get all members of the company
      const company = companies[0];
      const memberIds = company.members;
      
      // Find snipes created by any company member
      query = { userId: { $in: memberIds } };
    } else {
      // If not in a company, only get the user's own snipes
      query = { userId: session.user.id };
    }
    
    // Find all relevant snipes
    const userSnipes = await Snipe.find(query)
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .lean();
      
    // Get all creator user information
    const creatorIds = [...new Set(userSnipes.map(snipe => snipe.userId))];
    const creators = await User.find(
      { _id: { $in: creatorIds } },
      { name: 1, email: 1 }
    ).lean();
    
    // Create a map of creator IDs to names for easy lookup
    const creatorMap = creators.reduce((map, creator) => {
      map[creator._id.toString()] = creator.name || creator.email || 'Unknown User';
      return map;
    }, {});
    
    // Transform the data to match the expected format in the frontend
    const formattedSnipes = userSnipes.map(snipe => {
      // Convert to a regular object that we can safely manipulate
      const snipeData = JSON.parse(JSON.stringify(snipe));
      const creatorId = snipeData.userId?.toString();
      const creatorName = creatorMap[creatorId] || 'Unknown User';
      const isOwnSnipe = creatorId === session.user.id;
      
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
        },
        // Add creator information
        creatorName,
        creatorId,
        isOwnSnipe
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
