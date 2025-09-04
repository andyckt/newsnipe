import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Response from '@/models/Response';
import Snipe from '@/models/Snipe';

/**
 * POST handler to save personal details and create a new response entry
 * Does not require authentication - anyone with the Snipe link can respond
 */
export async function POST(request: Request) {
  try {
    // Get the client IP address and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Check if user is authenticated (optional)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Parse the request body
    const { snipeShortId, personalDetails } = await request.json();
    
    // Validate required fields
    if (!snipeShortId) {
      return NextResponse.json(
        { error: 'Missing snipeShortId' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the snipe by shortId
    const snipe = await Snipe.findOne({ shortId: snipeShortId });
    
    if (!snipe) {
      return NextResponse.json(
        { error: 'Snipe not found' },
        { status: 404 }
      );
    }
    
    // Create a new response in the database
    const newResponse = await Response.create({
      snipeId: snipe._id,
      snipeShortId,
      userId: userId || undefined,
      personalDetails: personalDetails || {},
      recordings: [],
      ipAddress,
      userAgent,
      status: 'in_progress',
    });
    
    // Return the shortId for the new response
    return NextResponse.json({
      responseId: newResponse.shortId,
      message: 'Personal details saved successfully'
    });
    
  } catch (error: any) {
    console.error('Error saving response:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while saving the response' },
      { status: 500 }
    );
  }
}

/**
 * PUT handler to update an existing response with recordings or change status
 */
export async function PUT(request: Request) {
  try {
    // Parse the request body
    const { responseId, recordings, status } = await request.json();
    
    // Validate required fields
    if (!responseId) {
      return NextResponse.json(
        { error: 'Missing responseId' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the response by shortId
    const response = await Response.findOne({ shortId: responseId });
    
    if (!response) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      );
    }
    
    // Update fields if provided
    const updateData: any = {};
    
    if (recordings) {
      updateData.recordings = recordings;
    }
    
    if (status) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.completedAt = new Date();
      }
    }
    
    // Update the response
    await Response.findByIdAndUpdate(response._id, updateData);
    
    // Return success message
    return NextResponse.json({
      message: 'Response updated successfully'
    });
    
  } catch (error: any) {
    console.error('Error updating response:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while updating the response' },
      { status: 500 }
    );
  }
}
