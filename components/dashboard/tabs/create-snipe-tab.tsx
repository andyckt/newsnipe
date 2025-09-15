"use client"

import { useState, useEffect } from "react"
import { CameraView } from "@/components/camera-view"
import { CameraControls } from "@/components/camera-controls"
import { SettingsScreen } from "@/components/settings-screen"
import { AudioLanguage, TextInput, TimeLimit } from "@/components/question-tab"
import { useCamera } from "@/hooks/use-camera"
import { useQuestionRecording } from "@/hooks/use-question-recording"
import { useConversationRecording } from "@/hooks/use-conversation-recording"
import { Button } from "@/components/ui/button"
import { unlockAudio } from "@/lib/audio"
import { initAudioContext } from "@/lib/mobile-audio"
import PersonalDetailsCollector, { PersonalDetailField, PersonalDetailsConfig, PersonalDetailsResponse } from "@/components/personal-details-collector"

// App states
type AppState = "settings" | "personal_details" | "recording" | "completed"

export default function CameraRecorder() {
  // Check for URL parameters on initial load
  const [initialParamsChecked, setInitialParamsChecked] = useState(false)
  
  // State management
  const [appState, setAppState] = useState<AppState>("settings")
  const [title, setTitle] = useState<string>("Untitled Snipe")
  const [numRecordings, setNumRecordings] = useState(3)
  const [audioLanguage, setAudioLanguage] = useState<AudioLanguage>("english")
  const [textInputs, setTextInputs] = useState<TextInput[]>([{ id: "default", value: "" }])
  const [mode, setMode] = useState<"question" | "conversation">("question")
  const [timeLimit, setTimeLimit] = useState<TimeLimit>("no_limit")
  
  // Personal details configuration and responses
  const [personalDetailsConfig, setPersonalDetailsConfig] = useState<PersonalDetailsConfig>({
    includePersonalDetails: true,
    personalFields: [
      {
        id: crypto.randomUUID(),
        label: "What is your full name?",
        type: "text",
        required: true
      },
      {
        id: crypto.randomUUID(),
        label: "What is your email address?",
        type: "text",
        required: true
      },
      {
        id: crypto.randomUUID(),
        label: "What is your phone number?",
        type: "text",
        required: false
      },
      {
        id: crypto.randomUUID(),
        label: "What is your current role?",
        type: "dropdown",
        required: true,
        dropdownOptions: ["Student", "Professional", "Job Seeker", "Other"],
        allowMultiple: false
      }
    ]
  })
  const [personalDetailsResponses, setPersonalDetailsResponses] = useState<PersonalDetailsResponse>({})
  
  // Parse URL parameters on initial load
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialParamsChecked) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const paramsData = urlParams.get('data');
        
        if (paramsData) {
          // Decode and parse the data
          const decodedData = decodeURIComponent(paramsData);
          const parsedData = JSON.parse(decodedData);
          
          // Apply the settings from URL parameters
          if (parsedData.numRecordings) setNumRecordings(parsedData.numRecordings);
          if (parsedData.audioLanguage) setAudioLanguage(parsedData.audioLanguage);
          
          // Handle text inputs and their audio URLs/keys
          if (parsedData.textInputs) {
            // Make sure we refresh presigned URLs if needed
            const refreshedTextInputs = [...parsedData.textInputs];
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
          
          if (parsedData.mode) setMode(parsedData.mode);
          if (parsedData.timeLimit) setTimeLimit(parsedData.timeLimit);
          if (parsedData.personalDetailsConfig) setPersonalDetailsConfig(parsedData.personalDetailsConfig);
          
          // Set initial app state based on URL parameters
          setAppState(parsedData.personalDetailsConfig?.includePersonalDetails ? "personal_details" : "recording");
        }
      } catch (error) {
        console.error("Error parsing URL parameters:", error);
      }
      
      setInitialParamsChecked(true);
    }
  }, [initialParamsChecked]);
  
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
  
  const { videoRef, streamRef, hasPermission, showPermissionButton, requestPermissions, stopCamera } = useCamera()

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
    completeSession
  } = mode === "question" ? questionRecording : conversationRecording

  // State to store the created shortId
  const [createdShortId, setCreatedShortId] = useState<string | null>(null);

  // Handle launching the recorder with selected settings
  const handleLaunch = async (selectedNumRecordings: number, selectedLanguage: AudioLanguage, selectedTextInputs: TextInput[], selectedMode: "question" | "conversation", selectedTimeLimit: TimeLimit) => {
    // Create a data object with all the settings
    const launchData = {
      title: title,
      numRecordings: selectedTextInputs.length,
      audioLanguage: selectedLanguage,
      textInputs: selectedTextInputs,
      mode: selectedMode,
      timeLimit: selectedTimeLimit,
      personalDetailsConfig: personalDetailsConfig
    };
    
    try {
      // Save the configuration to the database
      const response = await fetch('/api/snipe/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(launchData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }
      
      const { shortId } = await response.json();
      
      // Store the shortId in state
      setCreatedShortId(shortId);
      
      // Transition to completed state
      setAppState("completed");
    } catch (error) {
      console.error('Error saving snipe configuration:', error);
      alert('Failed to create snipe link. Please try again.');
    }
  }
  
  // Handle completion of personal details
  const handlePersonalDetailsComplete = (responses: PersonalDetailsResponse) => {
    setPersonalDetailsResponses(responses)
    setAppState("recording")
  }
  
  // Handle skipping personal details
  const handlePersonalDetailsSkip = () => {
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

  // Handle session completion
  if (isSessionComplete) {
    // Stop the camera and transition to completed state
    setTimeout(() => {
      stopCamera() // Stop the camera when recordings are complete
      setAppState("completed")
    }, 100)
  }

  // Render based on current app state
  if (appState === "settings") {
    return (
      <div className="flex flex-col h-full w-full space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Create New Snipe</h2>
        </div>
        
        <div className="rounded-3xl border bg-white p-6">
          <SettingsScreen 
            onLaunch={handleLaunch} 
            personalDetailsConfig={personalDetailsConfig}
            onPersonalDetailsConfigChange={setPersonalDetailsConfig}
            title={title}
            onTitleChange={setTitle}
          />
        </div>
      </div>
    )
  }
  
  if (appState === "personal_details") {
    return (
      <div className="flex flex-col h-full w-full space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Personal Details Setup</h2>
        </div>
        
        <div className="rounded-3xl border bg-white p-6">
          <PersonalDetailsCollector 
            config={personalDetailsConfig}
            onComplete={handlePersonalDetailsComplete}
            onSkip={handlePersonalDetailsSkip}
          />
        </div>
      </div>
    )
  }
  
  if (appState === "completed") {
    return (
      <div className="flex flex-col h-full w-full space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Snipe Created</h2>
        </div>
        
        <div className="rounded-3xl border bg-white p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">Snipe Created Successfully!</h1>
          <p className="text-lg mb-6">
            Your Snipe with {numRecordings} questions has been created.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg w-full max-w-lg mb-6">
            <p className="text-sm text-gray-500 mb-2">Share this link with participants:</p>
            <div className="flex">
              <input 
                type="text" 
                readOnly 
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/snipe/${createdShortId}`}
                className="flex-1 p-2 border border-gray-300 rounded-l-md bg-white"
              />
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded-r-md"
                onClick={() => {
                  navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/snipe/${createdShortId}`);
                  alert('Link copied to clipboard!');
                }}
              >
                Copy
              </button>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button
              onClick={() => window.open(`${typeof window !== 'undefined' ? window.location.origin : ''}/snipe/${createdShortId}`, '_blank')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full"
            >
              Open in New Tab
            </Button>
            
            <Button
              onClick={() => setAppState("settings")}
              variant="outline"
              className="px-6 py-2 rounded-full"
            >
              Create Another
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Recording state
  return (
    <div className="flex flex-col h-full w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Recording Session</h2>
      </div>
      
      <div className="rounded-3xl border bg-black overflow-hidden">
        <div className="aspect-video relative">
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
    </div>
  )
}