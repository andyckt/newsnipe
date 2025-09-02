"use client"

import { useState, useEffect } from "react"
import { SnipePage } from "@/components/snipe-page"

// This component handles the legacy /snipe?data=... route
export default function SnipeWithUrlParams() {
  const [urlData, setUrlData] = useState<string | null>(null)
  
  // Extract URL parameters on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const paramsData = urlParams.get('data')
        
        if (paramsData) {
          setUrlData(paramsData)
        } else {
          // If no data is provided, redirect to the main page
          window.location.href = '/'
        }
      } catch (error) {
        console.error("Error parsing URL parameters:", error)
        // If there's an error, redirect to the main page
        window.location.href = '/'
      }
    }
  }, [])
  
  // If we have URL data, render the shared SnipePage component
  if (urlData) {
    return <SnipePage urlData={urlData} />
  }
  
  // Show loading state while extracting URL parameters
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white md:bg-gray-100 md:items-center md:justify-center">
      <div className="flex flex-col h-full w-full bg-white md:max-w-sm md:h-screen p-8 items-center justify-center text-center">
        <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        <p className="text-lg">
          Please wait while we prepare your recording session.
        </p>
      </div>
    </div>
  )
}
