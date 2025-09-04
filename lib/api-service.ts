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
 * Uploads a video recording to S3 with a thumbnail
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
    // First, generate a thumbnail from the video
    const thumbnailBlob = await import('@/lib/s3-service').then(({ createThumbnail }) => {
      return createThumbnail(videoBlob);
    });

    // Create a FormData object to upload both files
    const formData = new FormData();
    formData.append('video', videoBlob, 'recording.webm');
    formData.append('thumbnail', thumbnailBlob, 'thumbnail.jpg');
    formData.append('responseId', responseId);
    formData.append('questionId', questionId);
    formData.append('recordingIndex', recordingIndex.toString());

    // Upload the files to S3
    const uploadResponse = await fetch('/api/s3-video-upload', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      throw new Error(`S3 upload error: ${uploadResponse.status} ${JSON.stringify(errorData)}`);
    }

    // Get the S3 URLs and keys from the response
    const { videoKey, videoUrl, thumbnailKey, thumbnailUrl } = await uploadResponse.json();

    return { videoKey, videoUrl, thumbnailKey, thumbnailUrl };
  } catch (error) {
    console.error('Error in uploadVideoRecording:', error);
    throw error;
  }
}
