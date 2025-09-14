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
      // Log incoming recordings
      console.log(`Received ${recordings.length} recordings for response ${responseId}:`);
      recordings.forEach((rec: any, index: number) => {
        console.log(`Recording ${index + 1}: questionId=${rec.questionId}, recordingIndex=${rec.recordingIndex}`);
      });
      
      // Merge recordings with existing ones based on questionId and recordingIndex
      // This prevents duplicate recordings and ensures all recordings are saved
      const existingRecordings = response.recordings || [];
      
      // Log existing recordings
      console.log(`Found ${existingRecordings.length} existing recordings for response ${responseId}:`);
      existingRecordings.forEach((rec: any, index: number) => {
        console.log(`Existing Recording ${index + 1}: questionId=${rec.questionId}, recordingIndex=${rec.recordingIndex}`);
      });
      
      // Create a map to track recordings by videoKey (to avoid duplicates)
      // and by questionId (to ensure we have one recording per question)
      const videoKeyMap = new Map();
      const recordingMap = new Map();
      
      // First, add existing recordings to our maps
      existingRecordings.forEach((rec: any) => {
        // Track by videoKey if available
        if (rec.videoKey) {
          videoKeyMap.set(rec.videoKey, rec);
        }
        
        // Also track by questionId (without the uniqueIndex suffix)
        const baseQuestionId = rec.questionId.split('-').slice(0, -1).join('-');
        console.log(`Adding existing recording to map with baseQuestionId: ${baseQuestionId}`);
        
        // If we already have a recording for this question, keep the one with the higher recordingIndex
        const existing = recordingMap.get(baseQuestionId);
        if (!existing || (existing.recordingIndex < rec.recordingIndex)) {
          recordingMap.set(baseQuestionId, rec);
        }
      });
      
      // Now process new recordings
      recordings.forEach((newRec: any) => {
        // Skip if we already have this exact video
        if (newRec.videoKey && videoKeyMap.has(newRec.videoKey)) {
          console.log(`Skipping duplicate video with key: ${newRec.videoKey}`);
          return;
        }
        
        // Track by videoKey if available
        if (newRec.videoKey) {
          videoKeyMap.set(newRec.videoKey, newRec);
        }
        
        // Get the base questionId without the uniqueIndex suffix
        const baseQuestionId = newRec.questionId.split('-').slice(0, -1).join('-');
        console.log(`Processing new recording with baseQuestionId: ${baseQuestionId}`);
        
        // If we already have a recording for this question, keep the one with the higher recordingIndex
        const existing = recordingMap.get(baseQuestionId);
        if (!existing || (existing.recordingIndex < newRec.recordingIndex)) {
          console.log(`Adding/updating recording for question: ${baseQuestionId}`);
          recordingMap.set(baseQuestionId, newRec);
        }
      });
      
      // Convert map back to array
      updateData.recordings = Array.from(recordingMap.values());
      
      console.log(`Updating recordings for response ${responseId}. Total recordings: ${updateData.recordings.length}`);
      updateData.recordings.forEach((rec: any, index: number) => {
        console.log(`Final Recording ${index + 1}: questionId=${rec.questionId}, recordingIndex=${rec.recordingIndex}`);
      });
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
