import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import SubmissionComment from '@/models/SubmissionComment';
import User from '@/models/User';

/**
 * GET handler to retrieve comments for a submission
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
    
    // Find all comments for the submission, sorted by creation time
    const comments = await SubmissionComment.find({
      submissionId
    })
    .sort({ createdAt: 1 }) // Sort by creation time ascending (oldest first)
    .lean();
    
    // Get user IDs from comments
    const userIds = [...new Set(comments.map(comment => comment.userId))];
    
    // Fetch user details for those IDs
    const users = await User.find(
      { _id: { $in: userIds } },
      { name: 1, email: 1 }
    ).lean();
    
    // Create a map of user IDs to user details
    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = {
        name: user.name,
        email: user.email
      };
      return map;
    }, {} as Record<string, { name: string, email: string }>);
    
    // Format comments with user details
    const formattedComments = comments.map(comment => ({
      id: comment._id,
      text: comment.text,
      createdAt: comment.createdAt,
      user: userMap[comment.userId.toString()] || { name: 'Unknown User', email: '' },
      isCurrentUser: comment.userId.toString() === session.user.id
    }));
    
    return NextResponse.json({
      comments: formattedComments
    });
    
  } catch (error: any) {
    console.error('Error retrieving comments:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while retrieving comments' },
      { status: 500 }
    );
  }
}

/**
 * POST handler to create a new comment
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
    const { submissionId, text } = body;
    
    if (!submissionId || !text) {
      return NextResponse.json(
        { error: 'Submission ID and comment text are required' },
        { status: 400 }
      );
    }
    
    // Validate text length
    if (text.length > 500) {
      return NextResponse.json(
        { error: 'Comment cannot be more than 500 characters' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Create the comment
    const comment = await SubmissionComment.create({
      submissionId,
      userId: session.user.id,
      text
    });
    
    // Get user details
    const user = await User.findById(session.user.id, { name: 1, email: 1 }).lean();
    
    // Return the created comment with user details
    return NextResponse.json({
      id: comment._id,
      text: comment.text,
      createdAt: comment.createdAt,
      user: {
        name: user?.name || 'Unknown User',
        email: user?.email || ''
      },
      isCurrentUser: true
    });
    
  } catch (error: any) {
    console.error('Error creating comment:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while creating the comment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler to remove a comment
 * This endpoint requires authentication
 * Users can only delete their own comments
 */
export async function DELETE(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get commentId from query params
    const url = new URL(request.url);
    const commentId = url.searchParams.get('commentId');
    
    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the comment
    const comment = await SubmissionComment.findById(commentId);
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is the comment author
    if (comment.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }
    
    // Delete the comment
    await comment.deleteOne();
    
    return NextResponse.json({
      message: 'Comment deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while deleting the comment' },
      { status: 500 }
    );
  }
}
