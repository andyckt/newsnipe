'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';

interface Log {
  id: string;
  timestamp: string;
  message: string;
  data?: any;
  userAgent?: string;
  source: string;
}

export default function DebugPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string>('all');
  const [limit, setLimit] = useState(100);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [sources, setSources] = useState<string[]>([]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (source && source !== 'all') queryParams.append('source', source);
      queryParams.append('limit', limit.toString());
      
      const response = await fetch(`/api/debug-log?${queryParams.toString()}`);
      const data = await response.json();
      
      setLogs(data.logs || []);
      
      // Extract unique sources
      const uniqueSources = new Set<string>();
      (data.logs || []).forEach((log: Log) => {
        if (log.source) uniqueSources.add(log.source);
      });
      setSources(Array.from(uniqueSources));
      
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!confirm('Are you sure you want to clear all logs?')) return;
    
    setLoading(true);
    try {
      await fetch('/api/debug-log?clear=true');
      setLogs([]);
    } catch (error) {
      console.error('Error clearing logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format the timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  // Format data for display
  const formatData = (data: any) => {
    if (!data) return null;
    
    try {
      if (typeof data === 'string') {
        return data;
      }
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  };

  // Auto-refresh logs
  useEffect(() => {
    fetchLogs();
    
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [source, limit, autoRefresh]);

  // Get source color
  const getSourceColor = (source: string) => {
    if (source.includes('error')) return 'destructive';
    if (source.includes('warn')) return 'warning';
    if (source.includes('mobile')) return 'blue';
    if (source.includes('upload')) return 'green';
    if (source.includes('api')) return 'purple';
    return 'default';
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Debug Logs</CardTitle>
          <CardDescription>
            View and filter logs from mobile devices and API calls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  {sources.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Input
                type="number"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                min={1}
                max={1000}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={fetchLogs}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={clearLogs}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </Button>
          </div>
          
          <ScrollArea className="h-[600px] border rounded-md p-4">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No logs found
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="border-b pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getSourceColor(log.source) as any}>{log.source}</Badge>
                        <span className="text-sm text-muted-foreground">{formatTime(log.timestamp)}</span>
                      </div>
                    </div>
                    <div className="font-medium">{log.message}</div>
                    {log.data && (
                      <pre className="mt-2 p-2 bg-muted rounded-md text-xs overflow-x-auto">
                        {formatData(log.data)}
                      </pre>
                    )}
                    {log.userAgent && (
                      <div className="mt-1 text-xs text-muted-foreground truncate">
                        {log.userAgent}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {logs.length} logs
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}