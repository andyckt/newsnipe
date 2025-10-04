import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Company from '@/models/Company';

/**
 * POST handler to create a new company
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
    const { passcode, companyCode } = await request.json();
    
    // Validate required fields
    if (!passcode || !companyCode) {
      return NextResponse.json(
        { error: 'Passcode and company code are required' },
        { status: 400 }
      );
    }
    
    // Validate company code format (6 digits)
    if (!/^\d{6}$/.test(companyCode)) {
      return NextResponse.json(
        { error: 'Company code must be a 6-digit number' },
        { status: 400 }
      );
    }
    
    // Validate passcode length
    if (passcode.length < 6) {
      return NextResponse.json(
        { error: 'Passcode must be at least 6 characters' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Check if user already has a company
    const existingCompany = await Company.findOne({ creatorId: session.user.id });
    
    if (existingCompany) {
      return NextResponse.json(
        { error: 'You already have a company. You can only create one company per account.' },
        { status: 400 }
      );
    }
    
    // Check if company code is already taken
    const existingCode = await Company.findOne({ companyCode });
    
    if (existingCode) {
      return NextResponse.json(
        { error: 'This company code is already taken. Please try again with a different code.' },
        { status: 400 }
      );
    }
    
    // Create a new company
    const company = await Company.create({
      name: `${session.user.name}'s Company`, // Use user's name as default company name
      companyCode, // Use the frontend-generated company code
      passcode,
      rawPasscode: passcode, // Store the raw passcode for display purposes
      creatorId: session.user.id,
      members: [session.user.id], // Add creator as a member
    });
    
    // Return more complete company data
    return NextResponse.json({
      companyCode: company.companyCode,
      name: company.name,
      id: company._id,
      rawPasscode: passcode, // Include the raw passcode in the response
      message: 'Company created successfully'
    });
    
  } catch (error: any) {
    console.error('Error creating company:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while creating the company' },
      { status: 500 }
    );
  }
}
