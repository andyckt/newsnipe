import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb-client';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  // Check authorization
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const token = authHeader.substring(7);
  
  // Simple password check - in a real app, use a more secure method
  if (token.toUpperCase() !== 'SNIPE2025') {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 403 });
  }
  
  try {
    const client = await clientPromise;
    const db = client.db('snipe'); // Specify your database name
    
    // Get current date and calculate dates for filtering
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // User statistics
    const totalUsers = await db.collection('users').countDocuments();
    const newUsersToday = await db.collection('users').countDocuments({
      createdAt: { $gte: startOfToday }
    });
    const newUsersThisWeek = await db.collection('users').countDocuments({
      createdAt: { $gte: startOfWeek }
    });
    const newUsersThisMonth = await db.collection('users').countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    // Get user growth data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const userGrowthPipeline = [
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      },
      {
        $project: {
          _id: 0,
          date: {
            $concat: [
              { $toString: "$_id.month" }, "/",
              { $toString: "$_id.day" }
            ]
          },
          count: 1
        }
      }
    ];
    
    const userGrowthData = await db.collection('users').aggregate(userGrowthPipeline).toArray();
    
    // Snipe statistics
    const totalSnipes = await db.collection('snipes').countDocuments();
    const snipesToday = await db.collection('snipes').countDocuments({
      createdAt: { $gte: startOfToday }
    });
    const snipesThisWeek = await db.collection('snipes').countDocuments({
      createdAt: { $gte: startOfWeek }
    });
    
    // Get snipes by mode
    const snipesByModePipeline = [
      {
        $group: {
          _id: "$mode",
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1
        }
      }
    ];
    
    const snipesByMode = await db.collection('snipes').aggregate(snipesByModePipeline).toArray();
    
    // Get snipes by language
    const snipesByLanguagePipeline = [
      {
        $group: {
          _id: "$audioLanguage",
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1
        }
      }
    ];
    
    const snipesByLanguage = await db.collection('snipes').aggregate(snipesByLanguagePipeline).toArray();
    
    // Response statistics
    const totalResponses = await db.collection('responses').countDocuments();
    const responsesToday = await db.collection('responses').countDocuments({
      createdAt: { $gte: startOfToday }
    });
    const responsesThisWeek = await db.collection('responses').countDocuments({
      createdAt: { $gte: startOfWeek }
    });
    
    // Get responses by status
    const responsesByStatusPipeline = [
      {
        $group: {
          _id: "$status",
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1
        }
      }
    ];
    
    const responsesByStatus = await db.collection('responses').aggregate(responsesByStatusPipeline).toArray();
    
    // Get responses by decision
    const responsesByDecisionPipeline = [
      {
        $match: {
          decision: { $exists: true }
        }
      },
      {
        $group: {
          _id: "$decision",
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1
        }
      }
    ];
    
    const responsesByDecision = await db.collection('responses').aggregate(responsesByDecisionPipeline).toArray();
    
    // Add "No Decision" category for responses without decisions
    const responsesWithoutDecision = await db.collection('responses').countDocuments({
      decision: { $exists: false }
    });
    
    if (responsesWithoutDecision > 0) {
      responsesByDecision.push({
        name: "no_decision",
        value: responsesWithoutDecision
      });
    }
    
    // Compile analytics data
    const analyticsData = {
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
        growth: userGrowthData
      },
      snipes: {
        total: totalSnipes,
        createdToday: snipesToday,
        createdThisWeek: snipesThisWeek,
        byMode: snipesByMode,
        byLanguage: snipesByLanguage
      },
      responses: {
        total: totalResponses,
        completedToday: responsesToday,
        completedThisWeek: responsesThisWeek,
        byStatus: responsesByStatus,
        byDecision: responsesByDecision
      }
    };
    
    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
