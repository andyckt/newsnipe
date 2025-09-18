"use client"

/**
 * Question mode recording hook
 * Derived from the original use-recording.ts file
 * Specialized for question mode with audio prompts
 */

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { preloadAudio, playAudio } from "@/lib/audio"
import { initAudioContext, playMobileAudio, preloadMobileAudio } from "@/lib/mobile-audio"
import { TextInput, TimeLimit } from "@/components/question-tab"

interface RecordingOptions {
  totalRecordings?: number
  audioLanguage?: "english" | "mandarin"
  textInputs?: TextInput[] // Add textInputs to options
  timeLimit?: TimeLimit // Add time limit option
}

export function useQuestionRecording(streamRef: React.RefObject<MediaStream | null>, options: RecordingOptions = {}) {
  const { totalRecordings = 1, audioLanguage = "english", textInputs = [], timeLimit = "no_limit" } = options
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [currentRecordingIndex, setCurrentRecordingIndex] = useState(0)
  const currentRecordingIndexRef = useRef(0) // Add a ref to track the current index reliably
  const [isSessionComplete, setIsSessionComplete] = useState(false)
  const [recordingTimeLeft, setRecordingTimeLeft] = useState<number | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const startAudioRef = useRef<HTMLAudioElement | null>(null)
  const isFirstRecordingRef = useRef(true) // Track if this is the first recording in the session
  const textInputsRef = useRef<TextInput[]>(textInputs) // Store the text inputs for access during recording
  
  // Get the audio file path based on language
  const getAudioPath = () => {
    return audioLanguage === "english" 
      ? '/audio/englishstarter.mp3' 
      : '/audio/mandarinstarter.mp3'
  }
  
  // Preload the starter audio
  useEffect(() => {
    // Initialize audio context
    initAudioContext();
    
    // Preload the audio using both methods for compatibility
    startAudioRef.current = preloadAudio(getAudioPath());
    preloadMobileAudio(getAudioPath()).catch(err => console.error("Error preloading mobile audio:", err));
  }, [audioLanguage])
  
  // Update textInputsRef when textInputs change
  useEffect(() => {
    textInputsRef.current = textInputs
  }, [textInputs])

  const runCountdown = async () => {
    setIsCountingDown(true)
    for (let i = 3; i >= 1; i--) {
      setCountdown(i)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    setCountdown(null)
    setIsCountingDown(false)
  }

  // Reference to store recording metadata for API submission
  const recordingsRef = useRef<Array<{
    questionId: string;
    recordingIndex: number;
    videoKey?: string;
    videoUrl?: string;
    thumbnailKey?: string;
    thumbnailUrl?: string;
    duration?: number;
    pending?: boolean; // Track if this recording is pending upload
    uploadFailed?: boolean; // Track if upload failed
  }>>([])

  // Initialize the recordings array with placeholders for each recording position
  useEffect(() => {
    // Only initialize if the array is empty or if totalRecordings changed
    if (recordingsRef.current.length !== totalRecordings) {
      console.log(`[init] Initializing recordings array with ${totalRecordings} placeholders`);
      // Create an array of the correct size with placeholder entries
      recordingsRef.current = Array.from({ length: totalRecordings }, (_, index) => ({
        questionId: '', // Will be filled when recording starts
        recordingIndex: index,
        pending: false
      }));
    }
  }, [totalRecordings])
  
  // Track pending uploads
  const pendingUploadsRef = useRef<Promise<any>[]>([])
  
  // Track the next unique recording index to use
  const nextUniqueIndexRef = useRef<number>(0)
  
  // Function to handle recording completion - either upload to S3 or mark as failed
  const handleRecordingComplete = async (responseId: string | null, recordingIdx: number = currentRecordingIndex) => {
    if (recordedChunksRef.current.length === 0) return

    const mediaRecorder = mediaRecorderRef.current
    if (!mediaRecorder) return

    const mimeType = mediaRecorder.mimeType
    
    // Create a blob from the recorded chunks
    const blob = new Blob(recordedChunksRef.current, { type: mimeType })
    console.log(`Created blob of type ${mimeType} and size ${blob.size} bytes`);
    
    // Get a unique recording index for this recording
    const uniqueIndex = nextUniqueIndexRef.current++;
    
    // Get the original question ID from the text inputs
    const originalQuestionId = textInputsRef.current.length > recordingIdx 
      ? textInputsRef.current[recordingIdx].id 
      : `question-${recordingIdx + 1}`
    
    // Mark this position in the recordings array as pending upload
    if (recordingsRef.current[recordingIdx]) {
      console.log(`[handleRecordingComplete] Marking recording ${recordingIdx + 1} as pending upload with questionId: ${originalQuestionId}`);
      recordingsRef.current[recordingIdx].questionId = originalQuestionId;
      recordingsRef.current[recordingIdx].pending = true;
    }
    
    // Create a unique upload ID for tracking if needed
    const uploadId = `${originalQuestionId}-${uniqueIndex}`
    
    // Try to get responseId from window object if not provided
    let effectiveResponseId = responseId;
    if (!effectiveResponseId && typeof window !== 'undefined') {
      // Try to get from localStorage
      effectiveResponseId = localStorage.getItem('snipe_response_id');
      
      if (effectiveResponseId) {
        console.log(`Using responseId from localStorage: ${effectiveResponseId}`);
      } else if ((window as any).snipeResponseId) {
        effectiveResponseId = (window as any).snipeResponseId;
        console.log(`Using responseId from window object: ${effectiveResponseId}`);
      }
    }
      
    // If we have a responseId, try to upload to S3
    if (effectiveResponseId) {
      // Create a promise for this upload and add it to pending uploads
      const uploadPromise = (async () => {
        try {
          console.log(`Starting upload for recording ${recordingIdx + 1} with responseId: ${effectiveResponseId}`);
          
          // Import the uploadVideoRecording function
          const { uploadVideoRecording } = await import('@/lib/api-service')
          
          // Upload the video and get the URLs and keys
          // Note: Assuming uploadVideoRecording is defined in api-service
          // If it's not available, this will need to be updated based on the actual API
          const { videoKey, videoUrl, thumbnailKey, thumbnailUrl } = await uploadVideoRecording(
            blob,
            effectiveResponseId!,
            uploadId,
            recordingIdx
          )
          
          console.log(`Recording ${recordingIdx + 1} uploaded to S3:`, { videoKey, thumbnailKey })
          
          // Update the recording metadata at the correct position
          if (recordingsRef.current[recordingIdx]) {
            console.log(`[uploadComplete] Updating recording ${recordingIdx + 1} with upload results`);
            // Update the existing entry with upload results
            recordingsRef.current[recordingIdx] = {
              ...recordingsRef.current[recordingIdx],
              questionId: originalQuestionId, // Use the original question ID
              videoKey,
              videoUrl,
              thumbnailKey,
              thumbnailUrl,
              duration: blob.size > 0 ? 0 : undefined, // We don't know the duration yet
              pending: false // Mark as no longer pending
            };
          } else {
            console.warn(`[uploadComplete] Could not find recording at index ${recordingIdx} in recordings array`);
          }
          
          return { success: true, recordingIndex: recordingIdx }
        } catch (error) {
          console.error('Error uploading recording to S3:', error)
          console.warn(`Upload failed for recording ${recordingIdx + 1}`, { originalQuestionId });
          
          // Instead of downloading, just mark this position as failed but keep the questionId
          if (recordingsRef.current[recordingIdx]) {
            console.log(`[uploadError] Marking recording ${recordingIdx + 1} as failed but keeping questionId`);
            recordingsRef.current[recordingIdx] = {
              ...recordingsRef.current[recordingIdx],
              questionId: originalQuestionId,
              uploadFailed: true,
              pending: false
            };
          }
          return { success: false, recordingIndex: recordingIdx }
        }
      })()
      
      // Add to pending uploads
      pendingUploadsRef.current.push(uploadPromise)
    } else {
      // No responseId, so mark as failed but keep the questionId
      console.warn(`No responseId available for recording ${recordingIdx + 1}`, { originalQuestionId });
      
      // Mark this position as failed but keep the questionId
      if (recordingsRef.current[recordingIdx]) {
        console.log(`[noResponseId] Marking recording ${recordingIdx + 1} as failed but keeping questionId`);
        recordingsRef.current[recordingIdx] = {
          ...recordingsRef.current[recordingIdx],
          questionId: originalQuestionId,
          uploadFailed: true,
          pending: false
        };
      }
    }
    
    // Clear chunks for next recording
    recordedChunksRef.current = []
  }
  
  // Function to mark a recording as failed
  const markRecordingAsFailed = (originalQuestionId: string, recordingIdx: number) => {
    if (recordingsRef.current[recordingIdx]) {
      console.log(`[markFailed] Marking recording ${recordingIdx + 1} as failed`);
      recordingsRef.current[recordingIdx] = {
        ...recordingsRef.current[recordingIdx],
        questionId: originalQuestionId, // Use the original question ID
        uploadFailed: true,
        pending: false // Mark as no longer pending
      };
    } else {
      console.warn(`[markFailed] Could not find recording at index ${recordingIdx} in recordings array`);
    }
  }

  // Helper function to play the appropriate audio for a specific recording index
  const playAudioForRecording = async (recordingIndex: number) => {
    try {
      // Make sure audio context is initialized
      initAudioContext();
      
      if (recordingIndex === 0 && isFirstRecordingRef.current) {
        // For the first recording, play starter audio followed by the first text input audio
        console.log("Playing starter audio...");
        
        // First play the starter audio using mobile-friendly method with volume boost
        try {
          // Apply a volume boost of 8.0 to compensate for the automatic volume reduction during recording
          await playMobileAudio(getAudioPath(), 8.0);
          console.log("Starter audio played successfully with volume boost");
        } catch (error) {
          console.error("Mobile audio playback failed, falling back to standard method:", error);
          // Fallback to standard method with maximum volume
          await playAudio(getAudioPath(), 1.0);
        }
        
        // Then play the first generated audio if available
        if (textInputsRef.current.length > 0 && 
            textInputsRef.current[0].audioUrl && 
            textInputsRef.current[0].audioKey) {
          
          // Get a fresh presigned URL if we have the key (in case the old one expired)
          let urlToPlay = textInputsRef.current[0].audioUrl;
          try {
            // Import the getPresignedUrl function
            const { getPresignedUrl } = await import('@/lib/api-service');
            urlToPlay = await getPresignedUrl(textInputsRef.current[0].audioKey!);
            console.log("Got fresh presigned URL for first audio");
          } catch (err) {
            console.log("Using existing URL for first audio");
          }
          
          console.log("Playing first generated audio...");
          
          // Play the first generated audio immediately after starter audio with volume boost
          try {
            // Apply a volume boost of 8.0 to compensate for the automatic volume reduction during recording
            await playMobileAudio(urlToPlay, 8.0);
            console.log("First generated audio played successfully with volume boost");
          } catch (error) {
            console.error("Mobile audio playback failed, falling back to standard method:", error);
            // Fallback to standard method with maximum volume
            await playAudio(urlToPlay, 1.0);
          }
        }
        
        isFirstRecordingRef.current = false; // Mark that we've played the starter audio
      } else {
        // For subsequent recordings, play the corresponding text input audio
        if (textInputsRef.current.length > recordingIndex && 
            textInputsRef.current[recordingIndex].audioUrl && 
            textInputsRef.current[recordingIndex].audioKey) {
          
          // Get a fresh presigned URL if we have the key (in case the old one expired)
          let urlToPlay = textInputsRef.current[recordingIndex].audioUrl;
          try {
            // Import the getPresignedUrl function
            const { getPresignedUrl } = await import('@/lib/api-service');
            urlToPlay = await getPresignedUrl(textInputsRef.current[recordingIndex].audioKey!);
            console.log(`Got fresh presigned URL for recording ${recordingIndex + 1} audio`);
          } catch (err) {
            console.log(`Using existing URL for recording ${recordingIndex + 1} audio`);
          }
          
          console.log(`Playing recording ${recordingIndex + 1} audio...`);
          
          // Play the audio for this recording using mobile-friendly method with volume boost
          try {
            // Apply a volume boost of 8.0 to compensate for the automatic volume reduction during recording
            await playMobileAudio(urlToPlay, 8.0);
            console.log(`Recording ${recordingIndex + 1} audio played successfully with volume boost`);
          } catch (error) {
            console.error("Mobile audio playback failed, falling back to standard method:", error);
            // Fallback to standard method with maximum volume
            await playAudio(urlToPlay, 1.0);
          }
        }
      }
    } catch (err) {
      console.error('Failed to play audio:', err);
    }
  }
  
  // Start recording with a specific index (used by nextRecording)
  const startRecordingWithIndex = async (recordingIndex: number, skipCountdown = false) => {
    // Run countdown unless skipped
    if (!skipCountdown) {
      await runCountdown()
    }

    // Setup media recorder first - this starts the recording
    try {
      let mimeType = "video/webm"

      // Try to find a supported MIME type
      if (MediaRecorder.isTypeSupported("video/mp4")) {
        mimeType = "video/mp4"
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
        mimeType = "video/webm;codecs=vp9"
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
        mimeType = "video/webm;codecs=vp8"
      } else if (MediaRecorder.isTypeSupported("video/webm")) {
        mimeType = "video/webm"
      }

      if (!streamRef.current) {
        throw new Error("No stream available")
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType })
      mediaRecorderRef.current = mediaRecorder

      // MediaRecorder event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      // Store the current recording index for this specific MediaRecorder instance
      // This ensures each recording knows its own index, even if state changes
      const capturedRecordingIndex = recordingIndex;
      
      mediaRecorder.onstop = () => {
        // We'll pass responseId as a parameter when we call startRecording
        const responseId = (streamRef.current as any)?.getResponseId?.() || null
        console.log(`[MediaRecorder.onstop] Recording ${capturedRecordingIndex + 1} stopped`);
        handleRecordingComplete(responseId, capturedRecordingIndex)
        setIsRecording(false)
      }

      // Start recording
      mediaRecorder.start(1000) // Collect data in 1-second chunks
      setIsRecording(true)

      // After recording has started, play the appropriate audio for the specified index
      await playAudioForRecording(recordingIndex)
      
      // Get the current question's time limit if available
      const currentQuestionTimeLimit = textInputsRef.current[recordingIndex]?.timeLimit || timeLimit || "no_limit";
      
      // Handle time limit if enabled
      if (currentQuestionTimeLimit !== "no_limit") {
        // Calculate time in seconds based on the selected time limit
        let timeInSeconds = 60; // Default to 1 minute
        
        if (currentQuestionTimeLimit === "30_seconds") {
          timeInSeconds = 30;
        } else if (currentQuestionTimeLimit === "1_minute") {
          timeInSeconds = 60;
        } else if (currentQuestionTimeLimit === "2_minutes") {
          timeInSeconds = 120;
        } else if (currentQuestionTimeLimit === "3_minutes") {
          timeInSeconds = 180;
        } else if (currentQuestionTimeLimit === "5_minutes") {
          timeInSeconds = 300;
        }
        
        console.log(`[startRecordingWithIndex] Time limit enabled: ${currentQuestionTimeLimit} for recording ${recordingIndex + 1}/${totalRecordings}`);
        console.log(`[startRecordingWithIndex] Setting time limit to ${timeInSeconds} seconds`);
        
        // Set initial time left
        setRecordingTimeLeft(timeInSeconds);
        
        // Clear any existing timer
        if (recordingTimerRef.current) {
          console.log(`[startRecordingWithIndex] Clearing existing timer`);
          clearInterval(recordingTimerRef.current);
        }
        
        // Start countdown timer with slightly longer interval (1050ms instead of 1000ms)
        // to compensate for the timer running slightly fast
        console.log(`[startRecordingWithIndex] Starting countdown timer for ${timeInSeconds} seconds`);
        
        // Capture the current recording index in a closure to ensure we're using the correct value
        // This is critical because the currentRecordingIndex state might change by the time the callback runs
        const capturedRecordingIndex = recordingIndex;
        const isLastRecordingCaptured = capturedRecordingIndex === totalRecordings - 1;
        
        console.log(`[startRecordingWithIndex] Captured recording index: ${capturedRecordingIndex + 1}/${totalRecordings}`);
        console.log(`[startRecordingWithIndex] Is last recording: ${isLastRecordingCaptured}`);
        
        recordingTimerRef.current = setInterval(() => {
          setRecordingTimeLeft(prev => {
            if (prev === null) {
              console.log(`[timerCallback] Timer value is null, stopping timer`);
              if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
              }
              return null;
            }
            
            if (prev <= 1) {
              // Time's up - stop the recording and clear the interval
              console.log(`[timerCallback] Time's up! Recording ${capturedRecordingIndex + 1}/${totalRecordings} complete`);
              console.log(`[timerCallback] Is last recording (captured): ${isLastRecordingCaptured}`);
              
              if (recordingTimerRef.current) {
                console.log(`[timerCallback] Clearing timer interval`);
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
              }
              
              if (isLastRecordingCaptured) {
                // If this is the last recording, call completeSession instead of nextRecording
                console.log(`[timerCallback] This is the last recording, calling completeSession() instead of nextRecording()`);
                completeSession();
              } else {
                // Otherwise, move to the next recording
                console.log(`[timerCallback] Calling nextRecording() due to time limit expiration`);
                nextRecording();
              }
              return null;
            }
            
            // Log every 5 seconds for less verbose output
            if (prev % 5 === 0) {
              console.log(`[timerCallback] Time left: ${prev} seconds (Recording ${capturedRecordingIndex + 1}/${totalRecordings})`);
            }
            
            return prev - 1;
          });
        }, 1050); // Increased from 1000ms to 1050ms to slow down the timer slightly
      }
      
    } catch (err) {
      console.error("MediaRecorder error:", err)
      alert("Failed to start recording. Please try again. Error: " + (err as Error).message)
    }
  }
  
  const startRecording = async (skipCountdown = false) => {
    // Reset if starting a new session
    if (isSessionComplete) {
      setCurrentRecordingIndex(0)
      currentRecordingIndexRef.current = 0 // Also reset the ref
      setIsSessionComplete(false)
      isFirstRecordingRef.current = true // Reset first recording flag
    }
    
    // Use the current recording index from ref for reliability
    await startRecordingWithIndex(currentRecordingIndexRef.current, skipCountdown)
  }

  const stopRecording = () => {
    console.log(`[stopRecording] Stopping recording at index: ${currentRecordingIndexRef.current}`);
    
    // Clear the recording timer if it exists
    if (recordingTimerRef.current) {
      console.log(`[stopRecording] Clearing timer interval`);
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
      setRecordingTimeLeft(null)
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      console.log(`[stopRecording] Stopping MediaRecorder`);
      mediaRecorderRef.current.stop()
    } else {
      console.log(`[stopRecording] MediaRecorder already inactive or null`);
    }
  }
  
  const nextRecording = async () => {
    // Use the ref value for reliable tracking
    const currentIndex = currentRecordingIndexRef.current;
    console.log(`[nextRecording] Starting - Current index (from ref): ${currentIndex}, Total recordings: ${totalRecordings}`);
    
    // Stop the current recording
    stopRecording()
    
    // Move to the next recording index
    const nextIndex = currentIndex + 1
    console.log(`[nextRecording] Incremented to index: ${nextIndex}`);
    
    // Update both the state and ref
    setCurrentRecordingIndex(nextIndex)
    currentRecordingIndexRef.current = nextIndex;
    
    // Check if we've reached the end of the session
    if (nextIndex >= totalRecordings) {
      console.log(`[nextRecording] End of session reached (index ${nextIndex} >= total ${totalRecordings})`);
      console.log(`[nextRecording] Setting isSessionComplete to true and returning early`);
      
      // Wait a bit to ensure the current recording is processed before marking complete
      setTimeout(() => {
        setIsSessionComplete(true)
      }, 1000)
      return; // Early return to prevent starting another recording when session is complete
    } else {
      console.log(`[nextRecording] More recordings to go (index ${nextIndex} < total ${totalRecordings})`);
      
      // Start the next recording with a small delay to ensure the previous one is processed
      setTimeout(() => {
        console.log(`[nextRecording] Starting recording at index: ${nextIndex}`);
        startRecordingWithIndex(nextIndex, false) // Start with countdown and specify index
      }, 500)
    }
  }
  
  const completeSession = () => {
    console.log(`[completeSession] Called - Current index: ${currentRecordingIndexRef.current}, Total recordings: ${totalRecordings}`);
    stopRecording()
    
    console.log(`[completeSession] Setting isSessionComplete to true`);
    // Wait a bit to ensure the current recording is processed before marking complete
    setTimeout(() => {
      setIsSessionComplete(true)
    }, 1000)
  }

  // Function to submit all recordings to the database
  const submitRecordings = async (responseId: string | null) => {
    if (!responseId) {
      return false
    }
    
    try {
      // Wait for all pending uploads to complete with a timeout
      console.log(`[submitRecordings] Waiting for ${pendingUploadsRef.current.length} pending uploads to complete...`)
      if (pendingUploadsRef.current.length > 0) {
        try {
          // Add a timeout to avoid waiting forever
          const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Upload timeout')), 30000)
          );
          
          // Race between all uploads completing and timeout
          await Promise.race([
            Promise.all(pendingUploadsRef.current),
            timeout
          ]);
          
          console.log('[submitRecordings] All uploads completed')
        } catch (error) {
          console.warn('[submitRecordings] Upload timeout or error occurred:', error);
          console.log('[submitRecordings] Continuing with available recordings...');
        }
      }
      
      // Check if we have any recordings to submit
      if (recordingsRef.current.length === 0) {
        console.warn('No recordings to submit')
        return false
      }
      
      // We want to keep all recordings, so we'll just ensure there are no exact duplicates
      // by videoKey (if available)
      const uniqueRecordings = recordingsRef.current.reduce((acc: any[], rec) => {
        // If this recording has a videoKey, check if we already have it in our result array
        if (rec.videoKey) {
          const exists = acc.some(existing => existing.videoKey === rec.videoKey);
          if (!exists) {
            acc.push(rec);
          }
        } else {
          // If no videoKey, always add it
          acc.push(rec);
        }
        return acc;
      }, []);
      
      // Log the original recordings array for debugging
      console.log(`[submitRecordings] Original recordings array (${recordingsRef.current.length} items):`)
      recordingsRef.current.forEach((rec, i) => {
        console.log(`[submitRecordings] Original Recording ${i + 1}: questionId=${rec.questionId}, recordingIndex=${rec.recordingIndex}, pending=${rec.pending}, failed=${rec.uploadFailed || false}`)
      })
      
      // Filter out recordings that failed to upload
      const validRecordings = uniqueRecordings.filter(rec => {
        // Must have a questionId and not be marked as failed
        const isValid = rec.questionId && !rec.uploadFailed;
        if (!isValid) {
          console.warn(`[submitRecordings] Skipping invalid recording: questionId=${rec.questionId}, failed=${rec.uploadFailed || false}`);
        }
        return isValid;
      });
      
      console.log(`[submitRecordings] Submitting ${validRecordings.length} valid recordings to the database:`)
      validRecordings.forEach((rec, i) => {
        console.log(`[submitRecordings] Final Recording ${i + 1}: questionId=${rec.questionId}, recordingIndex=${rec.recordingIndex}`)
      })
      
      // Submit only valid recordings to the API with retry mechanism
      let retries = 3;
      let success = false;
      let lastError = null;
      
      while (retries > 0 && !success) {
        try {
          console.log(`[submitRecordings] Submitting recordings to API (retries left: ${retries})`);
          
          const response = await fetch('/api/snipe/response', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              responseId,
              recordings: validRecordings,
              status: 'completed'
            }),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} ${errorText}`);
          }
          
          success = true;
          console.log('[submitRecordings] Successfully submitted recordings to API');
        } catch (error) {
          lastError = error;
          console.warn(`[submitRecordings] Error submitting recordings (retries left: ${retries}):`, error);
          retries--;
          
          if (retries > 0) {
            // Wait before retrying (exponential backoff)
            const delay = (3 - retries) * 1000;
            console.log(`[submitRecordings] Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      if (!success) {
        console.error('[submitRecordings] Failed to submit recordings after multiple attempts');
        throw lastError || new Error('Failed to submit recordings');
      }
      
      // Clear pending uploads after successful submission
      pendingUploadsRef.current = []
      
      return true
    } catch (error) {
      console.error('Error submitting recordings:', error)
      return false
    }
  }

  return {
    isRecording,
    isCountingDown,
    countdown,
    currentRecordingIndex,
    totalRecordings,
    isLastRecording: currentRecordingIndexRef.current === totalRecordings - 1,
    isSessionComplete,
    recordingTimeLeft,
    startRecording,
    stopRecording,
    nextRecording,
    completeSession,
    recordings: recordingsRef.current,
    submitRecordings
  }
}
