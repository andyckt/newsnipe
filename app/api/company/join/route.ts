import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Company from '@/models/Company';

/**
 * POST handler to join an existing company
 * This endpoint requires authentication
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const { companyCode, passcode } = await request.json();
    
    // Validate required fields
    if (!companyCode || !passcode) {
      return NextResponse.json(
        { error: 'Company code and passcode are required' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the company by code
    const company = await Company.findOne({ companyCode });
    
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found. Please check the company code.' },
        { status: 404 }
      );
    }
    
    // Check if user is already a member
    if (company.members.includes(session.user.id)) {
      return NextResponse.json(
        { error: 'You are already a member of this company.' },
        { status: 400 }
      );
    }
    
    // Verify passcode
    const isPasscodeValid = await company.comparePasscode(passcode);
    
    if (!isPasscodeValid) {
      return NextResponse.json(
        { error: 'Invalid passcode. Please check and try again.' },
        { status: 401 }
      );
    }
    
    // Add user to company members
    company.members.push(session.user.id);
    await company.save();
    
    // Return success message
    return NextResponse.json({
      name: company.name,
      message: 'Successfully joined the company'
    });
    
  } catch (error: any) {
    console.error('Error joining company:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while joining the company' },
      { status: 500 }
    );
  }
}
