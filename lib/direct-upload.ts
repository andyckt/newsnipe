"use client"

import { mobileLogger } from './debug-logger';

/**
 * Gets a presigned URL for direct upload to S3
 * @param responseId - The response ID
 * @param questionId - The question ID
 * @param recordingIndex - The recording index
 * @param fileType - The file type (MIME type)
 * @param isVideo - Whether this is a video file
 * @returns Object containing presigned URL and file information
 */
export const getPresignedUploadUrl = async (
  responseId: string,
  questionId: string,
  recordingIndex: number,
  fileType: string,
  isVideo: boolean
): Promise<{
  presignedUrl: string;
  fileKey: string;
  fileId: string;
}> => {
  try {
    // Build the query parameters
    const params = new URLSearchParams({
      responseId,
      questionId,
      recordingIndex: recordingIndex.toString(),
      fileType,
      isVideo: isVideo.toString()
    });
    
    mobileLogger.log("Getting presigned URL", {
      responseId,
      questionId,
      recordingIndex,
      fileType,
      isVideo
    });
    
    // Call the API to get a presigned URL
    const response = await fetch(`/api/s3-presigned-upload?${params.toString()}`);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Could not read error response");
      throw new Error(`Failed to get presigned URL: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    mobileLogger.log("Got presigned URL", {
      fileKey: data.fileKey,
      fileId: data.fileId
    });
    
    return {
      presignedUrl: data.presignedUrl,
      fileKey: data.fileKey,
      fileId: data.fileId
    };
  } catch (error) {
    mobileLogger.error("Error getting presigned URL", {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
};

/**
 * Uploads a file directly to S3 using a presigned URL
 * @param blob - The blob to upload
 * @param presignedUrl - The presigned URL
 * @returns Promise that resolves when the upload is complete
 */
export const uploadToPresignedUrl = async (blob: Blob, presignedUrl: string): Promise<void> => {
  try {
    mobileLogger.log("Starting direct upload to S3", {
      blobSize: blob.size,
      blobType: blob.type
    });
    
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': blob.type
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Could not read error response");
      mobileLogger.error("Failed to upload to presigned URL", { errorText });
      throw new Error(`Failed to upload to presigned URL: ${response.status} - ${errorText}`);
    }
    
    mobileLogger.log("Direct upload successful");
    return;
  } catch (error) {
    mobileLogger.error("Error uploading to presigned URL", {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
};

/**
 * Uploads a video and thumbnail directly to S3 using presigned URLs
 * This bypasses the Vercel function size limits
 * @param videoBlob - The video blob
 * @param thumbnailBlob - The thumbnail blob
 * @param responseId - The response ID
 * @param questionId - The question ID
 * @param recordingIndex - The recording index
 * @returns Object containing file keys and URLs
 */
export const directUpload = async (
  videoBlob: Blob,
  thumbnailBlob: Blob | null,
  responseId: string,
  questionId: string,
  recordingIndex: number
): Promise<{
  videoKey: string;
  thumbnailKey: string;
}> => {
  try {
    mobileLogger.log("Starting direct upload process", {
      responseId,
      questionId,
      recordingIndex,
      videoSize: videoBlob.size,
      hasThumbnail: !!thumbnailBlob
    });
    
    // Get presigned URL for video
    const videoData = await getPresignedUploadUrl(
      responseId,
      questionId,
      recordingIndex,
      videoBlob.type || 'video/webm',
      true
    );
    
    // Upload video directly to S3
    await uploadToPresignedUrl(videoBlob, videoData.presignedUrl);
    
    let thumbnailKey = '';
    
    // If we have a thumbnail, upload it too
    if (thumbnailBlob) {
      // Get presigned URL for thumbnail
      const thumbnailData = await getPresignedUploadUrl(
        responseId,
        questionId,
        recordingIndex,
        'image/jpeg',
        false
      );
      
      // Upload thumbnail directly to S3
      await uploadToPresignedUrl(thumbnailBlob, thumbnailData.presignedUrl);
      thumbnailKey = thumbnailData.fileKey;
    }
    
    // Update the URLs in the database
  try {
    mobileLogger.log("Updating URLs in database", {
      responseId,
      questionId,
      recordingIndex,
      videoKey: videoData.fileKey,
      thumbnailKey
    });
    
    const response = await fetch('/api/s3-update-urls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        responseId,
        questionId,
        recordingIndex,
        videoKey: videoData.fileKey,
        thumbnailKey
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Could not read error response");
      mobileLogger.warn("Failed to update URLs in database", { errorText });
      // Continue anyway, we'll still return the keys
    } else {
      const data = await response.json();
      mobileLogger.log("URLs updated in database", {
        success: data.success,
        hasVideoUrl: !!data.videoUrl,
        hasThumbnailUrl: !!data.thumbnailUrl
      });
    }
  } catch (error) {
    mobileLogger.warn("Error updating URLs in database", {
      error: error instanceof Error ? error.message : String(error)
    });
    // Continue anyway, we'll still return the keys
  }
  
  return {
    videoKey: videoData.fileKey,
    thumbnailKey
  };
  } catch (error) {
    mobileLogger.error("Error in direct upload", {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
};
