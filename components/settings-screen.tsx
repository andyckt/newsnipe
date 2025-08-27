"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { QuestionTab, AudioLanguage, TextInput, TimeLimit } from "./question-tab"
import { ConversationTab } from "./conversation-tab"
import PersonalDetailsSettings from "./personal-details-settings"
import { PersonalDetailsConfig } from "./personal-details-collector"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Languages, Check } from "lucide-react"

interface SettingsScreenProps {
  onLaunch: (numRecordings: number, language: AudioLanguage, textInputs: TextInput[], mode: "question" | "conversation", timeLimit: TimeLimit) => void
  personalDetailsConfig: PersonalDetailsConfig
  onPersonalDetailsConfigChange: (config: PersonalDetailsConfig) => void
  currentStep?: number
  totalSteps?: number
}

export function SettingsScreen({ 
  onLaunch, 
  personalDetailsConfig, 
  onPersonalDetailsConfigChange,
  currentStep = 1,
  totalSteps = 4
}: SettingsScreenProps) {
  const [language, setLanguage] = useState<AudioLanguage>("english")
  
  const handleLanguageChange = (newLanguage: AudioLanguage) => {
    setLanguage(newLanguage)
  }
  
  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Language step
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Select Interview Language</h3>
            </div>
            
            <RadioGroup
              value={language}
              onValueChange={(value: AudioLanguage) => handleLanguageChange(value)}
              className="space-y-4"
            >
              <div
                className={`border rounded-xl p-4 cursor-pointer transition-all ${
                  language === "english" ? "border-blue-500 bg-blue-50/50" : "hover:bg-muted/50"
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
                    <p className="text-sm text-muted-foreground">Audio prompts will be in English</p>
                  </div>
                  {language === "english" && <Check className="h-5 w-5 text-blue-600" />}
                </div>
              </div>

              <div
                className={`border rounded-xl p-4 cursor-pointer transition-all ${
                  language === "mandarin" ? "border-red-500 bg-red-50/50" : "hover:bg-muted/50"
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
                    <p className="text-sm text-muted-foreground">Audio prompts will be in Mandarin</p>
                  </div>
                  {language === "mandarin" && <Check className="h-5 w-5 text-red-600" />}
                </div>
              </div>
            </RadioGroup>
          </div>
        )

      case 2: // Personal Details step
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Personal Details Configuration</h3>
              <p className="text-muted-foreground">Configure what personal information to collect</p>
            </div>
            
            <PersonalDetailsSettings 
              config={personalDetailsConfig}
              onConfigChange={onPersonalDetailsConfigChange}
            />
          </div>
        )

      case 3: // Questions step
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Interview Questions</h3>
              <p className="text-muted-foreground">Create questions that will be asked during recording</p>
            </div>
            
            <QuestionTab 
              onLaunch={onLaunch} 
              language={language} 
              onLanguageChange={handleLanguageChange} 
              hideTitle={true}
              hideSubmitButton={true}
            />
          </div>
        )

      default:
        return (
          <div className="w-full max-w-md mb-8">
            {/* Audio Language Section */}
            <div className="mb-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">Audio Language</span>
                </div>
              </div>
              <div className="flex flex-col items-center mb-8">
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleLanguageChange("english")}
                    className={`px-6 py-2 rounded-full ${
                      language === "english" 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-200 text-black hover:bg-gray-300"
                    }`}
                  >
                    English
                  </Button>
                  
                  <Button
                    onClick={() => handleLanguageChange("mandarin")}
                    className={`px-6 py-2 rounded-full ${
                      language === "mandarin" 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-200 text-black hover:bg-gray-300"
                    }`}
                  >
                    Mandarin
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Personal Details Section */}
            <div className="mb-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">Personal Details</span>
                </div>
              </div>
              <PersonalDetailsSettings 
                config={personalDetailsConfig}
                onConfigChange={onPersonalDetailsConfigChange}
              />
            </div>
            
            {/* Separator */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">Question Settings</span>
              </div>
            </div>
            
            {/* Question Settings Section */}
            <div className="w-full">
              <QuestionTab 
                onLaunch={onLaunch} 
                language={language} 
                onLanguageChange={handleLanguageChange} 
              />
            </div>
          </div>
        )
    }
  }
  
  return (
    <div className="flex flex-col h-full w-full bg-white items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl"
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}