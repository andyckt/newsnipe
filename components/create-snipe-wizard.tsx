"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Users,
  Languages,
  User,
  MessageSquare,
  Sparkles,
  Check,
  Plus,
  Trash2,
  GripVertical,
  Timer,
  Loader2,
  Wand2,
} from "lucide-react"
import { projects } from "@/constants/dashboard-data"

interface CreateSnipeWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const steps = [
  { id: 1, title: "Setup", icon: Globe, description: "Choose URL or select group" },
  { id: 2, title: "Language", icon: Languages, description: "Select interview language" },
  { id: 3, title: "Personal Details", icon: User, description: "Configure candidate information" },
  { id: 4, title: "Questions", icon: MessageSquare, description: "Create interview questions" },
  { id: 5, title: "Review", icon: Sparkles, description: "Review and create" },
]

const defaultPersonalQuestions = [
  { id: 1, question: "Full Name", required: true },
  { id: 2, question: "Email Address", required: true },
  { id: 3, question: "Date of Birth", required: false },
  { id: 4, question: "Gender", required: false },
  { id: 5, question: "Phone Number", required: false },
  { id: 6, question: "Current Location", required: false },
]

const timerOptions = [
  { value: "none", label: "No Timer" },
  { value: "30", label: "30 seconds" },
  { value: "60", label: "1 minute" },
  { value: "90", label: "1.5 minutes" },
  { value: "120", label: "2 minutes" },
  { value: "180", label: "3 minutes" },
  { value: "300", label: "5 minutes" },
]

const sampleAIQuestions = [
  "Tell me about your motivation for applying to this exchange program.",
  "How do you handle challenges when adapting to new cultural environments?",
  "Describe a time when you had to work with people from different backgrounds.",
  "What specific skills or knowledge do you hope to gain from this experience?",
  "How would you contribute to the host community during your exchange?",
]

export function CreateSnipeWizard({ open, onOpenChange }: CreateSnipeWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [aiContext, setAiContext] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])

  const [formData, setFormData] = useState({
    setupType: "",
    selectedGroup: "",
    publicUrl: "",
    language: "",
    includePersonalDetails: false,
    personalQuestions: defaultPersonalQuestions,
    interviewQuestions: [
      { id: 1, question: "", timer: "60" },
      { id: 2, question: "", timer: "60" },
    ],
  })

  const progress = (currentStep / steps.length) * 100

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

  const canProceedFromStep1 = () => {
    if (formData.setupType === "public") {
      return formData.publicUrl.trim() !== ""
    } else if (formData.setupType === "group") {
      return formData.selectedGroup !== ""
    }
    return false
  }

  const canProceedFromStep2 = () => {
    return formData.language !== ""
  }

  const canProceedFromStep4 = () => {
    return formData.interviewQuestions.some((q) => q.question.trim() !== "")
  }

  const addPersonalQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: "",
      required: false,
    }
    setFormData({
      ...formData,
      personalQuestions: [...formData.personalQuestions, newQuestion],
    })
  }

  const updatePersonalQuestion = (id: number, field: string, value: any) => {
    setFormData({
      ...formData,
      personalQuestions: formData.personalQuestions.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    })
  }

  const removePersonalQuestion = (id: number) => {
    setFormData({
      ...formData,
      personalQuestions: formData.personalQuestions.filter((q) => q.id !== id),
    })
  }

  const addInterviewQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: "",
      timer: "60",
    }
    setFormData({
      ...formData,
      interviewQuestions: [...formData.interviewQuestions, newQuestion],
    })
  }

  const updateInterviewQuestion = (id: number, field: string, value: any) => {
    setFormData({
      ...formData,
      interviewQuestions: formData.interviewQuestions.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    })
  }

  const removeInterviewQuestion = (id: number) => {
    if (formData.interviewQuestions.length > 1) {
      setFormData({
        ...formData,
        interviewQuestions: formData.interviewQuestions.filter((q) => q.id !== id),
      })
    }
  }

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedItem(id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault()

    if (draggedItem === null || draggedItem === targetId) return

    const questions = [...formData.interviewQuestions]
    const draggedIndex = questions.findIndex((q) => q.id === draggedItem)
    const targetIndex = questions.findIndex((q) => q.id === targetId)

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedQuestion] = questions.splice(draggedIndex, 1)
      questions.splice(targetIndex, 0, draggedQuestion)

      setFormData({
        ...formData,
        interviewQuestions: questions,
      })
    }

    setDraggedItem(null)
  }

  const handleGenerateQuestions = async () => {
    if (!aiContext.trim()) return

    setIsGenerating(true)

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // For demo purposes, use sample questions
    setGeneratedQuestions(sampleAIQuestions)
    setSelectedQuestions([])
    setIsGenerating(false)
  }

  const handleQuestionSelection = (question: string, checked: boolean) => {
    if (checked) {
      setSelectedQuestions([...selectedQuestions, question])
    } else {
      setSelectedQuestions(selectedQuestions.filter((q) => q !== question))
    }
  }

  const handleAddSelectedQuestions = () => {
    const newQuestions = selectedQuestions.map((question) => ({
      id: Date.now() + Math.random(),
      question,
      timer: "60",
    }))

    setFormData({
      ...formData,
      interviewQuestions: [...formData.interviewQuestions, ...newQuestions],
    })

    // Reset AI dialog state
    setShowAIDialog(false)
    setAiContext("")
    setGeneratedQuestions([])
    setSelectedQuestions([])
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">How do you want to set up your Snipe?</h3>
              <p className="text-muted-foreground">Choose how candidates will access the interview</p>
            </div>

            <RadioGroup
              value={formData.setupType}
              onValueChange={(value) => setFormData({ ...formData, setupType: value })}
              className="space-y-4"
            >
              <div
                className={`border rounded-xl p-4 cursor-pointer transition-all ${
                  formData.setupType === "public" ? "border-blue-500 bg-blue-50/50" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="public" id="public" />
                  <Globe className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <Label htmlFor="public" className="font-medium cursor-pointer">
                      Public URL
                    </Label>
                    <p className="text-sm text-muted-foreground">Anyone with the link can take the interview</p>
                  </div>
                  {formData.setupType === "public" && <Check className="h-5 w-5 text-blue-600" />}
                </div>
              </div>

              <div
                className={`border rounded-xl p-4 cursor-pointer transition-all ${
                  formData.setupType === "group" ? "border-green-500 bg-green-50/50" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="group" id="group" />
                  <Users className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <Label htmlFor="group" className="font-medium cursor-pointer">
                      Select from Groups
                    </Label>
                    <p className="text-sm text-muted-foreground">Choose candidates from existing groups</p>
                  </div>
                  {formData.setupType === "group" && <Check className="h-5 w-5 text-green-600" />}
                </div>
              </div>
            </RadioGroup>

            <AnimatePresence mode="wait">
              {formData.setupType === "public" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <Label htmlFor="publicUrl">Public URL Slug</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">snipe.ai/interview/</span>
                    <Input
                      id="publicUrl"
                      placeholder="my-interview-2025"
                      value={formData.publicUrl}
                      onChange={(e) => setFormData({ ...formData, publicUrl: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Choose a unique URL slug for your interview. Only letters, numbers, and hyphens allowed.
                  </p>
                </motion.div>
              )}

              {formData.setupType === "group" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <Label htmlFor="groupSelect">Select Group</Label>
                  <Select
                    value={formData.selectedGroup}
                    onValueChange={(value) => setFormData({ ...formData, selectedGroup: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a group..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.name} value={project.name}>
                          <div className="flex items-center justify-between w-full">
                            <span>{project.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">{project.members} members</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Candidates from the selected group will receive interview invitations.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Select Interview Language</h3>
              <p className="text-muted-foreground">Choose the language for the AI voice agent</p>
            </div>

            <RadioGroup
              value={formData.language}
              onValueChange={(value) => setFormData({ ...formData, language: value })}
              className="space-y-4"
            >
              <div
                className={`border rounded-xl p-4 cursor-pointer transition-all ${
                  formData.language === "english" ? "border-blue-500 bg-blue-50/50" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="english" id="english" />
                  <div className="w-8 h-6 rounded bg-gradient-to-r from-blue-600 to-red-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">EN</span>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="english" className="font-medium cursor-pointer">
                      English
                    </Label>
                    <p className="text-sm text-muted-foreground">AI will conduct interviews in English</p>
                  </div>
                  {formData.language === "english" && <Check className="h-5 w-5 text-blue-600" />}
                </div>
              </div>

              <div
                className={`border rounded-xl p-4 cursor-pointer transition-all ${
                  formData.language === "mandarin" ? "border-red-500 bg-red-50/50" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="mandarin" id="mandarin" />
                  <div className="w-8 h-6 rounded bg-gradient-to-r from-red-600 to-yellow-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">中</span>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="mandarin" className="font-medium cursor-pointer">
                      Mandarin Chinese
                    </Label>
                    <p className="text-sm text-muted-foreground">AI will conduct interviews in Mandarin</p>
                  </div>
                  {formData.language === "mandarin" && <Check className="h-5 w-5 text-red-600" />}
                </div>
              </div>
            </RadioGroup>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Personal Details Configuration</h3>
              <p className="text-muted-foreground">Configure what personal information to collect from candidates</p>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="includePersonalDetails" className="font-medium">
                      Do you want to add Personal Details?
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Collect basic information from candidates before the interview
                    </p>
                  </div>
                  <Switch
                    id="includePersonalDetails"
                    checked={formData.includePersonalDetails}
                    onCheckedChange={(checked) => setFormData({ ...formData, includePersonalDetails: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <AnimatePresence>
              {formData.includePersonalDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Personal Questions</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addPersonalQuestion}
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <Plus className="h-4 w-4" />
                      Add Question
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {formData.personalQuestions.map((question, index) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <div className="flex-1">
                          <Input
                            placeholder="Enter question..."
                            value={question.question}
                            onChange={(e) => updatePersonalQuestion(question.id, "question", e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={question.required}
                            onCheckedChange={(checked) => updatePersonalQuestion(question.id, "required", checked)}
                          />
                          <Label className="text-xs text-muted-foreground">Required</Label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePersonalQuestion(question.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Interview Questions</h3>
              <p className="text-muted-foreground">Create questions that will be asked by the AI voice agent</p>
            </div>

            <div className="flex items-center justify-between">
              <h4 className="font-medium">Questions</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addInterviewQuestion}
                className="flex items-center gap-2 bg-transparent"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </div>

            <div className="space-y-4">
              {formData.interviewQuestions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 border rounded-lg transition-all ${
                    draggedItem === question.id ? "opacity-50 scale-95" : ""
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, question.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, question.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-2 pt-2">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {index + 1}
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Question {index + 1}</Label>
                        <Textarea
                          placeholder="Enter your interview question..."
                          value={question.question}
                          onChange={(e) => updateInterviewQuestion(question.id, "question", e.target.value)}
                          className="mt-1 min-h-[80px]"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm">Response Time:</Label>
                        </div>
                        <Select
                          value={question.timer}
                          onValueChange={(value) => updateInterviewQuestion(question.id, "timer", value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timerOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInterviewQuestion(question.id)}
                      className="text-red-500 hover:text-red-700 mt-2"
                      disabled={formData.interviewQuestions.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            <Card className="bg-blue-50/50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-900">Need help with questions?</h4>
                    <p className="text-sm text-blue-700">Let AI generate relevant questions based on your context</p>
                  </div>
                  <Button
                    variant="outline"
                    className="ml-auto border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
                    onClick={() => setShowAIDialog(true)}
                  >
                    Let AI Help Me
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      default:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center py-8"
          >
            <h3 className="text-lg font-semibold mb-2">Step {currentStep}</h3>
            <p className="text-muted-foreground">Content for {steps[currentStep - 1]?.title} coming soon...</p>
          </motion.div>
        )
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return canProceedFromStep1()
      case 2:
        return canProceedFromStep2()
      case 4:
        return canProceedFromStep4()
      default:
        return true
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold">Create New Snipe</DialogTitle>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Step {currentStep} of {steps.length}
                </span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between items-center pt-4">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id

                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-colors
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                            ? "bg-green-100 text-green-600"
                            : "bg-muted text-muted-foreground"
                      }
                    `}
                    >
                      <StepIcon className="h-4 w-4" />
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                        {step.title}
                      </p>
                    </div>

                    {index < steps.length - 1 && (
                      <div
                        className={`
                        absolute top-5 left-1/2 w-full h-0.5 -z-10
                        ${isCompleted ? "bg-green-200" : "bg-muted"}
                      `}
                        style={{ transform: "translateX(50%)" }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </DialogHeader>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto py-6">
            <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">{steps[currentStep - 1]?.description}</div>

            {currentStep === steps.length ? (
              <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600">
                <Sparkles className="h-4 w-4" />
                Create Snipe
              </Button>
            ) : (
              <Button onClick={nextStep} className="flex items-center gap-2" disabled={!canProceed()}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-600" />
              AI Question Generator
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="aiContext">Tell AI about your interview context</Label>
              <Textarea
                id="aiContext"
                placeholder="Describe what you're looking for... e.g., 'This is for a student exchange program to Japan. I want to assess cultural adaptability, language skills, and motivation for international experience.'"
                value={aiContext}
                onChange={(e) => setAiContext(e.target.value)}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                The more context you provide, the better AI can generate relevant questions for your specific needs.
              </p>
            </div>

            {!generatedQuestions.length ? (
              <div className="flex justify-center">
                <Button
                  onClick={handleGenerateQuestions}
                  disabled={!aiContext.trim() || isGenerating}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isGenerating ? "Generating Questions..." : "Generate Questions"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Generated Questions</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setGeneratedQuestions([])
                      setSelectedQuestions([])
                    }}
                  >
                    Generate New
                  </Button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {generatedQuestions.map((question, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={selectedQuestions.includes(question)}
                        onCheckedChange={(checked) => handleQuestionSelection(question, checked as boolean)}
                      />
                      <div className="flex-1">
                        <p className="text-sm">{question}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {selectedQuestions.length} question{selectedQuestions.length !== 1 ? "s" : ""} selected
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowAIDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddSelectedQuestions}
                      disabled={selectedQuestions.length === 0}
                      className="bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      Add Selected Questions
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
