"use client"

/**
 * Cloudinary service for generating thumbnails from videos
 */

// Configuration for Cloudinary
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || '';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

/**
 * Uploads a video to Cloudinary and returns the public ID, URL, and version
 * @param videoBlob - The video blob to upload
 * @param folder - The folder to upload to in Cloudinary
 * @returns Promise with the public ID, URL, and version of the uploaded video
 */
export async function uploadVideoToCloudinary(
  videoBlob: Blob,
  folder: string = 'video-recordings'
): Promise<{ publicId: string; url: string; version: number; }> {
  try {
    // Create a FormData object for the upload
    const formData = new FormData();
    formData.append('file', videoBlob);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);
    
    // Upload to Cloudinary using the upload API
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Video uploaded to Cloudinary:', data);
    
    return {
      publicId: data.public_id,
      url: data.secure_url,
      version: data.version
    };
  } catch (error) {
    console.error('Error uploading video to Cloudinary:', error);
    throw error;
  }
}

/**
 * Generates a thumbnail URL from a Cloudinary video
 * @param publicId - The public ID of the video in Cloudinary
 * @param options - Options for the thumbnail
 * @returns The URL of the generated thumbnail
 */
export function generateThumbnailUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    timestamp?: number | string;
  } = {}
): string {
  const {
    width = 320,
    height = 240,
    quality = 80,
    format = 'jpg',
    timestamp = 1
  } = options;
  
  // Construct the transformation string
  const transformation = `w_${width},h_${height},q_${quality},so_${timestamp},c_thumb`;
  
  // Generate the URL with the exact format needed
  const url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${transformation}/${publicId}.${format}`;
  
  return url;
}

/**
 * Generates a video URL from a Cloudinary video
 * @param publicId - The public ID of the video in Cloudinary
 * @param version - The version number of the video in Cloudinary
 * @param options - Options for the video
 * @returns The URL of the video
 */
export function generateVideoUrl(
  publicId: string,
  version: number,
  options: {
    quality?: string;
    format?: string;
    streaming_profile?: string;
  } = {}
): string {
  const {
    quality = 'auto',
    format = 'mp4',
    streaming_profile = 'hd'
  } = options;
  
  // Generate the URL with version number
  const url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/v${version}/${publicId}.${format}`;
  
  return url;
}

/**
 * Gets a signed upload signature for Cloudinary
 * This should be used with a server-side API route
 */
export async function getCloudinarySignature(): Promise<{
  signature: string;
  timestamp: number;
  apiKey: string;
}> {
  try {
    // Call our API endpoint to get a signature
    const response = await fetch('/api/cloudinary-signature');
    
    if (!response.ok) {
      throw new Error(`Failed to get Cloudinary signature: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting Cloudinary signature:', error);
    throw error;
  }
}
