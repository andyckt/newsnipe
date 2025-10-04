import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Company from '@/models/Company';
import User from '@/models/User';

/**
 * GET handler to retrieve the user's company information
 * This endpoint requires authentication
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
    
    // Find companies where the user is a member
    const companies = await Company.find({
      members: session.user.id
    }).lean();
    
    if (companies.length === 0) {
      return NextResponse.json({
        hasCompany: false,
        isCreator: false,
        company: null,
        members: []
      });
    }
    
    // For simplicity, we're assuming a user can only be in one company
    // In a more complex system, you might want to handle multiple companies
    const company = companies[0];
    
    // Check if the user is the creator
    const isCreator = company.creatorId.toString() === session.user.id;
    
    // Get member information
    const memberIds = company.members;
    const members = await User.find(
      { _id: { $in: memberIds } },
      { name: 1, email: 1 }
    ).lean();
    
    // Format the response
    return NextResponse.json({
      hasCompany: true,
      isCreator,
      company: {
        id: company._id,
        name: company.name,
        companyCode: company.companyCode,
        createdAt: company.createdAt
      },
      members: members.map(member => ({
        id: member._id,
        name: member.name,
        email: member.email,
        isCreator: member._id.toString() === company.creatorId.toString()
      }))
    });
    
  } catch (error: any) {
    console.error('Error retrieving company information:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while retrieving company information' },
      { status: 500 }
    );
  }
}
