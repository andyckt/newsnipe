import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
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
 * POST handler for uploading video to S3
 * Expects multipart form data with 'video' file, 'thumbnail' file, and 'responseId' field
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
    
    // Check if the request is multipart form data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data' },
        { status: 400 }
      );
    }
    
    // Parse the form data
    const formData = await request.formData();
    const videoFile = formData.get('video') as File | null;
    const thumbnailFile = formData.get('thumbnail') as File | null;
    const responseId = formData.get('responseId') as string;
    const questionId = formData.get('questionId') as string;
    const recordingIndex = formData.get('recordingIndex') as string;
    
    // Validate inputs
    if (!videoFile) {
      return NextResponse.json(
        { error: 'Video file is required' },
        { status: 400 }
      );
    }
    
    if (!thumbnailFile) {
      return NextResponse.json(
        { error: 'Thumbnail file is required' },
        { status: 400 }
      );
    }
    
    // Generate unique filenames
    const videoId = uuid();
    const videoFilename = `videos/${responseId}/${videoId}.webm`;
    const thumbnailFilename = `thumbnails/${responseId}/${videoId}.jpg`;
    
    // Convert Files to ArrayBuffer
    const videoArrayBuffer = await videoFile.arrayBuffer();
    const thumbnailArrayBuffer = await thumbnailFile.arrayBuffer();
    
    // Upload video to S3
    const uploadVideoCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: videoFilename,
      Body: Buffer.from(videoArrayBuffer),
      ContentType: videoFile.type
    });
    
    await s3Client.send(uploadVideoCommand);
    
    // Upload thumbnail to S3
    const uploadThumbnailCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: thumbnailFilename,
      Body: Buffer.from(thumbnailArrayBuffer),
      ContentType: 'image/jpeg'
    });
    
    await s3Client.send(uploadThumbnailCommand);
    
    // Generate presigned URLs for accessing the files
    const getVideoCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: videoFilename
    });
    
    const getThumbnailCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: thumbnailFilename
    });
    
    const videoUrl = await getSignedUrl(s3Client, getVideoCommand, { expiresIn: 3600 * 24 }); // 24 hours
    const thumbnailUrl = await getSignedUrl(s3Client, getThumbnailCommand, { expiresIn: 3600 * 24 }); // 24 hours
    
    // Return the S3 keys and URLs
    return NextResponse.json({
      videoKey: videoFilename,
      videoUrl: videoUrl,
      thumbnailKey: thumbnailFilename,
      thumbnailUrl: thumbnailUrl,
      questionId,
      recordingIndex: parseInt(recordingIndex, 10)
    });
    
  } catch (error: any) {
    console.error('Error in S3 video upload API:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred during S3 video upload' },
      { status: 500 }
    );
  }
}
