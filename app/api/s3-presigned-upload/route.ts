import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import { checkS3RateLimit } from '@/lib/rate-limiter';

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
 * GET handler for generating presigned URLs for direct S3 uploads
 * This avoids the 4.5MB Vercel payload limit by having the client upload directly to S3
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
    const questionId = url.searchParams.get('questionId');
    const recordingIndex = url.searchParams.get('recordingIndex');
    const fileType = url.searchParams.get('fileType') || 'video/webm';
    const isVideo = url.searchParams.get('isVideo') === 'true';
    
    // Validate inputs
    if (!responseId) {
      return NextResponse.json(
        { error: 'responseId is required' },
        { status: 400 }
      );
    }
    
    // Generate unique filenames
    const fileId = uuid();
    const fileExtension = fileType.includes('mp4') ? 'mp4' : (fileType.includes('webm') ? 'webm' : 'jpg');
    
    // Determine the correct path based on file type
    const filePath = isVideo 
      ? `videos/${responseId}/${fileId}.${fileExtension}`
      : `thumbnails/${responseId}/${fileId}.jpg`;
    
    // Create a presigned URL for uploading directly to S3
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
      ContentType: isVideo ? fileType : 'image/jpeg'
    });
    
    // Generate a presigned URL that expires in 5 minutes
    const presignedUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 300 });
    
    // Return the presigned URL and file information
    return NextResponse.json({
      presignedUrl,
      fileKey: filePath,
      fileId,
      questionId,
      recordingIndex: recordingIndex ? parseInt(recordingIndex, 10) : undefined
    });
    
  } catch (error: any) {
    console.error('Error generating presigned URL:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while generating presigned URL' },
      { status: 500 }
    );
  }
}
