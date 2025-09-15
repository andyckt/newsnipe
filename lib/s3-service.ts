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

// Check if running on a mobile device
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || ''
  const isMobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(userAgent.substr(0, 4))
  
  console.log(`Device detection`, { isMobile, userAgent });
  return isMobile;
}

// Create a simple placeholder thumbnail for mobile devices
const createPlaceholderThumbnail = async (): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas for thumbnail
      const canvas = document.createElement('canvas')
      canvas.width = 320
      canvas.height = 240
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }
      
      // Fill with a gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#4a90e2')
      gradient.addColorStop(1, '#63b3ed')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Add text
      ctx.fillStyle = 'white'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Video Recording', canvas.width / 2, canvas.height / 2)
      
      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create placeholder thumbnail'))
          }
        },
        'image/jpeg',
        0.9 // JPEG quality
      )
    } catch (error) {
      reject(error)
    }
  })
}

// Utility function to prepare for Cloudinary thumbnail generation
// Instead of generating thumbnails client-side, we'll use Cloudinary's API
export const prepareForCloudinaryThumbnail = async (videoBlob: Blob): Promise<Blob> => {
  console.log('Preparing for Cloudinary thumbnail generation');
  
  // We'll just return a small placeholder blob that will be replaced by Cloudinary
  // This is just to maintain the API compatibility while we transition to Cloudinary
  return new Blob([new Uint8Array(1)], { type: 'image/jpeg' });
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