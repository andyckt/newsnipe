import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { checkS3RateLimit } from '@/lib/rate-limiter';
import { Response } from '@/models/Response';
import { connectToDatabase } from '@/lib/mongodb';

// Initialize the S3 client with credentials from environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'camera-recorder-audio';

/**
 * GET handler for generating presigned URLs for accessing S3 objects
 */
export async function GET(request: Request) {
  try {
    // Check rate limit
    const isAllowed = await checkS3RateLimit();
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Parse query parameters
    const url = new URL(request.url);
    const responseId = url.searchParams.get('responseId');
    const recordingIndex = url.searchParams.get('recordingIndex');
    const type = url.searchParams.get('type') || 'video'; // 'video' or 'thumbnail'
    
    // Validate inputs
    if (!responseId) {
      return NextResponse.json(
        { error: 'responseId is required' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the response
    const response = await Response.findOne({ shortId: responseId });
    
    if (!response) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      );
    }
    
    // Find the recording
    let recording;
    if (recordingIndex) {
      recording = response.recordings.find(r => r.recordingIndex === parseInt(recordingIndex, 10));
    } else {
      recording = response.recordings[0]; // Default to first recording
    }
    
    if (!recording) {
      return NextResponse.json(
        { error: 'Recording not found' },
        { status: 404 }
      );
    }
    
    // Get the key for the requested file type
    const key = type === 'thumbnail' ? recording.thumbnailKey : recording.videoKey;
    
    if (!key) {
      return NextResponse.json(
        { error: `${type} key not found for this recording` },
        { status: 404 }
      );
    }
    
    // Create a presigned URL for accessing the file
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });
    
    // Generate a presigned URL that expires in 24 hours
    const presignedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 * 24 });
    
    // Return the presigned URL
    return NextResponse.json({
      url: presignedUrl,
      key,
      expiresIn: 3600 * 24
    });
    
  } catch (error: any) {
    console.error('Error generating presigned URL:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while generating presigned URL' },
      { status: 500 }
    );
  }
}