"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { LaunchRecorderTab } from "@/components/dashboard/tabs/launch-recorder-tab"
import { unlockAudio } from "@/lib/audio"
import { initAudioContext } from "@/lib/mobile-audio"
import { TextInput, AudioLanguage, TimeLimit } from "@/components/question-tab"
import { PersonalDetailsConfig } from "@/components/personal-details-collector"

export default function SnipePage() {
  const searchParams = useSearchParams()
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Try to unlock audio on component mount
  useEffect(() => {
    unlockAudio()
    initAudioContext()
    
    // Add event listeners to unlock audio on any user interaction
    const unlockOnUserInteraction = () => {
      unlockAudio()
      initAudioContext()
      
      // Remove event listeners after first interaction
      document.removeEventListener('click', unlockOnUserInteraction)
      document.removeEventListener('touchstart', unlockOnUserInteraction)
      document.removeEventListener('touchend', unlockOnUserInteraction)
    }
    
    document.addEventListener('click', unlockOnUserInteraction)
    document.addEventListener('touchstart', unlockOnUserInteraction)
    document.addEventListener('touchend', unlockOnUserInteraction)
    
    return () => {
      document.removeEventListener('click', unlockOnUserInteraction)
      document.removeEventListener('touchstart', unlockOnUserInteraction)
      document.removeEventListener('touchend', unlockOnUserInteraction)
    }
  }, [])

  // Set isLoaded to true after component mounts to ensure we're in the browser
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Parse settings from URL parameters
  const parseSettings = () => {
    if (!searchParams) return null
    
    try {
      const settingsParam = searchParams.get('settings')
      if (!settingsParam) return null
      
      const decodedSettings = decodeURIComponent(settingsParam)
      return JSON.parse(decodedSettings)
    } catch (error) {
      console.error('Failed to parse settings from URL:', error)
      return null
    }
  }

  const initialSettings = isLoaded ? parseSettings() : null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4">
        {isLoaded && (
          <LaunchRecorderTab 
            initialState="personal_details" 
            initialSettings={initialSettings}
          />
        )}
      </div>
    </div>
  )
}
