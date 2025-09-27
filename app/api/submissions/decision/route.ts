import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Response from '@/models/Response';
import ResponseDecision from '@/models/ResponseDecision';

/**
 * POST handler to save a decision for a submission
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
    const { submissionId, decision } = body;
    
    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the submission to ensure it exists
    const submission = await Response.findOne({ shortId: submissionId });
    
    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }
    
    // If decision is empty string, remove the decision
    if (decision === '') {
      // Delete any existing decision
      await ResponseDecision.deleteOne({ 
        responseId: submissionId,
        userId: session.user.id
      });
      
      return NextResponse.json({
        success: true,
        message: 'Decision removed successfully'
      });
    }
    
    // Create or update the decision
    const result = await ResponseDecision.findOneAndUpdate(
      { 
        responseId: submissionId,
        userId: session.user.id
      },
      { 
        decision,
        responseId: submissionId,
        userId: session.user.id
      },
      { 
        upsert: true, // Create if doesn't exist
        new: true     // Return the updated document
      }
    );
    
    return NextResponse.json({
      success: true,
      decision: result.decision,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    });
    
  } catch (error: any) {
    console.error('Error saving submission decision:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while saving the decision' },
      { status: 500 }
    );
  }
}
