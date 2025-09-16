import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// @ts-ignore - AWS SDK doesn't have TypeScript definitions
import AWS from 'aws-sdk';

/**
 * GET handler to generate a fresh presigned URL for a video
 * This endpoint requires authentication
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const url = new URL(request.url);
    const videoKey = url.searchParams.get('key');
    
    if (!videoKey) {
      return NextResponse.json(
        { error: 'Video key is required' },
        { status: 400 }
      );
    }
    
    // Configure AWS
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
    });
    
    // Generate a presigned URL that's valid for 1 hour
    const presignedUrl = s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_S3_BUCKET || 'camera-recorder-audio',
      Key: videoKey,
      Expires: 3600 // 1 hour
    });
    
    return NextResponse.json({
      url: presignedUrl
    });
    
  } catch (error: any) {
    console.error('Error generating presigned URL:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while generating the presigned URL' },
      { status: 500 }
    );
  }
}
