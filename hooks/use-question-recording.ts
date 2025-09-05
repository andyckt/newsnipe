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
import { mobileLogger, uploadLogger } from "@/lib/debug-logger"
import { getResponseIdFromAllSources } from "@/lib/global-state"
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
  }>>([])
  
  // Track pending uploads
  const pendingUploadsRef = useRef<Promise<any>[]>([])
  
  // Track the next unique recording index to use
  const nextUniqueIndexRef = useRef<number>(0)
  
  // Function to handle recording completion - either upload to S3 or download as fallback
  const handleRecordingComplete = async (responseId: string | null) => {
    if (recordedChunksRef.current.length === 0) {
      mobileLogger.warn("No recorded chunks available");
      return;
    }

    const mediaRecorder = mediaRecorderRef.current
    if (!mediaRecorder) {
      mobileLogger.error("No media recorder available");
      return;
    }

    const mimeType = mediaRecorder.mimeType
    mobileLogger.log("Recording complete", { mimeType, recordingIndex: currentRecordingIndex });
    
    // Create a blob from the recorded chunks
    const blob = new Blob(recordedChunksRef.current, { type: mimeType })
    mobileLogger.log("Created blob", { size: blob.size, type: blob.type });
    
    // Get a unique recording index for this recording
    const uniqueIndex = nextUniqueIndexRef.current++;
    
    // Get the current question ID - ensure it's unique by appending uniqueIndex
    let questionId = textInputsRef.current.length > currentRecordingIndex 
      ? textInputsRef.current[currentRecordingIndex].id 
      : `question-${currentRecordingIndex + 1}`
      
    // Ensure questionId is unique by appending the uniqueIndex
    questionId = `${questionId}-${uniqueIndex}`
    
    // Check if we're on a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    mobileLogger.log("Device detection", { isMobile, userAgent: navigator.userAgent });
      
    // If we have a responseId, try to upload to S3
    if (responseId) {
      mobileLogger.log("Starting upload process", { responseId, questionId, uniqueIndex });
      
      // Create a promise for this upload and add it to pending uploads
      const uploadPromise = (async () => {
        try {
          // For mobile devices, use the alternative upload method directly
          if (isMobile) {
            mobileLogger.log(`Mobile device detected, using direct upload for recording ${currentRecordingIndex + 1}`);
            uploadLogger.start({ recordingIndex: currentRecordingIndex, questionId, blobSize: blob.size });
            
            // Create a simple FormData with just the video
            const formData = new FormData();
            formData.append('video', blob, 'recording.webm');
            formData.append('responseId', responseId);
            formData.append('questionId', questionId);
            formData.append('recordingIndex', uniqueIndex.toString());
            
            // Directly upload to our API without thumbnail generation
            mobileLogger.log("Sending form data to API", { 
              endpoint: '/api/s3-video-upload',
              hasVideo: !!blob,
              videoSize: blob.size,
              responseId,
              questionId,
              recordingIndex: uniqueIndex
            });
            
            const response = await fetch('/api/s3-video-upload', {
              method: 'POST',
              body: formData,
            });
            
            if (!response.ok) {
              const errorText = await response.text().catch(() => "Could not read error response");
              mobileLogger.error(`Upload failed with status ${response.status}`, { errorText });
              throw new Error(`Upload failed: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            mobileLogger.log("Upload response received", { 
              status: response.status,
              hasVideoKey: !!data.videoKey,
              hasThumbnailKey: !!data.thumbnailKey
            });
            
            // Store the recording metadata
            recordingsRef.current.push({
              questionId,
              recordingIndex: uniqueIndex,
              videoKey: data.videoKey,
              videoUrl: data.videoUrl,
              thumbnailKey: data.thumbnailKey,
              thumbnailUrl: data.thumbnailUrl,
              duration: blob.size > 0 ? 0 : undefined
            });
            
            uploadLogger.complete({ 
              recordingIndex: currentRecordingIndex,
              videoKey: data.videoKey,
              thumbnailKey: data.thumbnailKey
            });
            
            return { success: true, recordingIndex: currentRecordingIndex };
          } else {
            // For desktop, use the normal upload method with client-side thumbnail generation
            uploadLogger.start({ recordingIndex: currentRecordingIndex, questionId, blobSize: blob.size });
            const { uploadVideoRecording } = await import('@/lib/api-service');
            
            // Upload the video and get the URLs and keys
            const { videoKey, videoUrl, thumbnailKey, thumbnailUrl } = await uploadVideoRecording(
              blob,
              responseId,
              questionId,
              currentRecordingIndex
            );
            
            uploadLogger.complete({ 
              recordingIndex: currentRecordingIndex,
              videoKey,
              thumbnailKey
            });
            
            // Store the recording metadata
            recordingsRef.current.push({
              questionId,
              recordingIndex: uniqueIndex, // Use uniqueIndex instead of currentRecordingIndex
              videoKey,
              videoUrl,
              thumbnailKey,
              thumbnailUrl,
              duration: blob.size > 0 ? 0 : undefined // We don't know the duration yet
            });
            
            return { success: true, recordingIndex: currentRecordingIndex };
          }
        } catch (error) {
          uploadLogger.fail({ 
            recordingIndex: currentRecordingIndex,
            error: error instanceof Error ? error.message : String(error)
          });
          
          // Fall back to downloading the file
          downloadRecordingFallback(blob, questionId, uniqueIndex);
          return { success: false, recordingIndex: currentRecordingIndex };
        }
      })();
      
      // Add to pending uploads
      pendingUploadsRef.current.push(uploadPromise);
    } else {
      // No responseId, so fall back to downloading
      mobileLogger.warn("No responseId available, falling back to download", { questionId });
      downloadRecordingFallback(blob, questionId, uniqueIndex);
    }
    
    // Clear chunks for next recording
    recordedChunksRef.current = []
  }
  
  // Fallback function when S3 upload fails - try again with a simpler approach
  const downloadRecordingFallback = (blob: Blob, questionId: string, uniqueIndex: number) => {
    // For mobile devices, try a simpler upload approach first
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      console.log("Mobile device detected, trying alternative upload method");
      
      // Try a simpler upload approach for mobile
      tryAlternativeUpload(blob, questionId, uniqueIndex).catch(error => {
        console.error("Alternative upload failed:", error);
        // If that fails too, then fall back to download
        downloadToDevice(blob, questionId, uniqueIndex);
      });
    } else {
      // For desktop, just download
      downloadToDevice(blob, questionId, uniqueIndex);
    }
  }
  
  // Function to try an alternative upload approach for mobile devices
  const tryAlternativeUpload = async (blob: Blob, questionId: string, uniqueIndex: number) => {
    // Get the responseId from all possible sources
    let currentResponseId = (streamRef.current as any)?.getResponseId?.();
    mobileLogger.log("Initial responseId check from stream:", { hasResponseId: !!currentResponseId });
    
    // If responseId is not available in the stream, try our global state helper
    if (!currentResponseId) {
      currentResponseId = getResponseIdFromAllSources();
      if (currentResponseId) {
        mobileLogger.log("Using responseId from global state:", currentResponseId);
      }
    }
    
    if (!currentResponseId) {
      mobileLogger.error("No responseId available for alternative upload");
      throw new Error("No responseId available");
    }
    
    try {
      mobileLogger.log("Attempting alternative upload", {
        blobSize: blob.size,
        blobType: blob.type,
        questionId,
        uniqueIndex,
        responseId: currentResponseId
      });
      
      // Log the blob details
      mobileLogger.log("Video blob details", {
        type: blob.type,
        size: blob.size,
        extension: blob.type.includes('mp4') ? 'mp4' : 'webm'
      });
      
      uploadLogger.start({ method: "direct", recordingIndex: currentRecordingIndex });
      
      // For large files (over 3MB), use direct upload to S3
      if (blob.size > 3 * 1024 * 1024) {
        mobileLogger.log("File is large, using direct upload to S3");
        
        try {
          // Import the directUpload function and createThumbnail
          const directUploadModule = await import('@/lib/direct-upload');
          const s3ServiceModule = await import('@/lib/s3-service');
          
          const directUpload = directUploadModule.directUpload;
          const createThumbnail = s3ServiceModule.createThumbnail;
          
          // Create a thumbnail for the video
          let thumbnailBlob = null;
          try {
            thumbnailBlob = await createThumbnail(blob);
            mobileLogger.log("Thumbnail created", { size: thumbnailBlob.size });
          } catch (thumbnailError) {
            mobileLogger.error("Failed to create thumbnail", { error: String(thumbnailError) });
            // Continue without thumbnail
          }
          
          // Upload directly to S3
          const { videoKey, thumbnailKey } = await directUpload(
            blob,
            thumbnailBlob,
            currentResponseId,
            questionId,
            uniqueIndex
          );
          
          mobileLogger.log("Direct upload successful", { videoKey, thumbnailKey });
          
          // Store the recording metadata
          recordingsRef.current.push({
            questionId,
            recordingIndex: uniqueIndex,
            videoKey,
            thumbnailKey
          });
          
          uploadLogger.complete({
            method: "direct",
            recordingIndex: currentRecordingIndex,
            videoKey,
            thumbnailKey
          });
          
          mobileLogger.log(`Mobile recording ${currentRecordingIndex + 1} uploaded via direct method`);
          return true;
        } catch (directUploadError) {
          mobileLogger.error("Direct upload failed", { 
            error: directUploadError instanceof Error ? directUploadError.message : String(directUploadError) 
          });
          // Fall through to try the API method
        }
      }
      
      // For smaller files or if direct upload failed, try the API method
      mobileLogger.log("Using API upload method");
      
      // Create a simple FormData with just the video
      const formData = new FormData();
      // Use the correct extension based on the mime type
      const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
      formData.append('video', blob, `recording.${extension}`);
      formData.append('responseId', currentResponseId);
      formData.append('questionId', questionId);
      formData.append('recordingIndex', uniqueIndex.toString());
      
      mobileLogger.log("FormData created for API upload", {
        hasVideo: true,
        responseId: currentResponseId,
        questionId,
        recordingIndex: uniqueIndex
      });
      
      let responseData;
      let responseObj;
      
      try {
        mobileLogger.log("Starting fetch request to /api/s3-video-upload");
        responseObj = await fetch('/api/s3-video-upload', {
          method: 'POST',
          body: formData,
        });
        
        mobileLogger.log("Fetch response received", { status: responseObj.status });
        
        if (!responseObj.ok) {
          const errorText = await responseObj.text().catch(() => "Could not read error response");
          mobileLogger.error(`API upload failed: ${responseObj.status}`, { errorText });
          throw new Error(`Upload failed: ${responseObj.status} - ${errorText}`);
        }
        
        mobileLogger.log("Response is OK, parsing JSON");
        responseData = await responseObj.json();
      } catch (fetchError) {
        mobileLogger.error("Fetch operation failed", { 
          error: fetchError instanceof Error ? fetchError.message : String(fetchError),
          stack: fetchError instanceof Error ? fetchError.stack : undefined
        });
        throw fetchError;
      }
      
      mobileLogger.log("API upload response", {
        status: responseObj.status,
        hasVideoKey: !!responseData.videoKey,
        hasThumbnailKey: !!responseData.thumbnailKey
      });
      
      // Store the recording metadata
      recordingsRef.current.push({
        questionId,
        recordingIndex: uniqueIndex,
        videoKey: responseData.videoKey,
        videoUrl: responseData.videoUrl,
        thumbnailKey: responseData.thumbnailKey,
        thumbnailUrl: responseData.thumbnailUrl,
      });
      
      uploadLogger.complete({
        method: "api",
        recordingIndex: currentRecordingIndex,
        videoKey: responseData.videoKey,
        thumbnailKey: responseData.thumbnailKey
      });
      
      mobileLogger.log(`Mobile recording ${currentRecordingIndex + 1} uploaded via API method`);
      return true;
    } catch (error) {
      uploadLogger.fail({
        method: "alternative",
        recordingIndex: currentRecordingIndex,
        error: error instanceof Error ? error.message : String(error)
      });
      
      mobileLogger.error("Alternative upload failed", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }
  
  // Last resort - download to device
  const downloadToDevice = (blob: Blob, questionId: string, uniqueIndex: number) => {
    // Determine the correct file extension based on the mime type
    const fileExtension = blob.type.includes('mp4') ? 'mp4' : 'webm';
    
    mobileLogger.warn("Falling back to device download", {
      recordingIndex: currentRecordingIndex,
      questionId,
      uniqueIndex,
      blobSize: blob.size,
      blobType: blob.type,
      fileExtension
    });
    
    try {
      // Create a download link for the recorded video
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `question-recording-${currentRecordingIndex + 1}.${fileExtension}`
      document.body.appendChild(a)
      a.click()
  
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }, 100)
      
      mobileLogger.log("Download initiated", {
        filename: `question-recording-${currentRecordingIndex + 1}.${fileExtension}`
      });
    } catch (error) {
      mobileLogger.error("Error during download", {
        error: error instanceof Error ? error.message : String(error)
      });
    }
    
    // Store minimal recording metadata
    recordingsRef.current.push({
      questionId,
      recordingIndex: uniqueIndex // Use uniqueIndex instead of currentRecordingIndex
    });
    
    mobileLogger.log("Added minimal recording metadata", {
      questionId,
      recordingIndex: uniqueIndex
    });
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

      mediaRecorder.onstop = () => {
        // We'll pass responseId as a parameter when we call startRecording
        const responseId = (streamRef.current as any)?.getResponseId?.() || null
        handleRecordingComplete(responseId)
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
        
        // Set initial time left
        setRecordingTimeLeft(timeInSeconds);
        
        // Clear any existing timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
        
        // Start countdown timer with slightly longer interval (1050ms instead of 1000ms)
        // to compensate for the timer running slightly fast
        recordingTimerRef.current = setInterval(() => {
          setRecordingTimeLeft(prev => {
            if (prev === null || prev <= 1) {
              // Time's up - stop the recording and clear the interval
              if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
              }
              
              // Automatically move to the next recording
              nextRecording();
              return null;
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
      setIsSessionComplete(false)
      isFirstRecordingRef.current = true // Reset first recording flag
    }
    
    // Use the current recording index
    await startRecordingWithIndex(currentRecordingIndex, skipCountdown)
  }

  const stopRecording = () => {
    // Clear the recording timer if it exists
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
      setRecordingTimeLeft(null)
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
  }
  
  const nextRecording = async () => {
    // Stop the current recording
    stopRecording()
    
    // Move to the next recording index
    const nextIndex = currentRecordingIndex + 1
    
    // Update the current recording index state
    setCurrentRecordingIndex(nextIndex)
    
    // Check if we've reached the end of the session
    if (nextIndex >= totalRecordings) {
      // Wait a bit to ensure the current recording is processed before marking complete
      setTimeout(() => {
        setIsSessionComplete(true)
      }, 1000)
    } else {
      // Start the next recording with a small delay to ensure the previous one is processed
      setTimeout(() => {
        startRecordingWithIndex(nextIndex, false) // Start with countdown and specify index
      }, 500)
    }
  }
  
  const completeSession = () => {
    stopRecording()
    
    // Wait a bit to ensure the current recording is processed before marking complete
    setTimeout(() => {
      setIsSessionComplete(true)
    }, 1000)
  }

  // Function to submit all recordings to the database
  const submitRecordings = async (responseId: string | null) => {
    if (!responseId) {
      mobileLogger.error("No responseId provided for submitRecordings");
      return false;
    }
    
    try {
      // Wait for all pending uploads to complete
      mobileLogger.log(`Waiting for ${pendingUploadsRef.current.length} pending uploads to complete...`, {
        pendingUploads: pendingUploadsRef.current.length
      });
      
      if (pendingUploadsRef.current.length > 0) {
        await Promise.all(pendingUploadsRef.current);
        mobileLogger.log('All uploads completed');
      }
      
      // Check if we have any recordings to submit
      if (recordingsRef.current.length === 0) {
        mobileLogger.warn('No recordings to submit');
        return false;
      }
      
      // Log the recordings that will be submitted
      mobileLogger.log(`Submitting ${recordingsRef.current.length} recordings to the database:`, {
        responseId,
        recordingsCount: recordingsRef.current.length
      });
      
      recordingsRef.current.forEach((recording, index) => {
        mobileLogger.log(`Recording ${index + 1} details:`, {
          questionId: recording.questionId,
          recordingIndex: recording.recordingIndex,
          hasVideoKey: !!recording.videoKey,
          hasThumbnailKey: !!recording.thumbnailKey
        });
      });
      
      // Submit all recordings to the API
      const requestBody = {
        responseId,
        recordings: recordingsRef.current,
        status: 'completed'
      };
      
      mobileLogger.log("Sending PUT request to /api/snipe/response", {
        method: 'PUT',
        responseId,
        recordingsCount: recordingsRef.current.length
      });
      
      const response = await fetch('/api/snipe/response', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Could not read error response");
        mobileLogger.error(`Failed to submit recordings: ${response.status}`, { errorText });
        throw new Error(`Failed to submit recordings: ${response.status} - ${errorText}`);
      }
      
      const responseData = await response.json().catch(() => ({}));
      mobileLogger.log("Submission response received", { 
        status: response.status,
        data: responseData
      });
      
      // Clear pending uploads after successful submission
      pendingUploadsRef.current = [];
      
      return true;
    } catch (error) {
      mobileLogger.error('Error submitting recordings', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        responseId
      });
      return false;
    }
  }

  return {
    isRecording,
    isCountingDown,
    countdown,
    currentRecordingIndex,
    totalRecordings,
    isLastRecording: currentRecordingIndex === totalRecordings - 1,
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
