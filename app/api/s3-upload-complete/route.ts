import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import connectToDatabase from '@/lib/mongodb';
import Response from '@/models/Response';

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
 * POST handler to notify that a direct S3 upload is complete
 * Updates the response record with the uploaded file information
 */
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { 
      responseId, 
      videoKey, 
      thumbnailKey,
      questionId,
      recordingIndex
    } = body;
    
    // Validate required fields
    if (!responseId || !videoKey) {
      return NextResponse.json(
        { error: 'Missing required fields: responseId, videoKey' },
        { status: 400 }
      );
    }
    
    // Generate presigned URLs for accessing the files
    const getVideoCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: videoKey
    });
    
    let videoUrl = await getSignedUrl(s3Client, getVideoCommand, { expiresIn: 3600 * 24 }); // 24 hours
    let thumbnailUrl = null;
    
    // If thumbnail was also uploaded, generate a presigned URL for it
    if (thumbnailKey) {
      if (thumbnailKey.startsWith('cloudinary:')) {
        // For Cloudinary thumbnails, extract the public ID and generate a URL
        const publicId = thumbnailKey.replace('cloudinary:', '');
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
        thumbnailUrl = `https://res.cloudinary.com/${cloudName}/video/upload/v1/${publicId}.jpg`;
        console.log(`Using Cloudinary thumbnail URL: ${thumbnailUrl}`);
      } else {
        // For S3 thumbnails, generate a presigned URL
        const getThumbnailCommand = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: thumbnailKey
        });
        thumbnailUrl = await getSignedUrl(s3Client, getThumbnailCommand, { expiresIn: 3600 * 24 }); // 24 hours
      }
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
    
    // Create the recording object to add to the response
    const recordingData: any = {
      questionId,
      recordingIndex: parseInt(recordingIndex.toString(), 10),
      videoKey,
      videoUrl
    };
    
    if (thumbnailKey && thumbnailUrl) {
      recordingData.thumbnailKey = thumbnailKey;
      recordingData.thumbnailUrl = thumbnailUrl;
    }
    
    // Get existing recordings
    const existingRecordings = response.recordings || [];
    
    // Log the existing recordings for debugging
    console.log(`Found ${existingRecordings.length} existing recordings for response ${responseId}`);
    existingRecordings.forEach((rec: any, idx: number) => {
      console.log(`Existing Recording ${idx + 1}: questionId=${rec.questionId}, recordingIndex=${rec.recordingIndex}, videoKey=${rec.videoKey || 'none'}`);
    });
    
    // Check if this exact videoKey already exists in the recordings
    const existingRecordingIndex = existingRecordings.findIndex((rec: any) => rec.videoKey === videoKey);
    
    if (existingRecordingIndex >= 0) {
      console.log(`Video key ${videoKey} already exists in recordings, updating existing record`);
      
      // Update the existing recording with any new information
      existingRecordings[existingRecordingIndex] = {
        ...existingRecordings[existingRecordingIndex],
        ...recordingData
      };
    } else {
      console.log(`Adding new recording with questionId=${questionId}, recordingIndex=${recordingIndex}, videoKey=${videoKey}`);
      
      // Add as a new recording
      existingRecordings.push(recordingData);
    }
    
    // Save the updated response
    response.recordings = existingRecordings;
    await response.save();
    
    // Log the updated recordings for debugging
    console.log(`Updated recordings array now has ${response.recordings.length} items`);
    response.recordings.forEach((rec: any, idx: number) => {
      console.log(`Updated Recording ${idx + 1}: questionId=${rec.questionId}, recordingIndex=${rec.recordingIndex}, videoKey=${rec.videoKey || 'none'}`);
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      videoUrl,
      thumbnailUrl,
      message: 'Upload completion recorded successfully'
    });
    
  } catch (error: any) {
    console.error('Error processing upload completion:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while processing upload completion' },
      { status: 500 }
    );
  }
}