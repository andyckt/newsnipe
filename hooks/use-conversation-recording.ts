"use client"

/**
 * Conversation mode recording hook
 * Derived from the original use-recording.ts file
 * Specialized for conversation mode without audio prompts
 */

import type React from "react"

import { useRef, useState } from "react"
import { TimeLimit } from "@/components/question-tab"

interface RecordingOptions {
  totalRecordings?: number
  audioLanguage?: "english" | "mandarin"
  timeLimit?: TimeLimit
}

export function useConversationRecording(streamRef: React.RefObject<MediaStream | null>, options: RecordingOptions = {}) {
  const { totalRecordings = 1 } = options
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [currentRecordingIndex, setCurrentRecordingIndex] = useState(0)
  const [isSessionComplete, setIsSessionComplete] = useState(false)
  
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
    if (recordedChunksRef.current.length === 0) return

    const mediaRecorder = mediaRecorderRef.current
    if (!mediaRecorder) return

    const mimeType = mediaRecorder.mimeType
    
    // Create a blob from the recorded chunks
    const blob = new Blob(recordedChunksRef.current, { type: mimeType })
    
    // Get a unique recording index for this recording
    const uniqueIndex = nextUniqueIndexRef.current++;
    
    // Generate a question ID for conversation mode - ensure it's unique with uniqueIndex
    const questionId = `conversation-${uniqueIndex}`
      
    // If we have a responseId, try to upload to S3
    if (responseId) {
      // Create a promise for this upload and add it to pending uploads
      const uploadPromise = (async () => {
        try {
          // Import the uploadVideoRecording function
          const { uploadVideoRecording } = await import('@/lib/api-service')
          
          // Upload the video and get the URLs and keys
          const { videoKey, videoUrl, thumbnailKey, thumbnailUrl } = await uploadVideoRecording(
            blob,
            responseId,
            questionId,
            currentRecordingIndex
          )
          
          console.log(`Recording ${currentRecordingIndex + 1} uploaded to S3:`, { videoKey, thumbnailKey })
          
          // Store the recording metadata
          recordingsRef.current.push({
            questionId,
            recordingIndex: uniqueIndex, // Use uniqueIndex instead of currentRecordingIndex
            videoKey,
            videoUrl,
            thumbnailKey,
            thumbnailUrl,
            duration: blob.size > 0 ? 0 : undefined // We don't know the duration yet
          })
          
          return { success: true, recordingIndex: currentRecordingIndex }
        } catch (error) {
          console.error('Error uploading recording to S3:', error)
          // Fall back to downloading the file
          downloadRecordingFallback(blob, questionId, uniqueIndex)
          return { success: false, recordingIndex: currentRecordingIndex }
        }
      })()
      
      // Add to pending uploads
      pendingUploadsRef.current.push(uploadPromise)
    } else {
      // No responseId, so fall back to downloading
      downloadRecordingFallback(blob, questionId, uniqueIndex)
    }
    
    // Clear chunks for next recording
    recordedChunksRef.current = []
  }
  
  // Fallback function to download recording if S3 upload fails
  const downloadRecordingFallback = (blob: Blob, questionId: string, uniqueIndex: number) => {
    const fileExtension = "webm"
    
    // Create a download link for the recorded video
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.style.display = "none"
    a.href = url
    a.download = `conversation-recording-${currentRecordingIndex + 1}.${fileExtension}`
    document.body.appendChild(a)
    a.click()

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 100)
    
    // Store minimal recording metadata
    recordingsRef.current.push({
      questionId,
      recordingIndex: uniqueIndex // Use uniqueIndex instead of currentRecordingIndex
    })
  }

  const startRecording = async (skipCountdown = false) => {
    // Reset if starting a new session
    if (isSessionComplete) {
      setCurrentRecordingIndex(0)
      setIsSessionComplete(false)
    }
    
    // Run countdown unless skipped
    if (!skipCountdown) {
      await runCountdown()
    }

    // Setup media recorder
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

      console.log("Using MIME type:", mimeType)

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
    } catch (err) {
      console.error("MediaRecorder error:", err)
      alert("Failed to start recording. Please try again. Error: " + (err as Error).message)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
  }
  
  const nextRecording = async () => {
    // Stop the current recording
    stopRecording()
    
    // Move to the next recording index
    const nextIndex = currentRecordingIndex + 1
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
        startRecording(false) // Start with countdown
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
      return false
    }
    
    try {
      // Wait for all pending uploads to complete
      console.log(`Waiting for ${pendingUploadsRef.current.length} pending uploads to complete...`)
      if (pendingUploadsRef.current.length > 0) {
        await Promise.all(pendingUploadsRef.current)
        console.log('All uploads completed')
      }
      
      // Check if we have any recordings to submit
      if (recordingsRef.current.length === 0) {
        console.warn('No recordings to submit')
        return false
      }
      
      console.log(`Submitting ${recordingsRef.current.length} recordings to the database:`)
      recordingsRef.current.forEach((rec, i) => {
        console.log(`Recording ${i + 1}: questionId=${rec.questionId}, recordingIndex=${rec.recordingIndex}`)
      })
      
      // Submit the recordings to the API
      const response = await fetch('/api/snipe/response', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responseId,
          recordings: recordingsRef.current,
          status: 'completed'
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit recordings')
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
    isLastRecording: currentRecordingIndex === totalRecordings - 1,
    isSessionComplete,
    recordingTimeLeft: null, // Conversation mode doesn't use time limits
    startRecording,
    stopRecording,
    nextRecording,
    completeSession,
    recordings: recordingsRef.current,
    submitRecordings
  }
}
