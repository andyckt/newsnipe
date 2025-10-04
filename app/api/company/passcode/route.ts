import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Company from '@/models/Company';

/**
 * GET handler to retrieve the company passcode (raw version)
 * This endpoint requires authentication and the user must be the company creator
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the company where the user is the creator
    // Explicitly select the rawPasscode field which is excluded by default
    const company = await Company.findOne({ 
      creatorId: session.user.id 
    }).select('+rawPasscode');
    
    if (!company) {
      return NextResponse.json(
        { error: 'You do not have a company or are not the creator' },
        { status: 404 }
      );
    }
    
    // If rawPasscode doesn't exist, use the passcode from the request
    if (!company.rawPasscode) {
      try {
        // Update the company record with the rawPasscode
        // This handles the case for existing companies created before the rawPasscode field was added
        await Company.updateOne(
          { _id: company._id },
          { $set: { rawPasscode: 'Please enter your passcode again' } }
        );
      } catch (updateError) {
        console.error('Error updating company record:', updateError);
      }
    }
    
    // Return the raw passcode
    return NextResponse.json({
      rawPasscode: company.rawPasscode || 'Please enter your passcode again'
    });
    
  } catch (error: any) {
    console.error('Error retrieving company passcode:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while retrieving the passcode' },
      { status: 500 }
    );
  }
}