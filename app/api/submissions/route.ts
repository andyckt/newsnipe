import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Response from '@/models/Response';
import Snipe from '@/models/Snipe';
import Company from '@/models/Company';

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

      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
  
    }
    
    // Parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const page = parseInt(url.searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Get filter parameters
    const filterSnipeIds = url.searchParams.get('snipeIds');
    const snipeIdsArray = filterSnipeIds ? filterSnipeIds.split(',') : [];
    
    // Connect to the database
    await connectToDatabase();
    
    // Find companies where the user is a member
    const userCompanies = await Company.find({
      members: session.user.id
    }).lean();
    
    // Get all the creator IDs from the companies the user is a member of
    const companyCreatorIds = userCompanies.map(company => company.creatorId);
    
    // Get all snipes created by the user OR by creators of companies the user is a member of
    const userSnipes = await Snipe.find({
      $or: [
        { userId: session.user.id },
        { userId: { $in: companyCreatorIds } }
      ]
    }).lean();
    
    // Get the shortIds of all accessible snipes
    const snipeShortIds = userSnipes.map(snipe => snipe.shortId);
 
    
    // Apply filters if provided, otherwise use all user's snipes
    const filteredSnipeIds = snipeIdsArray.length > 0 
      ? snipeShortIds.filter(id => snipeIdsArray.includes(id))
      : snipeShortIds;
    
    // Find all completed responses for the filtered snipes
    const responses = await Response.find({
      snipeShortId: { $in: filteredSnipeIds },
      status: 'completed'
    }).sort({ completedAt: -1 }).skip(skip).limit(limit).lean();
    
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
      const videos = response.recordings.map((recording: any, index: number) => {
        // Get title from the corresponding index in the snipe's textInputs array
        // This ensures we follow the sequential order of the original questions
        const textInput = snipe?.textInputs?.[Math.min(index, (snipe?.textInputs?.length || 1) - 1)];
        
        return {
          videoKey: recording.videoKey,
          videoUrl: recording.videoUrl || null,
          title: textInput?.value || `Question ${index + 1}`,
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
    
    // Get total count for pagination (using the same filters)
    const totalCount = await Response.countDocuments({
      snipeShortId: { $in: filteredSnipeIds },
      status: 'completed'
    });
    
    return NextResponse.json({
      submissions: formattedResponses,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
    
  } catch (error: any) {
    console.error('Error retrieving submissions:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while retrieving submissions' },
      { status: 500 }
    );
  }
}
