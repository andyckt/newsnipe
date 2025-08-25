"use client"

import { useState } from "react"
import { QuestionTab, AudioLanguage, TextInput, TimeLimit } from "./question-tab"
import { ConversationTab } from "./conversation-tab"
import PersonalDetailsSettings from "./personal-details-settings"
import { PersonalDetailsConfig } from "./personal-details-collector"
import { Button } from "@/components/ui/button"

interface SettingsScreenProps {
  onLaunch: (numRecordings: number, language: AudioLanguage, textInputs: TextInput[], mode: "question" | "conversation", timeLimit: TimeLimit) => void
  personalDetailsConfig: PersonalDetailsConfig
  onPersonalDetailsConfigChange: (config: PersonalDetailsConfig) => void
}

export function SettingsScreen({ onLaunch, personalDetailsConfig, onPersonalDetailsConfigChange }: SettingsScreenProps) {
  const [language, setLanguage] = useState<AudioLanguage>("english")
  
  const handleLanguageChange = (newLanguage: AudioLanguage) => {
    setLanguage(newLanguage)
  }
  
  return (
    <div className="flex flex-col h-full w-full bg-white p-8 items-center justify-center">
      <h1 className="text-3xl font-bold mb-8">Camera Recorder Settings</h1>
      
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
        
        {/* Conversation mode temporarily disabled until future implementation */}
      </div>
    </div>
  )
}