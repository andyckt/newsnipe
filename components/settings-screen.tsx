"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuestionTab, AudioLanguage, TextInput, TimeLimit } from "./question-tab"
import { ConversationTab } from "./conversation-tab"
import PersonalDetailsSettings from "./personal-details-settings"
import { PersonalDetailsConfig } from "./personal-details-collector"

interface SettingsScreenProps {
  onLaunch: (numRecordings: number, language: AudioLanguage, textInputs: TextInput[], mode: "question" | "conversation", timeLimit: TimeLimit) => void
  personalDetailsConfig: PersonalDetailsConfig
  onPersonalDetailsConfigChange: (config: PersonalDetailsConfig) => void
  title?: string
  onTitleChange?: (title: string) => void
}

export function SettingsScreen({ onLaunch, personalDetailsConfig, onPersonalDetailsConfigChange, title = "Untitled Snipe", onTitleChange }: SettingsScreenProps) {
  const [activeTab, setActiveTab] = useState<"question" | "conversation" | "personal_details">("personal_details")
  const [language, setLanguage] = useState<AudioLanguage>("english")
  const [snipeTitle, setSnipeTitle] = useState<string>(title)
  
  // Add state for question tab
  const [questionTextInputs, setQuestionTextInputs] = useState<TextInput[]>([])
  const [audioChecked, setAudioChecked] = useState<boolean>(false)
  
  const handleLanguageChange = (newLanguage: AudioLanguage) => {
    setLanguage(newLanguage)
  }
  
  const handleTitleChange = (newTitle: string) => {
    setSnipeTitle(newTitle)
    if (onTitleChange) {
      onTitleChange(newTitle)
    }
  }
  
  return (
    <div className="flex flex-col w-full">
      
      <div className="w-full mb-6 max-w-2xl">
        <label htmlFor="snipe-title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          id="snipe-title"
          type="text"
          value={snipeTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter a title for this snipe"
        />
      </div>
      
      <Tabs 
        value={activeTab}
        defaultValue="personal_details" 
        className="w-full"
        onValueChange={(value) => setActiveTab(value as "question" | "conversation" | "personal_details")}
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="personal_details">Personal Details</TabsTrigger>
          <TabsTrigger value="question">Snipe Questions</TabsTrigger>
          {/* Conversation mode temporarily disabled until future implementation */}
          {/* <TabsTrigger value="conversation">By Conversation</TabsTrigger> */}
        </TabsList>
        
        <TabsContent value="question" className="w-full">
          <QuestionTab 
            onLaunch={onLaunch} 
            language={language} 
            onLanguageChange={handleLanguageChange}
            savedTextInputs={questionTextInputs}
            onTextInputsChange={setQuestionTextInputs}
            audioCheckedState={audioChecked}
            onAudioCheckedChange={setAudioChecked}
          />
        </TabsContent>
        
        {/* Conversation mode temporarily disabled until future implementation
        <TabsContent value="conversation" className="w-full">
          <ConversationTab onLaunch={onLaunch} language={language} />
        </TabsContent>
        */}
        
        <TabsContent value="personal_details" className="w-full">
          <div className="mb-8">
            <PersonalDetailsSettings 
              config={personalDetailsConfig}
              onConfigChange={onPersonalDetailsConfigChange}
            />
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={() => setActiveTab("question")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-4 text-xl rounded-full"
            >
              Continue to Questions
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}