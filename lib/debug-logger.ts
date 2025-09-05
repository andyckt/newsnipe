/**
 * Debug logger utility for remote logging
 * Useful for debugging on mobile devices where console access is limited
 */

// Function to log to the remote API
export async function remoteLog(message: string, data?: any, source: string = 'client') {
  try {
    // Always log to console first
    if (data) {
      console.log(`[${source}] ${message}:`, data);
    } else {
      console.log(`[${source}] ${message}`);
    }
    
    // Then send to the API
    const response = await fetch('/api/debug-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        data,
        source,
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to send log to API:', response.status);
    }
    
    return response.ok;
  } catch (error) {
    console.error('Error sending log to API:', error);
    return false;
  }
}

// Create specialized loggers for different sources
export const mobileLogger = {
  log: (message: string, data?: any) => remoteLog(message, data, 'mobile'),
  error: (message: string, data?: any) => remoteLog(`ERROR: ${message}`, data, 'mobile-error'),
  warn: (message: string, data?: any) => remoteLog(`WARNING: ${message}`, data, 'mobile-warn'),
  info: (message: string, data?: any) => remoteLog(message, data, 'mobile-info'),
};

export const uploadLogger = {
  log: (message: string, data?: any) => remoteLog(message, data, 'upload'),
  error: (message: string, data?: any) => remoteLog(`ERROR: ${message}`, data, 'upload-error'),
  start: (data?: any) => remoteLog('Upload started', data, 'upload-start'),
  progress: (data?: any) => remoteLog('Upload progress', data, 'upload-progress'),
  complete: (data?: any) => remoteLog('Upload complete', data, 'upload-complete'),
  fail: (data?: any) => remoteLog('Upload failed', data, 'upload-fail'),
};

export const apiLogger = {
  log: (message: string, data?: any) => remoteLog(message, data, 'api'),
  error: (message: string, data?: any) => remoteLog(`ERROR: ${message}`, data, 'api-error'),
  request: (data?: any) => remoteLog('API request', data, 'api-request'),
  response: (data?: any) => remoteLog('API response', data, 'api-response'),
};

// Default export
export default {
  log: remoteLog,
  mobile: mobileLogger,
  upload: uploadLogger,
  api: apiLogger,
};
