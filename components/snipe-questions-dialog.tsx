"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Clock, FileText, User } from "lucide-react"

interface PersonalDetailField {
  id: string
  label: string
  type: string
  required: boolean
  dropdownOptions?: string[]
}

interface Question {
  id: string
  value: string
  timeLimit?: string
}

interface SnipeQuestionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  questions: Question[]
  personalFields: PersonalDetailField[]
}

export function SnipeQuestionsDialog({
  open,
  onOpenChange,
  title,
  questions,
  personalFields,
}: SnipeQuestionsDialogProps) {
  const [activeTab, setActiveTab] = useState<"questions" | "personal">("questions")

  const formatTimeLimit = (timeLimit?: string) => {
    switch (timeLimit) {
      case "30_seconds":
        return "30 seconds"
      case "1_minute":
        return "1 minute"
      case "2_minutes":
        return "2 minutes"
      case "3_minutes":
        return "3 minutes"
      case "5_minutes":
        return "5 minutes"
      default:
        return "No limit"
    }
  }

  const formatFieldType = (type: string) => {
    switch (type) {
      case "text":
        return "Text input"
      case "dropdown":
        return "Dropdown selection"
      case "checkbox":
        return "Checkbox"
      default:
        return type
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex h-[500px]">
          {/* Left panel - Personal Details */}
          <div className="w-1/2 border-r p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-medium">Personal Details</h3>
            </div>
            
            {personalFields.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {personalFields.map((field) => (
                    <div key={field.id} className="p-4 rounded-xl border bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{field.label}</h4>
                        {field.required && (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Required</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatFieldType(field.type)}
                        {field.type === "dropdown" && field.dropdownOptions && (
                          <div className="mt-2">
                            <div className="text-xs font-medium text-gray-500 mb-1">Options:</div>
                            <div className="flex flex-wrap gap-1">
                              {field.dropdownOptions.map((option, i) => (
                                <span key={i} className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs">
                                  {option}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-500">
                <p>No personal details configured</p>
              </div>
            )}
          </div>
          
          {/* Right panel - Questions */}
          <div className="w-1/2 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-medium">Questions</h3>
            </div>
            
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="p-4 rounded-xl border bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Question {index + 1}</h4>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeLimit(question.timeLimit)}
                      </Badge>
                    </div>
                    <p className="mt-2">{question.value}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
