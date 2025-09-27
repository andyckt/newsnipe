import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import ResponseDecision from '@/models/ResponseDecision';

/**
 * GET handler to retrieve decisions for submissions
 * This endpoint requires authentication
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
    
    // Parse query parameters
    const url = new URL(request.url);
    const responseIds = url.searchParams.get('responseIds');
    
    if (!responseIds) {
      return NextResponse.json(
        { error: 'Response IDs are required' },
        { status: 400 }
      );
    }
    
    // Parse the response IDs
    const responseIdArray = responseIds.split(',');
    
    // Connect to the database
    await connectToDatabase();
    
    // Find all decisions for the specified responses made by the current user
    const decisions = await ResponseDecision.find({
      responseId: { $in: responseIdArray },
      userId: session.user.id
    }).lean();
    
    // Format the decisions as a map of responseId to decision
    const decisionMap: Record<string, string> = {};
    decisions.forEach(decision => {
      decisionMap[decision.responseId] = decision.decision;
    });
    
    return NextResponse.json({
      decisions: decisionMap
    });
    
  } catch (error: any) {
    console.error('Error retrieving submission decisions:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while retrieving decisions' },
      { status: 500 }
    );
  }
}
