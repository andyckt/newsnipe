"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowRight, Check, Loader2 } from "lucide-react"

export interface PersonalDetailField {
  id: string
  label: string
  type: "text" | "dropdown" | "checkbox"
  required: boolean
  dropdownOptions?: string[]
  allowMultiple?: boolean
}

export interface PersonalDetailsConfig {
  includePersonalDetails: boolean
  personalFields: PersonalDetailField[]
}

export interface PersonalDetailsResponse {
  [key: string]: string | string[] | boolean
}

interface PersonalDetailsCollectorProps {
  config: PersonalDetailsConfig
  onComplete: (responses: PersonalDetailsResponse, responseId?: string) => void
  shortId: string  // The shortId of the Snipe
}

export default function PersonalDetailsCollector({ config, onComplete, shortId }: PersonalDetailsCollectorProps) {
  const { includePersonalDetails, personalFields } = config
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0)
  const [responses, setResponses] = useState<PersonalDetailsResponse>({})
  const [currentResponse, setCurrentResponse] = useState<string | string[] | boolean>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [responseId, setResponseId] = useState<string | null>(null)

  // If personal details collection is disabled, complete with empty data
  React.useEffect(() => {
    if (!includePersonalDetails || personalFields.length === 0) {
      // Complete with empty data instead of skipping
      onComplete({})
    }
  }, [includePersonalDetails, personalFields, onComplete])

  if (!includePersonalDetails || personalFields.length === 0) {
    return null
  }

  const currentField = personalFields[currentFieldIndex]
  const isLastField = currentFieldIndex === personalFields.length - 1
  const progress = ((currentFieldIndex + 1) / personalFields.length) * 100

  const handleNext = async () => {
    // Save current response
    const updatedResponses = {
      ...responses,
      [currentField.id]: currentResponse
    };
    
    setResponses(updatedResponses);

    if (isLastField) {
      try {
        setIsSubmitting(true);
        
        // Submit personal details to the API
        const response = await fetch('/api/snipe/response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            snipeShortId: shortId,
            personalDetails: {
              ...updatedResponses,
              [currentField.id]: currentResponse
            }
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save personal details');
        }
        
        const data = await response.json();
        setResponseId(data.responseId);
        
        // Complete the form and pass the responses and responseId to the parent component
        onComplete(
          {
            ...updatedResponses,
            [currentField.id]: currentResponse
          },
          data.responseId
        );
      } catch (error) {
        console.error('Error saving personal details:', error);
        // Even if there's an error, we'll still proceed to the next stage
        // but we'll log the error
        onComplete({
          ...updatedResponses,
          [currentField.id]: currentResponse
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Move to next field
      setCurrentFieldIndex(prev => prev + 1);
      // Reset current response based on the next field type
      const nextField = personalFields[currentFieldIndex + 1];
      if (nextField.type === "checkbox") {
        setCurrentResponse(false);
      } else if (nextField.type === "dropdown" && nextField.allowMultiple) {
        setCurrentResponse([]);
      } else {
        setCurrentResponse("");
      }
    }
  }

  const isNextDisabled = () => {
    if (!currentField.required) return false
    
    if (typeof currentResponse === "string") {
      return currentResponse.trim() === ""
    } else if (Array.isArray(currentResponse)) {
      return currentResponse.length === 0
    }
    
    return false
  }

  const renderField = () => {
    switch (currentField.type) {
      case "text":
        return (
          <Input
            value={currentResponse as string}
            onChange={(e) => setCurrentResponse(e.target.value)}
            placeholder="Enter here"
            className="w-full text-lg p-4 h-14"
            autoFocus
          />
        )
      case "dropdown":
        if (currentField.allowMultiple) {
          return (
            <div className="space-y-3">
              {currentField.dropdownOptions?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`option-${index}`}
                    checked={(currentResponse as string[]).includes(option)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCurrentResponse([...(currentResponse as string[]), option])
                      } else {
                        setCurrentResponse((currentResponse as string[]).filter(item => item !== option))
                      }
                    }}
                  />
                  <Label htmlFor={`option-${index}`} className="text-lg">{option}</Label>
                </div>
              ))}
            </div>
          )
        } else {
          return (
            <Select
              value={currentResponse as string}
              onValueChange={setCurrentResponse as (value: string) => void}
            >
              <SelectTrigger className="w-full text-lg p-4 h-14">
                <SelectValue placeholder="Select here" />
              </SelectTrigger>
              <SelectContent>
                {currentField.dropdownOptions?.map((option, index) => (
                  <SelectItem key={index} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        }
      /* Checkbox option temporarily disabled - may be added back in future version
         The checkbox is primarily used for terms acceptance, but we're simplifying the UI for now */
      case "checkbox":
        return (
          <div className="flex items-center space-x-3">
            <Checkbox
              id="terms"
              checked={currentResponse as boolean}
              onCheckedChange={setCurrentResponse as (checked: boolean) => void}
            />
            <Label htmlFor="terms" className="text-lg">{currentField.label}</Label>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-white relative">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div 
          className="h-full bg-blue-500 transition-all duration-500 ease-in-out" 
          style={{ width: `${progress}%` }} 
        />
      </div>
      
      {/* Branding */}
      <div className="absolute bottom-4 right-4 text-gray-400 text-sm">
        <span style={{ fontFamily: "'Century Gothic', 'CenturyGothic', 'AppleGothic', sans-serif" }}>
          Powered by <span style={{ color: "#1649ff" }}>Snipe</span>
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-lg mx-auto w-full">
        <div className="w-full space-y-8 animate-fadeIn">
          <h2 className="text-2xl font-bold text-center">{currentField.label}</h2>
          
          <div className="w-full">
            {renderField()}
          </div>

          <div className="flex justify-between pt-4">
            {currentFieldIndex > 0 ? (
              <Button 
                variant="ghost"
                onClick={() => {
                  setCurrentFieldIndex(prev => prev - 1)
                  // Restore previous response
                  const prevField = personalFields[currentFieldIndex - 1]
                  setCurrentResponse(responses[prevField.id] || "")
                }}
              >
                Back
              </Button>
            ) : (
              <div>{/* Empty div to maintain layout */}</div>
            )}
            
            <Button
              onClick={handleNext}
              disabled={isNextDisabled() || isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full"
            >
              {isSubmitting ? (
                <>
                  Saving <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : isLastField ? (
                <>
                  Complete <Check className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
