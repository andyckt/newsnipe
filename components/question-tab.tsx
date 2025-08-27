"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { PlusCircle, MinusCircle, Volume2, Loader2, GripVertical, Clock, Sparkles, Trash2, Check } from "lucide-react"
import { textToSpeechAndUpload, playAudio, getPresignedUrl } from "@/lib/api-service"
import { unlockAudio } from "@/lib/audio"
import { initAudioContext, playMobileAudio } from "@/lib/mobile-audio"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

export type AudioLanguage = "english" | "mandarin"

export interface TextInput {
  id: string;
  value: string;
  audioUrl?: string;  // S3 presigned URL
  audioKey?: string;  // S3 key for the audio file
  isGenerating?: boolean;
  timeLimit?: TimeLimit; // Individual time limit for this question
  // No need to explicitly store order as the array index will determine order
}

// Time limit options for recordings
export type TimeLimit = "no_limit" | "30_seconds" | "1_minute" | "2_minutes" | "3_minutes" | "5_minutes";

interface QuestionTabProps {
  onLaunch: (numRecordings: number, language: AudioLanguage, textInputs: TextInput[], mode: "question" | "conversation", timeLimit: TimeLimit) => void;
  language: AudioLanguage;
  onLanguageChange: (newLanguage: AudioLanguage) => void;
  hideTitle?: boolean;
  hideSubmitButton?: boolean;
}

// SortableTextInput component for drag and drop functionality
interface SortableTextInputProps {
  input: TextInput;
  index: number;
  onTextChange: (id: string, value: string) => void;
  onTimeLimitChange: (id: string, timeLimit: TimeLimit) => void;
  onGenerateSpeech: (id: string, text: string) => void;
  onPlayAudio: (audioUrl?: string, audioKey?: string) => void;
  onRemove: (id: string) => void;
  disableRemove: boolean;
}

function SortableTextInput({ 
  input, 
  index,
  onTextChange,
  onTimeLimitChange,
  onGenerateSpeech, 
  onPlayAudio, 
  onRemove,
  disableRemove
}: SortableTextInputProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: input.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <motion.div 
      ref={setNodeRef} 
      style={style} 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`border rounded-2xl p-4 space-y-3 ${
        isDragging 
          ? 'bg-gray-100 border-blue-300 shadow-lg' 
          : 'hover:border-gray-300 transition-colors'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div 
          {...attributes} 
          {...listeners} 
          className="flex flex-col items-center gap-2 pt-2"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
            {index + 1}
          </div>
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className="text-xs rounded-xl">
                Question {index + 1}
              </Badge>
            </div>
            <Textarea
              value={input.value}
              onChange={(e) => onTextChange(input.id, e.target.value)}
              placeholder="Enter your interview question..."
              className="min-h-[80px] rounded-2xl"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <Label className="text-sm">Time limit:</Label>
              <Select
                value={input.timeLimit || "no_limit"}
                onValueChange={(value) => onTimeLimitChange(input.id, value as TimeLimit)}
              >
                <SelectTrigger className="w-32 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_limit">No limit</SelectItem>
                  <SelectItem value="30_seconds">30 seconds</SelectItem>
                  <SelectItem value="1_minute">1 minute</SelectItem>
                  <SelectItem value="2_minutes">2 minutes</SelectItem>
                  <SelectItem value="3_minutes">3 minutes</SelectItem>
                  <SelectItem value="5_minutes">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-1 items-center">
              <Button
                onClick={() => {
                  unlockAudio(); // Unlock audio on user interaction
                  initAudioContext(); // Initialize Web Audio API context
                  input.audioUrl ? onPlayAudio(input.audioUrl, input.audioKey) : onGenerateSpeech(input.id, input.value);
                }}
                disabled={!input.value.trim() || input.isGenerating}
                variant="ghost"
                size="sm"
                className={`rounded-full ${
                  input.audioUrl 
                    ? "text-green-500 hover:text-green-700 hover:bg-green-50" 
                    : "text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                }`}
                title={input.audioUrl ? "Play generated audio" : "Generate audio"}
              >
                {input.isGenerating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Volume2 size={16} />
                )}
                <span className="ml-1">{input.audioUrl ? "Play" : "Generate"}</span>
              </Button>
              
              <Button 
                onClick={() => onRemove(input.id)} 
                disabled={disableRemove} 
                variant="ghost" 
                size="sm" 
                className="rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function QuestionTab({ onLaunch, language, onLanguageChange, hideTitle = false, hideSubmitButton = false }: QuestionTabProps) {
  const [textInputs, setTextInputs] = useState<TextInput[]>([
    { 
      id: crypto.randomUUID(), 
      value: '', 
      audioUrl: undefined, 
      audioKey: undefined, 
      isGenerating: false,
      timeLimit: "no_limit"
    }
  ])
  
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [aiContext, setAiContext] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set())
  
  // Try to unlock audio on component mount and on any user interaction
  useEffect(() => {
    // Try to initialize audio context immediately
    initAudioContext();
    
    // Add event listeners to unlock audio on any user interaction
    const unlockOnUserInteraction = () => {
      unlockAudio();
      initAudioContext();
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
  
  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // This ensures a small movement is needed before drag starts
        // to avoid conflicts with click events
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  const handleAddTextInput = () => {
    setTextInputs(prev => [...prev, { 
      id: crypto.randomUUID(), 
      value: '',
      audioUrl: undefined,
      audioKey: undefined,
      isGenerating: false,
      timeLimit: "no_limit"
    }])
  }
  
  const handleRemoveTextInput = (id: string) => {
    // Don't remove if it's the last input
    if (textInputs.length <= 1) return
    
    setTextInputs(prev => prev.filter(input => input.id !== id))
  }
  
  const handleTextInputChange = (id: string, value: string) => {
    setTextInputs(prev => 
      prev.map(input => input.id === id ? { ...input, value } : input)
    )
  }
  
  const handleTimeLimitChange = (id: string, timeLimit: TimeLimit) => {
    setTextInputs(prev => 
      prev.map(input => input.id === id ? { ...input, timeLimit } : input)
    )
  }
  
  const generateSpeech = async (id: string, text: string) => {
    if (!text.trim()) return
    
    try {
      // Update the state to show loading
      setTextInputs(prev => 
        prev.map(input => input.id === id ? { ...input, isGenerating: true } : input)
      )
      
      // Map the AudioLanguage type to the type expected by API
      const apiLanguage = language === "english" ? "english" : "mandarin"
      console.log(`Generating speech for language: ${language}, mapped to API language: ${apiLanguage}`)
      
      // Generate speech with the selected language and upload to S3 using our API service
      const { url, key } = await textToSpeechAndUpload(text, apiLanguage)
      
      console.log(`Audio uploaded to S3. Key: ${key}, URL: ${url}`)
      
      // Update the state with the audio URL and S3 key
      setTextInputs(prev => 
        prev.map(input => input.id === id ? { 
          ...input, 
          audioUrl: url,
          audioKey: key,
          isGenerating: false 
        } : input)
      )
    } catch (error) {
      console.error('Error generating speech:', error)
      
      // Update the state to show error
      setTextInputs(prev => 
        prev.map(input => input.id === id ? { ...input, isGenerating: false } : input)
      )
      
      // Show an alert
      alert('Failed to generate speech. Please try again.')
    }
  }
  
  const handlePlayAudio = async (audioUrl?: string, audioKey?: string) => {
    if (!audioUrl) return
    
    try {
      // Initialize audio context
      initAudioContext();
      
      // If we have a key, get a fresh presigned URL (in case the old one expired)
      let urlToPlay = audioUrl
      if (audioKey) {
        urlToPlay = await getPresignedUrl(audioKey)
        
        // Update the stored URL in state
        setTextInputs(prev => 
          prev.map(input => input.audioKey === audioKey ? { 
            ...input, 
            audioUrl: urlToPlay
          } : input)
        )
      }
      
      // Play the audio using mobile-friendly method
      console.log("Playing audio preview...");
      try {
        await playMobileAudio(urlToPlay);
        console.log("Audio preview played successfully");
      } catch (error) {
        console.error("Mobile audio playback failed, falling back to standard method:", error);
        // Fallback to standard method
        playAudio(urlToPlay);
      }
    } catch (error) {
      console.error('Error playing audio:', error)
      alert('Failed to play audio. Please try again.')
    }
  }
  
  // Handle the end of a drag operation
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    // If no over element or same element, no reordering needed
    if (!over || active.id === over.id) {
      return
    }
    
    // Find the indices of the dragged item and the drop target
    const oldIndex = textInputs.findIndex(input => input.id === active.id)
    const newIndex = textInputs.findIndex(input => input.id === over.id)
    
    // Update the array order using arrayMove from dnd-kit
    setTextInputs(arrayMove(textInputs, oldIndex, newIndex))
  }

  const generateAIQuestions = async () => {
    setIsGenerating(true)
    setSelectedQuestions(new Set())
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const sampleQuestions = [
      "Tell me about your motivation for applying to this position.",
      "How do you handle challenging situations or setbacks?",
      "What unique perspective or skills would you bring to our team?",
      "Describe a time when you had to work with people from different backgrounds.",
      "What are your long-term goals and how does this opportunity align with them?",
      "How do you adapt to new environments and cultures?",
      "What challenges do you expect to face and how would you overcome them?",
      "Describe a project or achievement you're particularly proud of.",
    ]

    setGeneratedQuestions(sampleQuestions)
    setIsGenerating(false)
  }

  const toggleQuestionSelection = (index: number) => {
    const newSelected = new Set(selectedQuestions)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedQuestions(newSelected)
  }

  const addSelectedQuestions = () => {
    const questionsToAdd = Array.from(selectedQuestions).map((index) => ({
      id: crypto.randomUUID(),
      value: generatedQuestions[index],
      audioUrl: undefined,
      audioKey: undefined,
      isGenerating: false,
      timeLimit: "1_minute" as TimeLimit
    }))

    setTextInputs(prev => [...prev, ...questionsToAdd])
    setSelectedQuestions(new Set())
    setShowAIDialog(false)
  }
  
  return (
    <div className="w-full">
      {!hideTitle && (
        <div className="flex flex-col items-center mb-6 w-full">
          <h2 className="text-xl font-semibold mb-2">Custom Text Fields</h2>
          <p className="text-sm text-gray-500 mb-6 text-center">Each text field will correspond to one recording. Drag to reorder.</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className={hideTitle ? "text-lg font-semibold" : "sr-only"}>Interview Questions</h3>
        <div className="flex items-center space-x-2">
          <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 hover:from-purple-700 hover:to-blue-700 rounded-2xl"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Let AI Help Me
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl h-[80vh] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  AI Question Generator
                </DialogTitle>
                <DialogDescription>
                  Describe what you're building and let AI generate relevant interview questions for you.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6 h-full">
                <div className="space-y-4 border-r pr-6">
                  <div>
                    <Label htmlFor="context" className="text-base font-medium">
                      Interview Context
                    </Label>
                    <Textarea
                      id="context"
                      placeholder="e.g., I'm creating an interview for a student exchange program to Japan. I want to assess their cultural adaptability, language skills, and motivation..."
                      value={aiContext}
                      onChange={(e) => setAiContext(e.target.value)}
                      rows={8}
                      className="rounded-2xl mt-2"
                    />
                  </div>
                  <Button
                    onClick={generateAIQuestions}
                    disabled={!aiContext.trim() || isGenerating}
                    className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Questions
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-4 pl-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-base">Generated Questions</h4>
                    <div className="flex gap-2">
                      {generatedQuestions.length > 0 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-2xl"
                            onClick={() => {
                              setGeneratedQuestions([]);
                              setSelectedQuestions(new Set());
                            }}
                          >
                            Clear All
                          </Button>
                          <Button
                            onClick={addSelectedQuestions}
                            disabled={selectedQuestions.size === 0}
                            className="rounded-2xl"
                            size="sm"
                          >
                            Add Selected ({selectedQuestions.size})
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                    {generatedQuestions.length === 0 && !isGenerating && (
                      <div className="text-center text-muted-foreground py-8">
                        <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Generate questions to see them here</p>
                      </div>
                    )}

                    {isGenerating && (
                      <div className="text-center text-muted-foreground py-8">
                        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p>Generating questions...</p>
                      </div>
                    )}

                    {generatedQuestions.map((question, index) => (
                      <div
                        key={index}
                        className={`flex items-start space-x-3 p-4 border rounded-2xl cursor-pointer transition-colors ${
                          selectedQuestions.has(index)
                            ? "border-blue-500 bg-blue-50/80"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                        }`}
                        onClick={() => toggleQuestionSelection(index)}
                      >
                        <div className="flex items-center mt-1">
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                              selectedQuestions.has(index) 
                                ? "bg-blue-600 border-blue-600" 
                                : "border-gray-300"
                            }`}
                          >
                            {selectedQuestions.has(index) && <Check className="h-3 w-3 text-white" />}
                          </div>
                        </div>
                        <p className="text-sm flex-1 leading-relaxed">{question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleAddTextInput} className="rounded-2xl bg-transparent">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col gap-4 w-full mb-6">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={textInputs.map(input => input.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {textInputs.map((input, index) => (
                <SortableTextInput
                  key={input.id}
                  input={input}
                  index={index}
                  onTextChange={handleTextInputChange}
                  onTimeLimitChange={handleTimeLimitChange}
                  onGenerateSpeech={generateSpeech}
                  onPlayAudio={handlePlayAudio}
                  onRemove={handleRemoveTextInput}
                  disableRemove={textInputs.length <= 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      
      {!hideSubmitButton && (
        <div className="flex justify-center">
          <Button 
            onClick={() => {
              unlockAudio(); // Unlock audio on user interaction
              initAudioContext(); // Initialize Web Audio API context
              onLaunch(textInputs.length, language, textInputs, "question", "no_limit");
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-4 text-xl rounded-full"
          >
            Launch Recorder
          </Button>
        </div>
      )}
    </div>
  )
}