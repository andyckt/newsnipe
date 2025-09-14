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
 * POST handler for generating presigned URLs for direct S3 uploads
 * Expects JSON with responseId, fileType (video or thumbnail), contentType, and optional filename
 */
export async function POST(request: Request) {
  try {
    // Check rate limit
    const isAllowed = await checkS3RateLimit();
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { responseId, fileType, contentType, questionId, recordingIndex } = body;
    
    // Validate required fields
    if (!responseId || !fileType || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: responseId, fileType, contentType' },
        { status: 400 }
      );
    }
    
    // Validate fileType
    if (fileType !== 'video' && fileType !== 'thumbnail') {
      return NextResponse.json(
        { error: 'fileType must be either "video" or "thumbnail"' },
        { status: 400 }
      );
    }
    
    // Generate a unique ID for the file
    const fileId = uuid();
    
    // Determine file extension based on content type
    let fileExtension = 'bin'; // Default binary extension
    if (contentType.includes('webm')) fileExtension = 'webm';
    if (contentType.includes('mp4')) fileExtension = 'mp4';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) fileExtension = 'jpg';
    if (contentType.includes('png')) fileExtension = 'png';
    
    // Generate the S3 key (path)
    const folderPath = fileType === 'video' ? 'videos' : 'thumbnails';
    const key = `${folderPath}/${responseId}/${fileId}.${fileExtension}`;
    
    // Create a PutObject command for the presigned URL
    const putObjectCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType
    });
    
    // Generate a presigned URL with 15 minute expiration
    const presignedUrl = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 900 });
    
    // Return the presigned URL and key
    return NextResponse.json({
      presignedUrl,
      key,
      fileId,
      questionId,
      recordingIndex
    });
    
  } catch (error: any) {
    console.error('Error generating presigned URL:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while generating presigned URL' },
      { status: 500 }
    );
  }
}
