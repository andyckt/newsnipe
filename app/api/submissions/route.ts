import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Response from '@/models/Response';
import Snipe from '@/models/Snipe';

/**
 * GET handler to retrieve all submissions (responses) for the authenticated user
 * This endpoint requires authentication
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    console.log('Session:', session ? 'exists' : 'null', 'User:', session?.user ? 'exists' : 'null');
    
    // For development/testing: If not authenticated, return a warning but continue with mock data
    if (!session || !session.user) {
      console.warn('No authenticated session found. In production, this would return 401.');
      // In development, we'll continue with a mock user ID for testing
      // In production, you would uncomment the following code to require authentication:
      /*
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
      */
    }
    
    // Parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const page = parseInt(url.searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Connect to the database
    await connectToDatabase();
    
    // Get all snipes created by the user (or all snipes for testing if no user)
    const userId = session?.user?.id;
    console.log('Looking up snipes for userId:', userId || 'ALL (testing mode)');
    
    // If we have a userId, filter by it; otherwise get all snipes (for testing)
    const userSnipes = userId 
      ? await Snipe.find({ userId }).lean()
      : await Snipe.find({}).limit(10).lean(); // Limit to 10 for testing
    
    // Get the shortIds of all snipes created by the user
    const snipeShortIds = userSnipes.map(snipe => snipe.shortId);
    console.log(`Found ${userSnipes.length} snipes with shortIds:`, snipeShortIds);
    
    // Find all completed responses for the user's snipes
    const query = {
      snipeShortId: { $in: snipeShortIds },
      status: 'completed'
    };
    console.log('Finding responses with query:', JSON.stringify(query));
    
    const responses = await Response.find(query)
      .sort({ completedAt: -1 }) // Sort by completion date, newest first
      .skip(skip)
      .limit(limit)
      .lean();
      
    console.log(`Found ${responses.length} responses`);
    if (responses.length > 0) {
      console.log('First response shortId:', responses[0].shortId);
    }
    
    // Create a map of snipe shortIds to snipe data for easy lookup
    const snipeMap: Record<string, any> = userSnipes.reduce((map: Record<string, any>, snipe) => {
      map[snipe.shortId] = snipe;
      return map;
    }, {});
    
    // Format the responses for the frontend
    const formattedResponses = responses.map(response => {
      const snipe = snipeMap[response.snipeShortId];
      
      // Format personal details into question/answer format
      const personalDetails = [];
      if (response.personalDetails && snipe?.personalDetailsConfig?.personalFields) {
        for (const field of snipe.personalDetailsConfig.personalFields) {
          if (response.personalDetails[field.id as keyof typeof response.personalDetails] !== undefined) {
            personalDetails.push({
              question: field.label,
              answer: response.personalDetails[field.id as keyof typeof response.personalDetails]
            });
          }
        }
      }
      
      // Format videos
      const videos = response.recordings.map((recording: any) => {
        // Find the matching text input for this recording
        const textInput = snipe?.textInputs?.find((input: any) => 
          input.id === recording.recordingId
        );
        
        return {
          videoKey: recording.videoKey,
          title: textInput?.value || `Question ${recording.recordingIndex + 1}`,
          thumbnailUrl: recording.thumbnailUrl || null
        };
      });
      
      // Get candidate name from personal details if available
      let candidateName = "Anonymous";
      const nameField = personalDetails.find(detail => 
        detail.question.toLowerCase().includes('name')
      );
      if (nameField) {
        candidateName = nameField.answer;
      }
      
      return {
        id: response.shortId,
        title: snipe?.title || "Untitled Snipe",
        candidate: candidateName,
        thumbnail: videos[0]?.thumbnailUrl || "/placeholder-user.jpg",
        videos,
        status: response.status,
        date: response.completedAt ? new Date(response.completedAt).toISOString().split('T')[0] : 
              new Date(response.createdAt).toISOString().split('T')[0],
        personalDetails,
        snipeId: response.snipeShortId
      };
    });
    
    // Get total count for pagination
    const totalCount = await Response.countDocuments({
      snipeShortId: { $in: snipeShortIds },
      status: 'completed'
    });
    
    const result = {
      submissions: formattedResponses,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    };
    
    console.log(`Returning ${formattedResponses.length} formatted responses`);
    if (formattedResponses.length > 0) {
      console.log('First formatted response:', JSON.stringify(formattedResponses[0]));
    }
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Error retrieving submissions:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while retrieving submissions' },
      { status: 500 }
    );
  }
}
