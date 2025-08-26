"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CameraView } from "@/components/camera-view"
import { CameraControls } from "@/components/camera-controls"
import { SettingsScreen } from "@/components/settings-screen"
import { AudioLanguage, TextInput, TimeLimit } from "@/components/question-tab"
import { useCamera } from "@/hooks/use-camera"
import { useQuestionRecording } from "@/hooks/use-question-recording"
import { useConversationRecording } from "@/hooks/use-conversation-recording"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { unlockAudio } from "@/lib/audio"
import { initAudioContext } from "@/lib/mobile-audio"
import PersonalDetailsCollector, { PersonalDetailField, PersonalDetailsConfig, PersonalDetailsResponse } from "@/components/personal-details-collector"
import { 
  ArrowLeft,
  ArrowRight,
  Check,
  Globe,
  Languages,
  User,
  MessageSquare,
  Video,
  Settings,
  ChevronRight,
  Download
} from "lucide-react"
import { cn } from "@/lib/utils"

// App states
type AppState = "settings" | "personal_details" | "recording" | "completed"

// Step definition
interface Step {
  id: number
  title: string
  description: string
  icon: React.ElementType
}

// Define steps for the wizard
const steps: Step[] = [
  { id: 1, title: "Language", description: "Select interview language", icon: Languages },
  { id: 2, title: "Personal Details", description: "Configure candidate info", icon: User },
  { id: 3, title: "Questions", description: "Create interview questions", icon: MessageSquare },
  { id: 4, title: "Review", description: "Finalize and launch", icon: Settings },
]

// Recording interface
interface RecordingData {
  id: string
  index: number
  question: string
  duration: string
  date: string
  url?: string
  audioUrl?: string
}

export function LaunchRecorderTab() {
  // State management
  const [appState, setAppState] = useState<AppState>("settings")
  const [currentStep, setCurrentStep] = useState(1)
  const [numRecordings, setNumRecordings] = useState(3)
  const [audioLanguage, setAudioLanguage] = useState<AudioLanguage>("english")
  const [textInputs, setTextInputs] = useState<TextInput[]>([{ id: "default", value: "" }])
  const [mode, setMode] = useState<"question" | "conversation">("question")
  const [timeLimit, setTimeLimit] = useState<TimeLimit>("no_limit")
  const [completedRecordings, setCompletedRecordings] = useState<RecordingData[]>([])
  const [recordingProgress, setRecordingProgress] = useState(0)
  
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

  // Update recording progress when recording changes
  useEffect(() => {
    if (totalRecordings > 0) {
      const progress = ((currentRecordingIndex) / totalRecordings) * 100;
      setRecordingProgress(progress);
    }
  }, [currentRecordingIndex, totalRecordings]);

  // Navigation functions
  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Check if we can proceed to the next step
  const canProceed = () => {
    switch (currentStep) {
      case 1: // Language step
        return !!audioLanguage
      case 2: // Personal details step
        return true
      case 3: // Questions step
        return textInputs.some(q => q.value.trim() !== "")
      case 4: // Review step
        return true
      default:
        return false
    }
  }

  // Handle launching the recorder with selected settings
  const handleLaunch = () => {
    // The number of recordings is now determined by the number of text inputs
    setNumRecordings(textInputs.length)
    
    // If personal details are included, go to personal details collection first
    if (personalDetailsConfig.includePersonalDetails) {
      setAppState("personal_details")
    } else {
      // Skip personal details and go straight to recording
      setAppState("recording")
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

  // Handle recording completion
  const handleRecordingComplete = (index: number) => {
    // Add the recording to the completed recordings list
    if (index < textInputs.length) {
      const newRecording: RecordingData = {
        id: `recording-${Date.now()}-${index}`,
        index: index,
        question: textInputs[index].value,
        duration: "00:30", // Placeholder, would be actual duration in real app
        date: new Date().toISOString(),
        url: `recording-${Date.now()}-${index}.webm`,
        audioUrl: textInputs[index].audioUrl
      };
      
      setCompletedRecordings(prev => [...prev, newRecording]);
    }
  }

  // Handle session completion
  useEffect(() => {
    if (isSessionComplete) {
      // Stop the camera and transition to completed state
      setTimeout(() => {
        stopCamera() // Stop the camera when recordings are complete
        setAppState("completed")
      }, 100)
    }
  }, [isSessionComplete, stopCamera]);

  // Calculate progress percentage
  const progress = (currentStep / steps.length) * 100

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Language step
        return (
          <div className="space-y-6">
            <SettingsScreen 
              onLaunch={(numRec, lang, inputs, selectedMode, selectedTimeLimit) => {
                setAudioLanguage(lang)
                setTextInputs(inputs)
                setMode(selectedMode)
                setTimeLimit(selectedTimeLimit)
                nextStep()
              }} 
              personalDetailsConfig={personalDetailsConfig}
              onPersonalDetailsConfigChange={setPersonalDetailsConfig}
              currentStep={currentStep}
              totalSteps={steps.length}
            />
          </div>
        )

      case 2: // Personal Details step
        return (
          <div className="space-y-6">
            <SettingsScreen 
              onLaunch={(numRec, lang, inputs, selectedMode, selectedTimeLimit) => {
                setAudioLanguage(lang)
                setTextInputs(inputs)
                setMode(selectedMode)
                setTimeLimit(selectedTimeLimit)
                nextStep()
              }} 
              personalDetailsConfig={personalDetailsConfig}
              onPersonalDetailsConfigChange={setPersonalDetailsConfig}
              currentStep={currentStep}
              totalSteps={steps.length}
            />
          </div>
        )

      case 3: // Questions step
        return (
          <div className="space-y-6">
            <SettingsScreen 
              onLaunch={(numRec, lang, inputs, selectedMode, selectedTimeLimit) => {
                setAudioLanguage(lang)
                setTextInputs(inputs)
                setMode(selectedMode)
                setTimeLimit(selectedTimeLimit)
                nextStep()
              }} 
              personalDetailsConfig={personalDetailsConfig}
              onPersonalDetailsConfigChange={setPersonalDetailsConfig}
              currentStep={currentStep}
              totalSteps={steps.length}
            />
          </div>
        )

      case 4: // Review step
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Review Your Settings</h3>
            <div className="space-y-4">
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-base">Language & Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Language: {audioLanguage === "english" ? "English" : "Mandarin"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Personal Details: {personalDetailsConfig.includePersonalDetails ? `${personalDetailsConfig.personalFields.length} fields` : "Not collected"}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-base">
                    Questions ({textInputs.filter(q => q.value.trim()).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {textInputs
                      .filter(q => q.value.trim())
                      .map((question, index) => (
                        <div key={question.id} className="text-sm">
                          <span className="font-medium">{index + 1}.</span> {question.value}
                          <span className="text-muted-foreground ml-2">
                            ({question.timeLimit === "no_limit" ? "No limit" : 
                              question.timeLimit === "30_seconds" ? "30s" :
                              question.timeLimit === "1_minute" ? "1m" :
                              question.timeLimit === "2_minutes" ? "2m" :
                              question.timeLimit === "3_minutes" ? "3m" :
                              question.timeLimit === "5_minutes" ? "5m" : ""})
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Render based on current app state
  if (appState === "settings") {
    return (
      <div className="relative flex flex-col h-screen w-full overflow-hidden bg-background">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 -z-10 opacity-20"
          animate={{
            background: [
              "radial-gradient(circle at 50% 50%, rgba(120, 41, 190, 0.5) 0%, rgba(53, 71, 125, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
              "radial-gradient(circle at 30% 70%, rgba(233, 30, 99, 0.5) 0%, rgba(81, 45, 168, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
              "radial-gradient(circle at 70% 30%, rgba(76, 175, 80, 0.5) 0%, rgba(32, 119, 188, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
              "radial-gradient(circle at 50% 50%, rgba(120, 41, 190, 0.5) 0%, rgba(53, 71, 125, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            ],
          }}
          transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />

        <div className="flex flex-col h-full w-full md:max-w-4xl mx-auto md:h-screen p-6 z-10">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                          currentStep > step.id
                            ? "bg-green-600 text-white"
                            : currentStep === step.id
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {currentStep > step.id ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-sm font-medium">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-4 transition-colors ${
                          currentStep > step.id ? "bg-green-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-6">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                Step {currentStep} of {steps.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>

          {/* Step Content */}
          <Card className="mb-8 rounded-3xl flex-1 border-opacity-50 bg-white bg-opacity-95">
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="rounded-2xl bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              {currentStep < steps.length ? (
                <Button onClick={nextStep} disabled={!canProceed()} className="rounded-2xl">
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleLaunch}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Launch Recorder
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (appState === "personal_details") {
    return (
      <div className="relative flex flex-col h-screen w-full overflow-hidden bg-background">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 -z-10 opacity-20"
          animate={{
            background: [
              "radial-gradient(circle at 50% 50%, rgba(120, 41, 190, 0.5) 0%, rgba(53, 71, 125, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
              "radial-gradient(circle at 30% 70%, rgba(233, 30, 99, 0.5) 0%, rgba(81, 45, 168, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
              "radial-gradient(circle at 70% 30%, rgba(76, 175, 80, 0.5) 0%, rgba(32, 119, 188, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
              "radial-gradient(circle at 50% 50%, rgba(120, 41, 190, 0.5) 0%, rgba(53, 71, 125, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            ],
          }}
          transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        
        <div className="flex flex-col h-full w-full md:max-w-sm mx-auto md:h-screen z-10">
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
      <div className="relative flex flex-col h-screen w-full overflow-hidden bg-background">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 -z-10 opacity-20"
          animate={{
            background: [
              "radial-gradient(circle at 50% 50%, rgba(120, 41, 190, 0.5) 0%, rgba(53, 71, 125, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
              "radial-gradient(circle at 30% 70%, rgba(233, 30, 99, 0.5) 0%, rgba(81, 45, 168, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
              "radial-gradient(circle at 70% 30%, rgba(76, 175, 80, 0.5) 0%, rgba(32, 119, 188, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
              "radial-gradient(circle at 50% 50%, rgba(120, 41, 190, 0.5) 0%, rgba(53, 71, 125, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            ],
          }}
          transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        
        <div className="flex flex-col h-full w-full md:max-w-xl mx-auto md:h-screen p-8 items-center justify-center text-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="rounded-3xl border-opacity-50 bg-white bg-opacity-95 p-8">
              <CardContent className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
                
                <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
                <p className="text-lg mb-8">
                  All {numRecordings} recordings have been completed and downloaded.
                </p>
                
                <div className="w-full space-y-4">
                  <h2 className="text-xl font-semibold">Your Recordings</h2>
                  
                  {completedRecordings.length > 0 ? (
                    <div className="space-y-2">
                      {completedRecordings.map((recording, index) => (
                        <div key={recording.id} className="flex items-center justify-between p-3 border rounded-xl">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                            </div>
                            <div className="text-left">
                              <p className="font-medium truncate max-w-[200px]">{recording.question}</p>
                              <p className="text-xs text-muted-foreground">Recorded {new Date(recording.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No recordings found</p>
                  )}
                  
                  <div className="pt-4">
                    <Button 
                      onClick={() => {
                        setAppState("settings");
                        setCurrentStep(1);
                        setCompletedRecordings([]);
                      }}
                      className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full"
                    >
                      Create New Recording Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // Recording state
  return (
    <div className="relative flex flex-col h-screen w-full overflow-hidden bg-background">
      <div className="flex flex-col h-full w-full bg-black md:max-w-sm md:mx-auto md:h-screen">
        <CameraView videoRef={videoRef} countdown={countdown} recordingTimeLeft={recordingTimeLeft} />
        
        {/* Recording progress */}
        <div className="absolute top-4 left-4 right-4 z-20">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-white">
              <span>Question {currentRecordingIndex + 1} of {totalRecordings}</span>
              <span>{Math.round(recordingProgress)}% Complete</span>
            </div>
            <Progress value={recordingProgress} className="h-1" />
          </div>
        </div>

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
          onNextRecording={() => {
            handleRecordingComplete(currentRecordingIndex);
            nextRecording();
          }}
          onCompleteSession={() => {
            handleRecordingComplete(currentRecordingIndex);
            completeSession();
          }}
        />
      </div>
    </div>
  )
}