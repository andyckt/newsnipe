import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import SubmissionVote from '@/models/SubmissionVote';

/**
 * GET handler to retrieve votes for a submission
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
    
    // Get submissionId from query params
    const url = new URL(request.url);
    const submissionId = url.searchParams.get('submissionId');
    
    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Count upvotes and downvotes
    const upvotes = await SubmissionVote.countDocuments({
      submissionId,
      voteType: 'up'
    });
    
    const downvotes = await SubmissionVote.countDocuments({
      submissionId,
      voteType: 'down'
    });
    
    // Check if current user has voted
    const userVote = await SubmissionVote.findOne({
      submissionId,
      userId: session.user.id
    }).lean();
    
    return NextResponse.json({
      upvotes,
      downvotes,
      userVote: userVote ? userVote.voteType : null
    });
    
  } catch (error: any) {
    console.error('Error retrieving votes:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while retrieving votes' },
      { status: 500 }
    );
  }
}

/**
 * POST handler to create or update a vote
 * This endpoint requires authentication
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
    
    // Parse request body
    const body = await request.json();
    const { submissionId, voteType } = body;
    
    if (!submissionId || !voteType) {
      return NextResponse.json(
        { error: 'Submission ID and vote type are required' },
        { status: 400 }
      );
    }
    
    // Validate vote type
    if (voteType !== 'up' && voteType !== 'down' && voteType !== 'none') {
      return NextResponse.json(
        { error: 'Vote type must be "up", "down", or "none"' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Handle vote removal
    if (voteType === 'none') {
      await SubmissionVote.deleteOne({
        submissionId,
        userId: session.user.id
      });
      
      // Get updated counts
      const upvotes = await SubmissionVote.countDocuments({
        submissionId,
        voteType: 'up'
      });
      
      const downvotes = await SubmissionVote.countDocuments({
        submissionId,
        voteType: 'down'
      });
      
      return NextResponse.json({
        message: 'Vote removed successfully',
        upvotes,
        downvotes,
        userVote: null
      });
    }
    
    // Create or update vote
    await SubmissionVote.findOneAndUpdate(
      { submissionId, userId: session.user.id },
      { submissionId, userId: session.user.id, voteType },
      { upsert: true }
    );
    
    // Get updated counts
    const upvotes = await SubmissionVote.countDocuments({
      submissionId,
      voteType: 'up'
    });
    
    const downvotes = await SubmissionVote.countDocuments({
      submissionId,
      voteType: 'down'
    });
    
    return NextResponse.json({
      message: 'Vote recorded successfully',
      upvotes,
      downvotes,
      userVote: voteType
    });
    
  } catch (error: any) {
    console.error('Error recording vote:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while recording the vote' },
      { status: 500 }
    );
  }
}
