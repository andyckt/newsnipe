"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GripVertical,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Volume2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
// import { groups } from "@/constants/dashboard-data" // Commented out groups import

interface Question {
  id: string
  text: string
  timer: string
}

interface PersonalDetailField {
  id: string
  label: string
  type: string
  required: boolean
  dropdownOptions?: string[]
  allowMultiple?: boolean
}

interface FormData {
  accessType: "public" // Removed groups option, only public now
  publicUrl: string
  language: "english" | "mandarin"
  includePersonalDetails: boolean
  personalFields: PersonalDetailField[]
  questions: Question[]
  url?: string // Added URL field to store the generated interview URL
}

interface CreateSnipeTabProps {
  onSnipeCreated?: (formData: FormData) => void
}

const steps = [
  { id: 1, title: "Language", description: "Select interview language" },
  { id: 2, title: "Personal Details", description: "Configure candidate info" },
  { id: 3, title: "Questions", description: "Create interview questions" },
  { id: 4, title: "Review", description: "Finalize your Snipe" },
]

const defaultPersonalFields: PersonalDetailField[] = [
  { id: "1", label: "What is your full name?", type: "text", required: true },
  { id: "2", label: "What is your email address?", type: "text", required: true },
  {
    id: "3",
    label: "What is your role?",
    type: "dropdown",
    required: false,
    dropdownOptions: ["Student", "Teacher", "Professional", "Other"],
    allowMultiple: false,
  },
]

export function CreateSnipeTab({ onSnipeCreated }: CreateSnipeTabProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    accessType: "public", // Default to public only
    publicUrl: "",
    language: "english",
    includePersonalDetails: true, // Changed default to true
    personalFields: defaultPersonalFields,
    questions: [{ id: "1", text: "", timer: "60" }],
  })

  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [aiContext, setAiContext] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set())

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

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.language !== ""
      case 2:
        return true
      case 3:
        return formData.questions.some((q) => q.text.trim() !== "")
      case 4:
        return true
      default:
        return false
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedItem(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedItem === null) return

    const newQuestions = [...formData.questions]
    const draggedQuestion = newQuestions[draggedItem]
    newQuestions.splice(draggedItem, 1)
    newQuestions.splice(index, 0, draggedQuestion)

    setFormData({ ...formData, questions: newQuestions })
    setDraggedItem(index)
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: "",
      timer: "60",
    }
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    })
  }

  const removeQuestion = (index: number) => {
    if (formData.questions.length > 1) {
      const newQuestions = formData.questions.filter((_, i) => i !== index)
      setFormData({ ...formData, questions: newQuestions })
    }
  }

  const updateQuestion = (index: number, field: keyof Question, value: string) => {
    const newQuestions = [...formData.questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    setFormData({ ...formData, questions: newQuestions })
  }

  const generateAIQuestions = async () => {
    setIsGenerating(true)
    setSelectedQuestions(new Set())
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const sampleQuestions = [
      "Tell me about your motivation for applying to this program.",
      "How do you handle challenging situations or setbacks?",
      "What unique perspective or skills would you bring to our community?",
      "Describe a time when you had to work with people from different backgrounds.",
      "What are your long-term goals and how does this opportunity align with them?",
      "How do you adapt to new environments and cultures?",
      "What challenges do you expect to face and how would you overcome them?",
      "Describe a project or achievement you're particularly proud of.",
    ]

    setGeneratedQuestions(sampleQuestions)
    setIsGenerating(false)
  }

  const addSelectedQuestions = () => {
    const questionsToAdd = Array.from(selectedQuestions).map((index) => ({
      id: Date.now().toString() + index,
      text: generatedQuestions[index],
      timer: "60",
    }))

    setFormData({
      ...formData,
      questions: [...formData.questions, ...questionsToAdd],
    })

    setSelectedQuestions(new Set())
    setShowAIDialog(false)
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Interview Language</h3>
              <RadioGroup
                value={formData.language}
                onValueChange={(value: "english" | "mandarin") => setFormData({ ...formData, language: value })}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 p-4 border rounded-2xl hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="english" id="english" />
                  <div className="text-2xl">🇺🇸</div>
                  <div className="flex-1">
                    <Label htmlFor="english" className="font-medium">
                      English
                    </Label>
                    <p className="text-sm text-muted-foreground">Conduct interview in English</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-2xl hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="mandarin" id="mandarin" />
                  <div className="text-2xl">🇨🇳</div>
                  <div className="flex-1">
                    <Label htmlFor="mandarin" className="font-medium">
                      Mandarin
                    </Label>
                    <p className="text-sm text-muted-foreground">Conduct interview in Mandarin Chinese</p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Details Collection</h3>
              <div className="flex items-center space-x-3 p-4 border rounded-2xl">
                <button
                  onClick={() => setFormData({ ...formData, includePersonalDetails: !formData.includePersonalDetails })}
                  className="flex items-center space-x-2"
                >
                  {formData.includePersonalDetails ? (
                    <ToggleRight className="h-6 w-6 text-blue-600" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                  )}
                  <span className="font-medium">Do you want to collect personal details?</span>
                </button>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: formData.includePersonalDetails ? 1 : 0,
                height: formData.includePersonalDetails ? "auto" : 0,
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {formData.includePersonalDetails && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Personal Detail Fields</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-2xl bg-transparent"
                      onClick={() => {
                        const newField: PersonalDetailField = {
                          id: Date.now().toString(),
                          label: "New Field",
                          type: "text",
                          required: false,
                        }
                        setFormData({
                          ...formData,
                          personalFields: [...formData.personalFields, newField],
                        })
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Field
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.personalFields.map((field, index) => (
                      <div key={field.id} className="border rounded-2xl p-4 space-y-4">
                        <div className="flex items-center space-x-3">
                          <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <Input
                              placeholder="Field label"
                              value={field.label}
                              onChange={(e) => {
                                const newFields = [...formData.personalFields]
                                newFields[index] = { ...newFields[index], label: e.target.value }
                                setFormData({ ...formData, personalFields: newFields })
                              }}
                              className="rounded-2xl"
                            />
                            <Select
                              value={field.type}
                              onValueChange={(value) => {
                                const newFields = [...formData.personalFields]
                                newFields[index] = {
                                  ...newFields[index],
                                  type: value,
                                  ...(value !== "dropdown" && { dropdownOptions: undefined, allowMultiple: undefined }),
                                }
                                setFormData({ ...formData, personalFields: newFields })
                              }}
                            >
                              <SelectTrigger className="rounded-2xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text Input</SelectItem>
                                <SelectItem value="dropdown">Dropdown</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => {
                                const newFields = [...formData.personalFields]
                                newFields[index] = { ...newFields[index], required: !newFields[index].required }
                                setFormData({ ...formData, personalFields: newFields })
                              }}
                              className="flex items-center space-x-1 text-sm"
                            >
                              {field.required ? (
                                <ToggleRight className="h-4 w-4 text-blue-600" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-gray-400" />
                              )}
                              <span>Required</span>
                            </button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-2xl"
                              onClick={() => {
                                const newFields = formData.personalFields.filter((_, i) => i !== index)
                                setFormData({ ...formData, personalFields: newFields })
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {field.type === "dropdown" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-gray-50 rounded-2xl p-4 space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium text-sm">Dropdown Configuration</h5>
                              <button
                                onClick={() => {
                                  const newFields = [...formData.personalFields]
                                  newFields[index] = {
                                    ...newFields[index],
                                    allowMultiple: !newFields[index].allowMultiple,
                                  }
                                  setFormData({ ...formData, personalFields: newFields })
                                }}
                                className="flex items-center space-x-1 text-sm"
                              >
                                {field.allowMultiple ? (
                                  <ToggleRight className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-gray-400" />
                                )}
                                <span>Allow multiple selection</span>
                              </button>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Options</Label>
                              <div className="space-y-2">
                                {(field.dropdownOptions || []).map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center space-x-2">
                                    <Input
                                      placeholder="Option text"
                                      value={option}
                                      onChange={(e) => {
                                        const newFields = [...formData.personalFields]
                                        const newOptions = [...(newFields[index].dropdownOptions || [])]
                                        newOptions[optionIndex] = e.target.value
                                        newFields[index] = { ...newFields[index], dropdownOptions: newOptions }
                                        setFormData({ ...formData, personalFields: newFields })
                                      }}
                                      className="rounded-2xl flex-1"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="rounded-2xl"
                                      onClick={() => {
                                        const newFields = [...formData.personalFields]
                                        const newOptions = (newFields[index].dropdownOptions || []).filter(
                                          (_, i) => i !== optionIndex,
                                        )
                                        newFields[index] = { ...newFields[index], dropdownOptions: newOptions }
                                        setFormData({ ...formData, personalFields: newFields })
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-2xl bg-white"
                                  onClick={() => {
                                    const newFields = [...formData.personalFields]
                                    const currentOptions = newFields[index].dropdownOptions || []
                                    newFields[index] = {
                                      ...newFields[index],
                                      dropdownOptions: [...currentOptions, "New Option"],
                                    }
                                    setFormData({ ...formData, personalFields: newFields })
                                  }}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Option
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Interview Questions</h3>
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
                      <DialogTitle>AI Question Generator</DialogTitle>
                      <DialogDescription>
                        Describe what you're building and let AI generate relevant interview questions for you.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-6 h-full">
                      <div className="space-y-4 border-r pr-6">
                        <div>
                          <Label htmlFor="context" className="text-base font-medium">
                            Context
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
                          className="w-full rounded-2xl"
                          size="lg"
                        >
                          {isGenerating ? "Generating..." : "Generate Questions"}
                        </Button>
                      </div>

                      <div className="space-y-4 pl-6">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-base">Generated Questions</h4>
                          {generatedQuestions.length > 0 && (
                            <Button
                              onClick={addSelectedQuestions}
                              disabled={selectedQuestions.size === 0}
                              className="rounded-2xl"
                              size="sm"
                            >
                              Add Selected ({selectedQuestions.size})
                            </Button>
                          )}
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
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => toggleQuestionSelection(index)}
                            >
                              <div className="flex items-center mt-1">
                                <div
                                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                    selectedQuestions.has(index) ? "bg-blue-600 border-blue-600" : "border-gray-300"
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
                <Button variant="outline" onClick={addQuestion} className="rounded-2xl bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {formData.questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-2xl p-4 space-y-3"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={() => setDraggedItem(null)}
                >
                  <div className="flex items-start space-x-3">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move mt-2" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs rounded-xl">
                          Question {index + 1}
                        </Badge>
                      </div>
                      <Textarea
                        placeholder="Enter your interview question..."
                        value={question.text}
                        onChange={(e) => updateQuestion(index, "text", e.target.value)}
                        rows={2}
                        className="rounded-2xl"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <Label className="text-sm">Time limit:</Label>
                            <Select
                              value={question.timer}
                              onValueChange={(value) => updateQuestion(index, "timer", value)}
                            >
                              <SelectTrigger className="w-32 rounded-2xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30">30 seconds</SelectItem>
                                <SelectItem value="60">1 minute</SelectItem>
                                <SelectItem value="120">2 minutes</SelectItem>
                                <SelectItem value="180">3 minutes</SelectItem>
                                <SelectItem value="300">5 minutes</SelectItem>
                                <SelectItem value="none">No limit</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full p-1 hover:bg-gray-100"
                          >
                            <Volume2 className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                        {formData.questions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(index)}
                            className="rounded-2xl"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Review Your Snipe</h3>
            <div className="space-y-4">
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-base">Language & Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Language: {formData.language === "english" ? "English" : "Mandarin"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Personal Details:{" "}
                    {formData.includePersonalDetails ? `${formData.personalFields.length} fields` : "Not collected"}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-base">
                    Questions ({formData.questions.filter((q) => q.text.trim()).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {formData.questions
                      .filter((q) => q.text.trim())
                      .map((question, index) => (
                        <div key={question.id} className="text-sm">
                          <span className="font-medium">{index + 1}.</span> {question.text}
                          <span className="text-muted-foreground ml-2">
                            ({question.timer === "none" ? "No limit" : `${question.timer}s`})
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
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
                  {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
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
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8 rounded-3xl">
        <CardContent className="p-6">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
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
              onClick={() => {
                const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
                const generatedUrl = `https://snipe.app/interview/${uniqueId}`

                const snipeData = {
                  ...formData,
                  url: generatedUrl,
                }

                console.log("Creating Snipe with data:", snipeData)
                if (onSnipeCreated) {
                  onSnipeCreated(snipeData)
                }
              }}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl"
            >
              <Check className="h-4 w-4 mr-2" />
              Done, Create Snipe
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
