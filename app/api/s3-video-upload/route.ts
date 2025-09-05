import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import { checkS3RateLimit } from '@/lib/rate-limiter';
import { apiLogger } from '@/lib/debug-logger';

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
    // Log the request
    apiLogger.request({
      url: request.url,
      method: request.method,
      contentType: request.headers.get('content-type'),
      userAgent: request.headers.get('user-agent')
    });
    
    // Check rate limit
    const isAllowed = await checkS3RateLimit();
    if (!isAllowed) {
      apiLogger.error('Rate limit exceeded');
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Check if the request is multipart form data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      apiLogger.error('Invalid content type', { contentType });
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
    
    // Log the form data
    apiLogger.log('Form data received', {
      hasVideoFile: !!videoFile,
      videoFileType: videoFile?.type,
      videoFileSize: videoFile?.size,
      hasThumbnailFile: !!thumbnailFile,
      responseId,
      questionId,
      recordingIndex
    });
    
    // Validate inputs
    if (!videoFile) {
      apiLogger.error('Video file is missing');
      return NextResponse.json(
        { error: 'Video file is required' },
        { status: 400 }
      );
    }
    
    // For mobile devices, we may not have a thumbnail file
    // In that case, we'll create a simple placeholder thumbnail
    let thumbnailArrayBuffer: ArrayBuffer;
    
    if (!thumbnailFile) {
      apiLogger.log("No thumbnail provided, creating placeholder");
      
      try {
        // Create a simple placeholder thumbnail for mobile devices
        const canvas = new OffscreenCanvas(320, 240);
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Fill with a blue background
          ctx.fillStyle = '#4a90e2';
          ctx.fillRect(0, 0, 320, 240);
          
          // Add a play button icon
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.moveTo(320 / 2 + 30, 240 / 2);
          ctx.lineTo(320 / 2 - 15, 240 / 2 + 25);
          ctx.lineTo(320 / 2 - 15, 240 / 2 - 25);
          ctx.closePath();
          ctx.fill();
          
          // Convert to blob
          const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 });
          thumbnailArrayBuffer = await blob.arrayBuffer();
          apiLogger.log("Created thumbnail using OffscreenCanvas");
        } else {
          throw new Error("Could not get canvas context");
        }
      } catch (error) {
        apiLogger.error("Error creating thumbnail with OffscreenCanvas", { error });
        
        // If OffscreenCanvas is not available, create a minimal placeholder
        const minimalPlaceholder = new Uint8Array([
          0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
          0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
          0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
          0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
          0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
          0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
          0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
          0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01, 0x00,
          0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00,
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F,
          0x00, 0xD2, 0xCF, 0x20, 0xFF, 0xD9
        ]).buffer;
        thumbnailArrayBuffer = minimalPlaceholder;
        apiLogger.log("Created minimal JPEG placeholder");
      }
    } else {
      // Use the provided thumbnail
      try {
        thumbnailArrayBuffer = await thumbnailFile.arrayBuffer();
        apiLogger.log("Using provided thumbnail", { 
          size: thumbnailArrayBuffer.byteLength,
          type: thumbnailFile.type
        });
      } catch (error) {
        apiLogger.error("Error reading thumbnail file", { error });
        
        // Create a fallback thumbnail
        const minimalPlaceholder = new Uint8Array([
          0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
          0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
          0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
          0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
          0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
          0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
          0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
          0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01, 0x00,
          0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00,
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F,
          0x00, 0xD2, 0xCF, 0x20, 0xFF, 0xD9
        ]).buffer;
        thumbnailArrayBuffer = minimalPlaceholder;
        apiLogger.log("Created fallback JPEG placeholder due to error");
      }
    }
    
    // Generate unique filenames
    const videoId = uuid();
    const videoFilename = `videos/${responseId}/${videoId}.webm`;
    const thumbnailFilename = `thumbnails/${responseId}/${videoId}.jpg`;
    
    // Convert video File to ArrayBuffer
    const videoArrayBuffer = await videoFile.arrayBuffer();
    // thumbnailArrayBuffer is now handled in the code above
    
    // Upload video to S3
    apiLogger.log("Preparing video upload", { 
      key: videoFilename, 
      size: videoArrayBuffer.byteLength,
      contentType: videoFile.type || 'video/webm'
    });
    
    const uploadVideoCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: videoFilename,
      Body: Buffer.from(videoArrayBuffer),
      ContentType: videoFile.type || 'video/webm'
    });
    
    try {
      await s3Client.send(uploadVideoCommand);
      apiLogger.log("Video upload successful", { key: videoFilename });
    } catch (error) {
      apiLogger.error("Video upload failed", { key: videoFilename, error });
      throw error; // Re-throw to be caught by the outer try-catch
    }
    
    // Upload thumbnail to S3
    apiLogger.log("Preparing thumbnail upload", { 
      key: thumbnailFilename, 
      size: thumbnailArrayBuffer.byteLength
    });
    
    const uploadThumbnailCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: thumbnailFilename,
      Body: Buffer.from(thumbnailArrayBuffer),
      ContentType: 'image/jpeg'
    });
    
    try {
      await s3Client.send(uploadThumbnailCommand);
      apiLogger.log("Thumbnail upload successful", { key: thumbnailFilename });
    } catch (error) {
      apiLogger.error("Thumbnail upload failed", { key: thumbnailFilename, error });
      throw error; // Re-throw to be caught by the outer try-catch
    }
    
    // Generate presigned URLs for accessing the files
    apiLogger.log("Generating presigned URLs");
    
    const getVideoCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: videoFilename
    });
    
    const getThumbnailCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: thumbnailFilename
    });
    
    let videoUrl, thumbnailUrl;
    try {
      videoUrl = await getSignedUrl(s3Client, getVideoCommand, { expiresIn: 3600 * 24 }); // 24 hours
      thumbnailUrl = await getSignedUrl(s3Client, getThumbnailCommand, { expiresIn: 3600 * 24 }); // 24 hours
      apiLogger.log("Generated presigned URLs successfully");
    } catch (error) {
      apiLogger.error("Failed to generate presigned URLs", { error });
      throw error; // Re-throw to be caught by the outer try-catch
    }
    
    // Prepare response
    const response = {
      videoKey: videoFilename,
      videoUrl,
      thumbnailKey: thumbnailFilename,
      thumbnailUrl,
      questionId,
      recordingIndex: parseInt(recordingIndex, 10)
    };
    
    apiLogger.response(response);
    
    // Return the S3 keys and URLs
    return NextResponse.json(response);
    
  } catch (error: any) {
    // Log the error with whatever information we have
    let errorContext: any = {
      error: error.message,
      stack: error.stack
    };
    
    apiLogger.error('Error in S3 video upload API', errorContext);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred during S3 video upload' },
      { status: 500 }
    );
  }
}
