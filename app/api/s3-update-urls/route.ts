import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
 * POST handler for updating a response with S3 URLs after direct upload
 */
export async function POST(request: Request) {
  try {
    const { responseId, questionId, recordingIndex, videoKey, thumbnailKey } = await request.json();
    
    // Validate inputs
    if (!responseId || !questionId || recordingIndex === undefined || !videoKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
    
    // Generate presigned URLs for the files
    const videoCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: videoKey
    });
    
    let thumbnailUrl;
    const videoUrl = await getSignedUrl(s3Client, videoCommand, { expiresIn: 3600 * 24 });
    
    if (thumbnailKey) {
      const thumbnailCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: thumbnailKey
      });
      thumbnailUrl = await getSignedUrl(s3Client, thumbnailCommand, { expiresIn: 3600 * 24 });
    }
    
    // Find the recording in the response
    const existingRecordings = response.recordings || [];
    const recordingMap = new Map();
    
    existingRecordings.forEach((rec: any) => {
      const key = `${rec.questionId}:${rec.recordingIndex}`; // Unique key
      recordingMap.set(key, rec);
    });
    
    // Create or update the recording
    const recordingKey = `${questionId}:${recordingIndex}`;
    const existingRecording = recordingMap.get(recordingKey) || {};
    
    recordingMap.set(recordingKey, {
      ...existingRecording,
      questionId,
      recordingIndex,
      videoKey,
      videoUrl,
      ...(thumbnailKey && { thumbnailKey }),
      ...(thumbnailUrl && { thumbnailUrl })
    });
    
    // Update the response with the new recordings
    const updatedRecordings = Array.from(recordingMap.values());
    
    await Response.findByIdAndUpdate(response._id, {
      recordings: updatedRecordings
    });
    
    return NextResponse.json({
      success: true,
      videoUrl,
      thumbnailUrl
    });
    
  } catch (error: any) {
    console.error('Error updating response with S3 URLs:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while updating response' },
      { status: 500 }
    );
  }
}
