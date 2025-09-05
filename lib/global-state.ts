"use client"

// A simple global state manager for critical values that need to be accessed across components
// This is a last resort for when other state management approaches fail

// Define the global state type
interface GlobalState {
  responseId: string | null;
  [key: string]: any;
}

// Initialize the global state
const globalState: GlobalState = {
  responseId: null
};

// Function to get a value from global state
export function getGlobalValue<T>(key: keyof GlobalState): T | null {
  return globalState[key] as T | null;
}

// Function to set a value in global state
export function setGlobalValue<T>(key: keyof GlobalState, value: T): void {
  globalState[key] = value;
}

// Specific functions for responseId
export function getResponseId(): string | null {
  return globalState.responseId;
}

export function setResponseId(id: string | null): void {
  globalState.responseId = id;
  
  // Also store in other places for redundancy
  if (typeof window !== 'undefined' && id) {
    try {
      // Store in window object
      (window as any).snipeResponseId = id;
      
      // Store in localStorage
      localStorage.setItem('snipeResponseId', id);
      
      // Store in sessionStorage
      sessionStorage.setItem('snipeResponseId', id);
      
      // Store in cookie
      document.cookie = `snipeResponseId=${id}; path=/; max-age=3600`;
      
      // Store in a hidden input field
      let hiddenInput = document.getElementById('snipeResponseIdField') as HTMLInputElement;
      if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = 'snipeResponseIdField';
        document.body.appendChild(hiddenInput);
      }
      hiddenInput.value = id;
      
      console.log("Stored responseId in all storage locations:", id);
    } catch (error) {
      console.error("Error storing responseId in global state:", error);
    }
  }
}

// Function to get responseId from all possible sources
export function getResponseIdFromAllSources(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try global state first
  if (globalState.responseId) {
    return globalState.responseId;
  }
  
  // Try window object
  if ((window as any).snipeResponseId) {
    return (window as any).snipeResponseId;
  }
  
  // Try localStorage
  const localStorageId = localStorage.getItem('snipeResponseId');
  if (localStorageId) {
    return localStorageId;
  }
  
  // Try sessionStorage
  const sessionStorageId = sessionStorage.getItem('snipeResponseId');
  if (sessionStorageId) {
    return sessionStorageId;
  }
  
  // Try cookies
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('snipeResponseId='))
    ?.split('=')[1];
  if (cookieValue) {
    return cookieValue;
  }
  
  // Try hidden input field
  const hiddenInput = document.getElementById('snipeResponseIdField') as HTMLInputElement;
  if (hiddenInput && hiddenInput.value) {
    return hiddenInput.value;
  }
  
  return null;
}
