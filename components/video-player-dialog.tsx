"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Video {
  url: string;
  title?: string;
  duration?: string;
}

interface PersonalDetail {
  question: string;
  answer: string;
}

interface VideoPlayerDialogProps {
  isOpen: boolean
  onClose: () => void
  videos: Video[]
  selectedVideoIndex: number
  onVideoChange: (index: number) => void
  title: string
  candidate: string
  date?: string
  personalDetails?: PersonalDetail[]
}

export function VideoPlayerDialog({
  isOpen,
  onClose,
  videos,
  selectedVideoIndex,
  onVideoChange,
  title,
  candidate,
  date,
  personalDetails
}: VideoPlayerDialogProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const currentVideo = videos[selectedVideoIndex]
  
  const handlePrevVideo = () => {
    if (selectedVideoIndex > 0) {
      onVideoChange(selectedVideoIndex - 1)
    }
  }
  
  const handleNextVideo = () => {
    if (selectedVideoIndex < videos.length - 1) {
      onVideoChange(selectedVideoIndex + 1)
    }
  }
  
  // Handle escape key to close dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])
  
  // Play/pause video when dialog opens/closes or video changes
  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Video play failed:", e))
    } else if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [isOpen, selectedVideoIndex])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 sm:p-8"
          onClick={onClose}
        >
          {/* Dialog Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
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
            <div 
              className="md:w-2/5 bg-black relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="aspect-[9/16] md:h-full relative">
                <video
                  ref={videoRef}
                  src={currentVideo.url}
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                  controlsList="nodownload"
                />
                
                {/* Navigation Controls - Only visible on hover */}
                <AnimatePresence>
                  {isHovering && (
                    <>
                      {/* Previous Video Button */}
                      {selectedVideoIndex > 0 && (
                        <motion.button
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrevVideo();
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full text-white transition-colors"
                          aria-label="Previous video"
                        >
                          <ChevronLeft size={24} />
                        </motion.button>
                      )}
                      
                      {/* Next Video Button */}
                      {selectedVideoIndex < videos.length - 1 && (
                        <motion.button
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextVideo();
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full text-white transition-colors"
                          aria-label="Next video"
                        >
                          <ChevronRight size={24} />
                        </motion.button>
                      )}
                      
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Video Info - Right Side */}
            <div className="p-5 md:w-3/5 md:overflow-y-auto flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-gray-600 mb-3">{candidate}</p>
              
              {/* Video selection tabs */}
              <div className="mb-4">
                <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-2">
                  {videos.map((video, index) => (
                    <button
                      key={index}
                      onClick={() => onVideoChange(index)}
                      className={`text-left p-2 rounded-lg transition-colors ${
                        selectedVideoIndex === index
                          ? "bg-gray-100 border-l-4 border-blue-500"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-medium text-sm">{video.title || `Video ${index + 1}`}</p>
                      {video.duration && (
                        <p className="text-xs text-gray-500 mt-0.5">{video.duration}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tabs for content */}
              <div className="mt-4">
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="info">Info</TabsTrigger>
                  </TabsList>
                  
                  {/* Personal Details Tab */}
                  <TabsContent value="details" className="mt-4">
                    {personalDetails && personalDetails.length > 0 ? (
                      <div className="space-y-4">
                        {personalDetails.map((detail, index) => (
                          <div key={index}>
                            <h5 className="text-xs font-medium text-gray-500">{detail.question}</h5>
                            <p className="text-sm text-gray-900">{detail.answer}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No personal details available.</p>
                    )}
                  </TabsContent>
                  
                  {/* Video Info Tab */}
                  <TabsContent value="info" className="mt-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Recorded on</h4>
                      <p className="text-gray-900">{date || "N/A"}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                      <p className="text-gray-700 text-sm">
                        This interview covers the candidate's background, experience, and suitability for the position.
                        The candidate demonstrates strong communication skills and relevant expertise in the field.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}