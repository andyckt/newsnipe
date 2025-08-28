"use client"

import { useState, useEffect } from "react"
import { CameraView } from "@/components/camera-view"
import { CameraControls } from "@/components/camera-controls"
import { SettingsScreen } from "@/components/settings-screen"
import { QuestionTab, AudioLanguage, TextInput, TimeLimit } from "@/components/question-tab"
import { ConversationTab } from "@/components/conversation-tab"
import { useCamera } from "@/hooks/use-camera"
import { useQuestionRecording } from "@/hooks/use-question-recording"
import { useConversationRecording } from "@/hooks/use-conversation-recording"
import { Button } from "@/components/ui/button"
import { unlockAudio } from "@/lib/audio"
import { initAudioContext } from "@/lib/mobile-audio"
import PersonalDetailsCollector, { PersonalDetailField, PersonalDetailsConfig, PersonalDetailsResponse } from "@/components/personal-details-collector"
import PersonalDetailsSettings from "@/components/personal-details-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Languages, User } from "lucide-react"

// App states
type AppState = "settings" | "personal_details" | "recording" | "completed"

export function LaunchRecorderTab() {
  // State management
  const [appState, setAppState] = useState<AppState>("settings")
  const [numRecordings, setNumRecordings] = useState(3)
  const [audioLanguage, setAudioLanguage] = useState<AudioLanguage>("english")
  const [textInputs, setTextInputs] = useState<TextInput[]>([{ id: "default", value: "" }])
  const [mode, setMode] = useState<"question" | "conversation">("question")
  const [timeLimit, setTimeLimit] = useState<TimeLimit>("no_limit")
  
  // Personal details configuration and responses
  const [personalDetailsConfig, setPersonalDetailsConfig] = useState<PersonalDetailsConfig>({
    includePersonalDetails: true,
    personalFields: [
      { id: "name", label: "What is your full name?", type: "text", required: true },
      { id: "email", label: "What is your email address?", type: "text", required: true },
      { id: "role", label: "What is your role?", type: "dropdown", required: true, dropdownOptions: ["Student", "Teacher", "Professional", "Other"] }
    ]
  })
  const [personalDetailsResponses, setPersonalDetailsResponses] = useState<PersonalDetailsResponse>({})
  
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

  // Handle launching the recorder with selected settings
  const handleLaunch = (selectedNumRecordings: number, selectedLanguage: AudioLanguage, selectedTextInputs: TextInput[], selectedMode: "question" | "conversation", selectedTimeLimit: TimeLimit) => {
    // The number of recordings is now determined by the number of text inputs
    setNumRecordings(selectedTextInputs.length)
    setAudioLanguage(selectedLanguage)
    setTextInputs(selectedTextInputs)
    setMode(selectedMode)
    setTimeLimit(selectedTimeLimit)
    
    // Go to personal details collection first
    setAppState("personal_details")
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
      <div className="p-6 h-full w-full">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Camera Recorder Settings</h1>
            <p className="text-muted-foreground">Configure your recording session</p>
          </div>
          <Button 
            onClick={() => {
              unlockAudio(); // Unlock audio on user interaction
              initAudioContext(); // Initialize Web Audio API context
              handleLaunch(textInputs.length, audioLanguage, textInputs, "question", "no_limit");
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 text-lg rounded-full"
          >
            Launch Recorder
          </Button>
        </div>
        <div className="w-full space-y-6">
          <Tabs defaultValue="language" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 rounded-xl">
              <TabsTrigger value="language" className="rounded-lg">
                <Languages className="mr-2 h-4 w-4" />
                Language
              </TabsTrigger>
              <TabsTrigger value="personal-details" className="rounded-lg">
                <User className="mr-2 h-4 w-4" />
                Personal Details
              </TabsTrigger>
              <TabsTrigger value="questions" className="rounded-lg">
                <Languages className="mr-2 h-4 w-4" />
                Questions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="language" className="space-y-6">
              <Card className="rounded-xl">

                <CardContent>
                  <div className="flex flex-col items-center gap-6">
                    <div className="flex gap-4">
                      <Button
                        onClick={() => setAudioLanguage("english")}
                        className={`px-8 py-3 rounded-full text-lg ${
                          audioLanguage === "english" 
                            ? "bg-blue-500 text-white" 
                            : "bg-gray-200 text-black hover:bg-gray-300"
                        }`}
                      >
                        English
                      </Button>
                      
                      <Button
                        onClick={() => setAudioLanguage("mandarin")}
                        className={`px-8 py-3 rounded-full text-lg ${
                          audioLanguage === "mandarin" 
                            ? "bg-blue-500 text-white" 
                            : "bg-gray-200 text-black hover:bg-gray-300"
                        }`}
                      >
                        Mandarin
                      </Button>
                    </div>
                    
                    <div className="mt-8">
                      <p className="text-center text-muted-foreground mb-4">
                        Selected language: <span className="font-semibold text-foreground">{audioLanguage === "english" ? "English" : "Mandarin"}</span>
                      </p>
                      <p className="text-center text-sm text-muted-foreground">
                        This language will be used for audio prompts during the recording session.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="questions" className="space-y-6">
              <Card className="rounded-xl">

                <CardContent>
                  <div className="w-full">
                    <QuestionTab 
                      onLaunch={handleLaunch} 
                      language={audioLanguage} 
                      onLanguageChange={setAudioLanguage} 
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personal-details" className="space-y-6">
              <Card className="rounded-xl">

                <CardContent>
                  <PersonalDetailsSettings 
                    config={personalDetailsConfig}
                    onConfigChange={setPersonalDetailsConfig}
                  />

                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }
  
  if (appState === "personal_details") {
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden bg-white md:bg-gray-100 md:items-center md:justify-center">
        <div className="flex flex-col h-full w-full bg-white md:max-w-sm md:h-screen">
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
      <div className="flex flex-col h-screen w-full overflow-hidden bg-white md:bg-gray-100 md:items-center md:justify-center">
        <div className="flex flex-col h-full w-full bg-white md:max-w-sm md:h-screen p-8 items-center justify-center text-center">
          <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
          <p className="text-lg">
            All {numRecordings} recordings have been completed and downloaded.
          </p>
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