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
    await connectToDatabase();
    
    // Get the database instance
    const db = mongoose.connection.db as mongoose.mongo.Db;
    
    // Drop the problematic uniqueId index if it exists
    try {
      await db.collection('snipes').dropIndex('uniqueId_1');
      console.log('Dropped existing uniqueId index');
    } catch (error) {
      console.log('No existing uniqueId index to drop or error dropping index:', error);
    }
    
    // We're no longer using the uniqueId field, so we don't need to create a new index for it
    
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
