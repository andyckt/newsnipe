"use client"

import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand,
  DeleteObjectCommand
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 as uuid } from 'uuid'
import { nanoid } from 'nanoid'

// Initialize the S3 client with credentials from environment variables
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
  }
})

const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || 'camera-recorder-audio'

// Utility function to create a thumbnail from a video
export const createThumbnail = async (videoBlob: Blob): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      // Create video element
      const video = document.createElement('video')
      video.autoplay = false
      video.muted = true
      video.playsInline = true
      
      // Create canvas for thumbnail
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }
      
      // Set up video event listeners
      video.onloadedmetadata = () => {
        // Set canvas size to video dimensions
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        // Seek to 1 second or video duration if shorter
        const seekTime = Math.min(1.0, video.duration / 2)
        video.currentTime = seekTime
      }
      
      video.onseeked = () => {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create thumbnail blob'))
            }
            
            // Clean up
            URL.revokeObjectURL(video.src)
          },
          'image/jpeg',
          0.7 // JPEG quality
        )
      }
      
      // Handle errors
      video.onerror = () => {
        reject(new Error('Error loading video for thumbnail generation'))
        URL.revokeObjectURL(video.src)
      }
      
      // Load the video blob
      video.src = URL.createObjectURL(videoBlob)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Uploads an audio blob to S3 and returns the key (filename)
 * @param audioBlob - The audio blob to upload
 * @param prefix - Optional prefix for the S3 key (folder path)
 * @returns The S3 key of the uploaded file
 */
export const uploadAudioToS3 = async (
  audioBlob: Blob,
  prefix: string = 'audio/'
): Promise<string> => {
  try {
    // Generate a unique filename
    const filename = `${prefix}${uuid()}.mp3`
    
    // Convert Blob to Buffer
    const arrayBuffer = await audioBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Create the upload command
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: 'audio/mpeg'
    })
    
    // Upload the file to S3
    await s3Client.send(uploadCommand)
    
    console.log(`Audio uploaded successfully to S3: ${filename}`)
    return filename
  } catch (error) {
    console.error('Error uploading audio to S3:', error)
    throw error
  }
}

/**
 * Generates a presigned URL for accessing an S3 object
 * @param key - The S3 key (filename) of the object
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns A presigned URL for accessing the object
 */
export const getAudioUrl = async (
  key: string,
  expiresIn: number = 3600
): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    })
    
    const url = await getSignedUrl(s3Client, command, { expiresIn })
    return url
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    throw error
  }
}

/**
 * Deletes an audio file from S3
 * @param key - The S3 key (filename) of the object to delete
 */
export const deleteAudioFromS3 = async (key: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    })
    
    await s3Client.send(command)
    console.log(`Audio deleted from S3: ${key}`)
  } catch (error) {
    console.error('Error deleting audio from S3:', error)
    throw error
  }
}

/**
 * Uploads a video blob to S3 and returns the key (filename)
 * @param videoBlob - The video blob to upload
 * @param responseId - The response ID to use in the path
 * @returns The S3 key of the uploaded file
 */
export const uploadVideoToS3 = async (
  videoBlob: Blob,
  responseId: string
): Promise<string> => {
  try {
    // Generate a unique filename
    const filename = `videos/${responseId}/${uuid()}.webm`
    
    // Convert Blob to Buffer
    const arrayBuffer = await videoBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Create the upload command
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: videoBlob.type
    })
    
    // Upload the file to S3
    await s3Client.send(uploadCommand)
    
    console.log(`Video uploaded successfully to S3: ${filename}`)
    return filename
  } catch (error) {
    console.error('Error uploading video to S3:', error)
    throw error
  }
}

/**
 * Uploads a thumbnail image to S3 and returns the key (filename)
 * @param thumbnailBlob - The thumbnail blob to upload
 * @param responseId - The response ID to use in the path
 * @param videoKey - The video key to match with the thumbnail
 * @returns The S3 key of the uploaded file
 */
export const uploadThumbnailToS3 = async (
  thumbnailBlob: Blob,
  responseId: string,
  videoKey: string
): Promise<string> => {
  try {
    // Extract the UUID from the video key
    const videoId = videoKey.split('/').pop()?.split('.')[0] || uuid()
    
    // Generate a filename based on the video ID
    const filename = `thumbnails/${responseId}/${videoId}.jpg`
    
    // Convert Blob to Buffer
    const arrayBuffer = await thumbnailBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Create the upload command
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: 'image/jpeg'
    })
    
    // Upload the file to S3
    await s3Client.send(uploadCommand)
    
    console.log(`Thumbnail uploaded successfully to S3: ${filename}`)
    return filename
  } catch (error) {
    console.error('Error uploading thumbnail to S3:', error)
    throw error
  }
}