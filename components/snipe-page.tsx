"use client"

import { useState, useEffect } from "react"
import { CameraView } from "@/components/camera-view"
import { CameraControls } from "@/components/camera-controls"
import { AudioLanguage, TextInput, TimeLimit } from "@/components/question-tab"
import { useCamera } from "@/hooks/use-camera"
import { useQuestionRecording } from "@/hooks/use-question-recording"
import { useConversationRecording } from "@/hooks/use-conversation-recording"
import { Button } from "@/components/ui/button"
import { unlockAudio } from "@/lib/audio"
import { initAudioContext } from "@/lib/mobile-audio"
import PersonalDetailsCollector, { PersonalDetailField, PersonalDetailsConfig, PersonalDetailsResponse } from "@/components/personal-details-collector"

// App states
type AppState = "loading" | "personal_details" | "recording" | "processing" | "completed" | "error"

interface SnipePageProps {
  shortId?: string // For database mode
  urlData?: string // For URL parameter mode (legacy)
}

export function SnipePage({ shortId, urlData }: SnipePageProps) {
  // State management
  const [appState, setAppState] = useState<AppState>("loading")
  const [numRecordings, setNumRecordings] = useState(3)
  const [audioLanguage, setAudioLanguage] = useState<AudioLanguage>("english")
  const [textInputs, setTextInputs] = useState<TextInput[]>([{ id: "default", value: "" }])
  const [mode, setMode] = useState<"question" | "conversation">("question")
  const [timeLimit, setTimeLimit] = useState<TimeLimit>("no_limit")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [responseId, setResponseIdState] = useState<string | null>(null)
  
  // Personal details configuration and responses
  const [personalDetailsConfig, setPersonalDetailsConfig] = useState<PersonalDetailsConfig>({
    includePersonalDetails: false,
    personalFields: []
  })
  const [personalDetailsResponses, setPersonalDetailsResponses] = useState<PersonalDetailsResponse>({})
  
  // Load configuration data on initial load
  useEffect(() => {
    async function loadConfigData() {
      try {
        let configData;
        
        if (shortId) {
          // Fetch configuration from database using shortId
          const response = await fetch(`/api/snipe/${shortId}`);
          
          if (response.status === 404) {
            throw new Error('Snipe not found. It may have been deleted by the creator.');
          } else if (!response.ok) {
            throw new Error('Failed to load configuration data');
          }
          
          configData = await response.json();
        } else if (urlData) {
          // Legacy mode: parse from URL parameter
          const decodedData = decodeURIComponent(urlData);
          configData = JSON.parse(decodedData);
        } else {
          // No configuration data available
          throw new Error('No configuration data available');
        }
        
        // Apply the settings from the configuration
        if (configData.numRecordings) setNumRecordings(configData.numRecordings);
        if (configData.audioLanguage) setAudioLanguage(configData.audioLanguage);
        
        // Handle text inputs and their audio URLs/keys
        if (configData.textInputs) {
          // Make sure we refresh presigned URLs if needed
          const refreshedTextInputs = [...configData.textInputs];
          setTextInputs(refreshedTextInputs);
          
          // Preload audio for better performance
          refreshedTextInputs.forEach(input => {
            if (input.audioUrl) {
              import('@/lib/mobile-audio').then(({ preloadMobileAudio }) => {
                preloadMobileAudio(input.audioUrl!).catch(err => 
                  console.warn(`Failed to preload audio: ${err}`)
                );
              });
            }
          });
        }
        
        if (configData.mode) setMode(configData.mode);
        if (configData.timeLimit) setTimeLimit(configData.timeLimit);
        if (configData.personalDetailsConfig) setPersonalDetailsConfig(configData.personalDetailsConfig);
        
        // Set initial app state based on configuration
        setAppState(configData.personalDetailsConfig?.includePersonalDetails ? "personal_details" : "recording");
      } catch (error: any) {
        console.error("Error loading configuration data:", error);
        // Use the specific error message if available
        setErrorMessage(error.message || "Failed to load recording configuration. Please try again.");
        setAppState("error");
      }
    }
    
    loadConfigData();
  }, [shortId, urlData]);
  
  // Try to unlock audio on component mount and on any user interaction
  useEffect(() => {
    // Try to unlock audio immediately
    unlockAudio();
    initAudioContext();
    
    // Add event listeners to unlock audio on any user interaction
    const unlockOnUserInteraction = () => {
      unlockAudio();
      initAudioContext();
      console.log("User interaction detected, attempting to unlock audio");
      
      // Create and play a silent sound to unlock audio on iOS
      const silentSound = new Audio("data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
      silentSound.play().catch(err => console.error("Failed to play silent sound:", err));
      
      // Remove event listeners after first interaction
      document.removeEventListener('click', unlockOnUserInteraction);
      document.removeEventListener('touchstart', unlockOnUserInteraction);
      document.removeEventListener('touchend', unlockOnUserInteraction);
    };
    
    document.addEventListener('click', unlockOnUserInteraction);
    document.addEventListener('touchstart', unlockOnUserInteraction);
    document.addEventListener('touchend', unlockOnUserInteraction);
    
    return () => {
      document.removeEventListener('click', unlockOnUserInteraction);
      document.removeEventListener('touchstart', unlockOnUserInteraction);
      document.removeEventListener('touchend', unlockOnUserInteraction);
    };
  }, [])
  
  const { videoRef, streamRef, hasPermission, showPermissionButton, requestPermissions, stopCamera, setResponseId } = useCamera()

  // Use the appropriate recording hook based on the selected mode
  const questionRecording = useQuestionRecording(streamRef, { 
    totalRecordings: numRecordings, 
    audioLanguage,
    textInputs, // Pass the textInputs to the question recording hook
    timeLimit // Pass the time limit setting
  })
  
  const conversationRecording = useConversationRecording(streamRef, { 
    totalRecordings: numRecordings,
    timeLimit: timeLimit
  })
  
  // Select the appropriate recording hook based on mode
  const { 
    isRecording, 
    isCountingDown, 
    countdown, 
    currentRecordingIndex,
    totalRecordings,
    isLastRecording,
    isSessionComplete,
    recordingTimeLeft,
    startRecording, 
    nextRecording,
    completeSession,
    recordings,
    submitRecordings
  } = mode === "question" ? questionRecording : conversationRecording

  // Handle completion of personal details
  const handlePersonalDetailsComplete = (responses: PersonalDetailsResponse, submittedResponseId?: string) => {
    setPersonalDetailsResponses(responses)
    if (submittedResponseId) {
      // Store responseId in state
      setResponseIdState(submittedResponseId)
      
      // Pass the responseId to the camera hook
      setResponseId(submittedResponseId)
      
      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('snipe_response_id', submittedResponseId)
        
        // Also store in window object for easy access
        ;(window as any).snipeResponseId = submittedResponseId
        
        console.log(`ResponseId stored: ${submittedResponseId}`)
      }
    }
    setAppState("recording")
  }

  // Handle starting a recording
  const handleStartRecording = async () => {
    if (!hasPermission) {
      await requestPermissions()
      return
    }
    await startRecording()
  }

  // Flag to track if submission is in progress
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle session completion
  useEffect(() => {
    if (isSessionComplete && !isSubmitting) {
      // First transition to processing state immediately
      setAppState("processing");
      
      // Update the response status to completed if we have a responseId
      const updateResponseStatus = async () => {
        if (responseId) {
          try {
            // Prevent multiple submissions
            setIsSubmitting(true);
            
            // Stop the camera immediately for better user experience
            stopCamera();
            
            // Submit all recordings to the database
            console.log('Submitting recordings to the database...');
            const success = await submitRecordings(responseId);
            
            if (success) {
              console.log('Recordings submitted successfully');
            } else {
              console.warn('Failed to submit recordings, falling back to status update only');
              
              // Fallback: just update the status
              await fetch('/api/snipe/response', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  responseId,
                  status: 'completed'
                }),
              });
            }
            
            console.log('Response marked as completed');
          } catch (error) {
            console.error('Error updating response status:', error);
          } finally {
            // Always transition to completed state, even if there was an error
            setAppState("completed");
          }
        } else {
          // No responseId, just transition to completed state
          setAppState("completed");
        }
      };
      
      updateResponseStatus();
    }
  }, [isSessionComplete, responseId, stopCamera, submitRecordings, isSubmitting]);

  // Loading state
  if (appState === "loading") {
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden bg-white md:bg-gray-100 md:items-center md:justify-center">
        <div className="flex flex-col h-full w-full bg-white md:max-w-sm md:h-screen p-8 items-center justify-center text-center">
          <h1 className="text-3xl font-bold mb-4">Loading Snipe...</h1>
          <p className="text-lg">
            Please wait while we prepare your snipe.
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (appState === "error") {
    const isSnipeNotFound = errorMessage?.includes('Snipe not found');
    
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden bg-white md:bg-gray-100 md:items-center md:justify-center">
        <div className="flex flex-col h-full w-full bg-white md:max-w-sm md:h-screen p-8 items-center justify-center text-center">
          <div className="text-6xl mb-4">{isSnipeNotFound ? '🔍' : '❌'}</div>
          <h1 className="text-3xl font-bold mb-4">{isSnipeNotFound ? 'Snipe Not Found' : 'Error'}</h1>
          <p className="text-lg mb-6">
            {errorMessage || "An error occurred. Please try again."}
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-full"
          >
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  // Personal details state
  if (appState === "personal_details") {
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden bg-white md:bg-gray-100 md:items-center md:justify-center">
        <div className="flex flex-col h-full w-full bg-white md:max-w-sm md:h-screen">
          <PersonalDetailsCollector 
            config={personalDetailsConfig}
            onComplete={handlePersonalDetailsComplete}
            shortId={shortId || ""}
          />
        </div>
      </div>
    )
  }
  
  // Processing state
  if (appState === "processing") {
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden bg-white md:bg-gray-100 md:items-center md:justify-center">
        <div className="flex flex-col h-full w-full bg-white md:max-w-sm md:h-screen p-8 items-center justify-center text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-6"></div>
          <h1 className="text-3xl font-bold mb-4">Processing...</h1>
          <p className="text-lg">
            Your recordings are being processed. This will only take a moment.
          </p>
        </div>
      </div>
    )
  }
  
  // Completed state
  if (appState === "completed") {
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden bg-white md:bg-gray-100 md:items-center md:justify-center relative">
        <div className="flex flex-col h-full w-full bg-white md:max-w-sm md:h-screen p-8 items-center justify-center text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
          <p className="text-lg mb-6">
            All {numRecordings} recordings have been completed successfully.
          </p>
        </div>
        
        {/* Branding */}
        <div className="absolute bottom-4 right-4 text-gray-400 text-base">
          <span style={{ fontFamily: "'Century Gothic', 'CenturyGothic', 'AppleGothic', sans-serif" }}>
            Powered by <span style={{ color: "#1649ff" }}>Snipe</span>
          </span>
        </div>
      </div>
    )
  }

  // Recording state
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white md:bg-gray-100 md:items-center md:justify-center">
      <div className="flex flex-col h-full w-full bg-black md:max-w-sm md:h-screen">
        <CameraView videoRef={videoRef} countdown={countdown} recordingTimeLeft={recordingTimeLeft} />

        <CameraControls
          showPermissionButton={showPermissionButton}
          hasPermission={hasPermission}
          isRecording={isRecording}
          isCountingDown={isCountingDown}
          currentRecordingIndex={currentRecordingIndex}
          totalRecordings={totalRecordings}
          isLastRecording={isLastRecording}
          onRequestPermissions={requestPermissions}
          onStartRecording={handleStartRecording}
          onNextRecording={nextRecording}
          onCompleteSession={completeSession}
        />
      </div>
    </div>
  )
}
