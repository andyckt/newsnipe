import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';

// Store logs in memory for quick access
let logs: Array<{
  id: string;
  timestamp: string;
  message: string;
  data?: any;
  userAgent?: string;
  source: string;
}> = [];

// Max number of logs to keep in memory
const MAX_LOGS = 1000;

// Path to log file
const LOG_FILE_PATH = path.join(process.cwd(), 'debug-logs.json');

// Load existing logs from file if available
try {
  if (fs.existsSync(LOG_FILE_PATH)) {
    const fileContent = fs.readFileSync(LOG_FILE_PATH, 'utf8');
    logs = JSON.parse(fileContent);
    console.log(`Loaded ${logs.length} logs from file`);
  }
} catch (error) {
  console.error('Error loading logs from file:', error);
}

// Save logs to file periodically
const saveLogs = () => {
  try {
    fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(logs.slice(-MAX_LOGS)), 'utf8');
  } catch (error) {
    console.error('Error saving logs to file:', error);
  }
};

// POST handler for adding a new log
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, data, source = 'unknown' } = body;
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    const userAgent = request.headers.get('user-agent') || undefined;
    
    const log = {
      id: uuid(),
      timestamp: new Date().toISOString(),
      message,
      data,
      userAgent,
      source
    };
    
    // Add to in-memory logs
    logs.unshift(log);
    
    // Trim logs if they exceed the maximum
    if (logs.length > MAX_LOGS) {
      logs = logs.slice(0, MAX_LOGS);
    }
    
    // Save logs to file (don't await to avoid blocking)
    setTimeout(saveLogs, 100);
    
    return NextResponse.json({ success: true, id: log.id });
  } catch (error: any) {
    console.error('Error in debug log API:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while logging' },
      { status: 500 }
    );
  }
}

// GET handler for retrieving logs
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);
    const source = url.searchParams.get('source');
    const clear = url.searchParams.get('clear') === 'true';
    
    if (clear) {
      logs = [];
      saveLogs();
      return NextResponse.json({ success: true, message: 'Logs cleared' });
    }
    
    let filteredLogs = [...logs];
    
    if (source) {
      filteredLogs = filteredLogs.filter(log => log.source === source);
    }
    
    return NextResponse.json({
      logs: filteredLogs.slice(0, limit),
      total: filteredLogs.length
    });
  } catch (error: any) {
    console.error('Error retrieving logs:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while retrieving logs' },
      { status: 500 }
    );
  }
}
