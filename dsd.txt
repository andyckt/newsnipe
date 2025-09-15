"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface VideoPlayerDialogProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title: string
  candidate: string
  duration?: string
  date?: string
}

export function VideoPlayerDialog({
  isOpen,
  onClose,
  videoUrl,
  title,
  candidate,
  duration,
  date
}: VideoPlayerDialogProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Handle escape key to close dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])
  
  // Play/pause video when dialog opens/closes
  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Video play failed:", e))
    } else if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 sm:p-8"
          onClick={onClose}
        >
          {/* Dialog Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
            
            {/* Video Player - Left Side */}
            <div className="md:w-1/2 bg-black relative">
              <div className="aspect-[9/16] md:h-full">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                  controlsList="nodownload"
                />
              </div>
            </div>
            
            {/* Video Info - Right Side */}
            <div className="p-5 md:w-1/2 md:overflow-y-auto flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-gray-600 mb-3">{candidate}</p>
              
              {/* Additional video information can go here */}
              <div className="mt-3 space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Duration</h4>
                  <p className="text-gray-900">{duration || "N/A"}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Recorded on</h4>
                  <p className="text-gray-900">{date || "N/A"}</p>
                </div>
                
                <div className="pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                  <p className="text-gray-700 text-sm">
                    This interview covers the candidate's background, experience, and suitability for the position.
                    The candidate demonstrates strong communication skills and relevant expertise in the field.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
