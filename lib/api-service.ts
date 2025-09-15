"use client"

/**
 * Client-side service for interacting with our server API routes
 */

/**
 * Converts text to speech using our server API and returns a URL to the audio
 * @param text - The text to convert to speech
 * @param language - The language to use ('english' or 'mandarin')
 * @returns Promise with the URL and key of the uploaded audio file
 */
export async function textToSpeechAndUpload(
  text: string,
  language: 'english' | 'mandarin' = 'english'
): Promise<{ url: string; key: string }> {
  try {
    // First, convert text to speech using our API
    const response = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, language }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    // Get the audio blob from the response
    const audioBlob = await response.blob();

    // Create a FormData object to upload the audio to S3
    const formData = new FormData();
    formData.append('audio', audioBlob, 'speech.mp3');
    formData.append('language', language);

    // Upload the audio to S3
    const uploadResponse = await fetch('/api/s3-upload', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      throw new Error(`S3 upload error: ${uploadResponse.status} ${JSON.stringify(errorData)}`);
    }

    // Get the S3 URL and key from the response
    const { url, key } = await uploadResponse.json();

    return { url, key };
  } catch (error) {
    console.error('Error in textToSpeechAndUpload:', error);
    throw error;
  }
}

/**
 * Gets a fresh presigned URL for an S3 object
 * @param key - The S3 key of the object
 * @returns Promise with the presigned URL
 */
export async function getPresignedUrl(key: string): Promise<string> {
  try {
    const response = await fetch(`/api/s3-presigned-url?key=${encodeURIComponent(key)}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Error getting presigned URL:', error);
    throw error;
  }
}

/**
 * Plays audio from the provided URL
 * @param audioUrl - The URL of the audio to play
 */
export const playAudio = (audioUrl: string): void => {
  // Import the enhanced audio playback function from our audio utility
  import('@/lib/audio').then(({ playAudio, unlockAudio }) => {
    // Try to unlock audio first
    unlockAudio();
    // Then play the audio
    playAudio(audioUrl).catch(error => {
      console.error('Error playing audio:', error);
    });
  }).catch(error => {
    console.error('Error importing audio utilities:', error);
    // Fallback to basic audio playback
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error('Error playing audio (fallback):', error);
    });
  });
};

/**
 * Gets a presigned URL for direct upload to S3
 * @param responseId - The response ID to associate with the file
 * @param fileType - The type of file ('video' or 'thumbnail')
 * @param contentType - The MIME type of the file
 * @param questionId - The question ID associated with the recording
 * @param recordingIndex - The index of the recording
 * @returns Promise with the presigned URL and key
 */
export async function getPresignedUploadUrl(
  responseId: string,
  fileType: 'video' | 'thumbnail',
  contentType: string,
  questionId: string,
  recordingIndex: number
): Promise<{
  presignedUrl: string;
  key: string;
  fileId: string;
}> {
  try {
    console.log(`Getting presigned URL for ${fileType} upload, contentType: ${contentType}`);
    
    const response = await fetch('/api/s3-presigned-upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        responseId,
        fileType,
        contentType,
        questionId,
        recordingIndex
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting presigned upload URL:', error);
    throw error;
  }
}

/**
 * Uploads a file directly to S3 using a presigned URL
 * @param presignedUrl - The presigned URL for upload
 * @param blob - The file blob to upload
 * @returns Promise that resolves when the upload is complete
 */
export async function uploadToS3WithPresignedUrl(
  presignedUrl: string,
  blob: Blob
): Promise<void> {
  try {
    console.log(`Uploading file of type ${blob.type} and size ${blob.size} bytes directly to S3`);
    
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': blob.type
      }
    });

    if (!response.ok) {
      throw new Error(`S3 direct upload error: ${response.status}`);
    }
    
    console.log('Direct S3 upload completed successfully');
  } catch (error) {
    console.error('Error uploading to S3 with presigned URL:', error);
    throw error;
  }
}

/**
 * Notifies the server that a direct S3 upload is complete
 * @param responseId - The response ID associated with the upload
 * @param videoKey - The S3 key of the uploaded video
 * @param thumbnailKey - The S3 key of the uploaded thumbnail (optional)
 * @param questionId - The question ID associated with the recording
 * @param recordingIndex - The index of the recording
 * @returns Promise with the URLs of the uploaded files
 */
export async function notifyUploadComplete(
  responseId: string,
  videoKey: string,
  thumbnailKey: string | null,
  questionId: string,
  recordingIndex: number
): Promise<{
  videoUrl: string;
  thumbnailUrl: string | null;
}> {
  try {
    console.log(`Notifying upload completion for responseId: ${responseId}, videoKey: ${videoKey}`);
    
    const response = await fetch('/api/s3-upload-complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        responseId,
        videoKey,
        thumbnailKey,
        questionId,
        recordingIndex
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return {
      videoUrl: data.videoUrl,
      thumbnailUrl: data.thumbnailUrl
    };
  } catch (error) {
    console.error('Error notifying upload completion:', error);
    throw error;
  }
}

/**
 * Uploads a video recording to S3 and uses Cloudinary for thumbnail generation
 * @param videoBlob - The video blob to upload
 * @param responseId - The response ID to associate with the video
 * @param questionId - The question ID associated with the recording
 * @param recordingIndex - The index of the recording
 * @returns Promise with the URLs and keys of the uploaded files
 */
export async function uploadVideoRecording(
  videoBlob: Blob,
  responseId: string,
  questionId: string,
  recordingIndex: number
): Promise<{
  videoKey: string;
  videoUrl: string;
  thumbnailKey: string;
  thumbnailUrl: string;
}> {
  try {
    console.log(`Starting upload process for video of size ${videoBlob.size} bytes`);
    
    // Get presigned URL for video upload to S3
    const videoUploadData = await getPresignedUploadUrl(
      responseId,
      'video',
      videoBlob.type,
      questionId,
      recordingIndex
    );
    
    // Upload video directly to S3
    console.log('Uploading video directly to S3...');
    await uploadToS3WithPresignedUrl(videoUploadData.presignedUrl, videoBlob);
    
    // Upload to Cloudinary for thumbnail generation
    console.log('Uploading to Cloudinary for thumbnail generation...');
    const { uploadVideoToCloudinary, generateThumbnailUrl } = await import('@/lib/cloudinary-service');
    
    // Upload to Cloudinary with folder structure based on responseId
    const cloudinaryResult = await uploadVideoToCloudinary(
      videoBlob,
      `video-recordings/${responseId}`
    );
    
    // Generate thumbnail URL using Cloudinary's API
    const thumbnailUrl = generateThumbnailUrl(cloudinaryResult.publicId, {
      width: 320,
      height: 240,
      quality: 80,
      timestamp: 1 // Get thumbnail from 1 second into the video
    });
    
    // Store Cloudinary reference as the thumbnail key
    const thumbnailKey = `cloudinary:${cloudinaryResult.publicId}`;
    
    // Notify server that uploads are complete
    console.log('Notifying server of completed uploads...');
    await notifyUploadComplete(
      responseId,
      videoUploadData.key,
      thumbnailKey,
      questionId,
      recordingIndex
    );
    
    return {
      videoKey: videoUploadData.key,
      videoUrl: videoUploadData.presignedUrl, // This will be a temporary URL
      thumbnailKey: thumbnailKey,
      thumbnailUrl: thumbnailUrl
    };
  } catch (error) {
    console.error('Error in uploadVideoRecording:', error);
    throw error;
  }
}