import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * GET handler to generate a Cloudinary signature for secure uploads
 * This allows client-side uploads to Cloudinary without exposing the API secret
 */
export async function GET() {
  try {
    // Generate a timestamp for the signature
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Generate the signature
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: 'video-recordings', // Default folder
        // Add any other parameters you want to include in the signature
      },
      process.env.CLOUDINARY_API_SECRET || ''
    );
    
    // Return the signature, timestamp, and API key
    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY
    });
  } catch (error: any) {
    console.error('Error generating Cloudinary signature:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while generating the signature' },
      { status: 500 }
    );
  }
}
