import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Snipe from '@/models/Snipe';

/**
 * GET handler to retrieve a snipe configuration by shortId
 * This endpoint is public to allow anyone with the link to use it
 */
export async function GET(
  request: Request,
  { params }: { params: { shortId: string } }
) {
  try {
    const { shortId } = params;
    
    if (!shortId) {
      return NextResponse.json(
        { error: 'Short ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the snipe configuration by shortId
    const snipeConfig = await Snipe.findOne({ shortId }).lean();
    
    if (!snipeConfig) {
      return NextResponse.json(
        { error: 'Snipe configuration not found' },
        { status: 404 }
      );
    }
    
    // Return the configuration data (excluding sensitive fields)
    const { userId, _id, __v, ...configData } = snipeConfig;
    
    return NextResponse.json(configData);
    
  } catch (error: any) {
    console.error('Error retrieving snipe configuration:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while retrieving the configuration' },
      { status: 500 }
    );
  }
}
