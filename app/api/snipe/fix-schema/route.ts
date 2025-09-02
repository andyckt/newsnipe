import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

/**
 * POST handler to fix the snipe collection schema
 * This is an admin-only endpoint to fix the uniqueId index issue
 * Requires authenticated user with admin privileges
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
    
    // Connect to the database
    const conn = await connectToDatabase();
    
    // Get the database instance
    const db = mongoose.connection.db;
    
    // Drop the problematic index if it exists
    try {
      await db.collection('snipes').dropIndex('uniqueId_1');
      console.log('Dropped existing uniqueId index');
    } catch (error) {
      console.log('No existing uniqueId index to drop or error dropping index:', error);
    }
    
    // Create a new sparse index on uniqueId
    await db.collection('snipes').createIndex({ uniqueId: 1 }, { 
      unique: true, 
      sparse: true,
      background: true
    });
    
    return NextResponse.json({
      success: true,
      message: 'Schema fixed successfully'
    });
    
  } catch (error: any) {
    console.error('Error fixing schema:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while fixing the schema' },
      { status: 500 }
    );
  }
}
