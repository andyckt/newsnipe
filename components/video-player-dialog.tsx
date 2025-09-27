"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { SubmissionDecision } from "./submission-decision"

interface Video {
  videoKey: string;
  videoUrl?: string;
  title?: string;
  duration?: string;
  thumbnailUrl?: string | null;
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
  title?: string
  candidate?: string
  date?: string
  personalDetails?: PersonalDetail[]
  onNextCard?: () => void
  onPrevCard?: () => void
  hasNextCard?: boolean
  hasPrevCard?: boolean
  submissionId?: string
  decision?: string
  onDecision?: (submissionId: string, decision: string) => void
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
  personalDetails,
  onNextCard,
  onPrevCard,
  hasNextCard = false,
  hasPrevCard = false,
  submissionId,
  decision,
  onDecision
}: VideoPlayerDialogProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isLoadingVideo, setIsLoadingVideo] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [currentDecision, setCurrentDecision] = useState<string | undefined>(decision)
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
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close dialog on Escape
      if (e.key === "Escape") onClose()
      
      // Navigate to previous video on ArrowUp
      if (e.key === "ArrowUp" && selectedVideoIndex > 0) {
        e.preventDefault() // Prevent default scroll behavior
        handlePrevVideo()
      }
      
      // Navigate to next video on ArrowDown
      if (e.key === "ArrowDown" && selectedVideoIndex < videos.length - 1) {
        e.preventDefault() // Prevent default scroll behavior
        handleNextVideo()
      }
      
      // Navigate to previous card on ArrowLeft
      if (e.key === "ArrowLeft" && hasPrevCard && onPrevCard) {
        e.preventDefault()
        onPrevCard()
      }
      
      // Navigate to next card on ArrowRight
      if (e.key === "ArrowRight" && hasNextCard && onNextCard) {
        e.preventDefault()
        onNextCard()
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose, selectedVideoIndex, videos.length, hasPrevCard, hasNextCard, onPrevCard, onNextCard])
  
  // Process video key when video changes
  useEffect(() => {
    const processVideoKey = async () => {
      if (!isOpen || !currentVideo?.videoKey) return;
      
      try {
        setIsLoadingVideo(true);
        
        // Check if the video key is a Cloudinary key
        if (currentVideo.videoKey.startsWith('cloudinary:')) {
          // For Cloudinary videos, we should already have a direct URL stored
          // in the database, so we can use that directly
          if (currentVideo.videoUrl) {
            setVideoUrl(currentVideo.videoUrl);
          } else {
            // If for some reason we don't have the URL, try to construct it
            const publicId = currentVideo.videoKey.replace('cloudinary:', '');
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dzdjiudg1';
            
            // Use a direct URL with current timestamp as version
            const version = Date.now();
            const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/video/upload/v${version}/${publicId}.mp4`;
            
            setVideoUrl(cloudinaryUrl);
          }
        } else {
          // Fall back to S3 presigned URL for backward compatibility
          const response = await fetch(`/api/submissions/presigned-video-url?key=${encodeURIComponent(currentVideo.videoKey)}`);
          
          if (!response.ok) {
            throw new Error('Failed to get video URL');
          }
          
          const data = await response.json();
          setVideoUrl(data.url);
        }
      } catch (error) {
        console.error('Error processing video key:', error);
        // Use a fallback or show error
        setVideoUrl(null);
      } finally {
        setIsLoadingVideo(false);
      }
    };
    
    processVideoKey();
  }, [isOpen, currentVideo, selectedVideoIndex]);
  
  // Play/pause video when URL is available
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Video play failed:", e))
    } else if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [videoUrl])
  
  // Reset video URL when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setVideoUrl(null);
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
            onKeyDown={(e) => e.stopPropagation()}
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
                {isLoadingVideo ? (
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    <Loader2 className="h-10 w-10 animate-spin text-white" />
                    <span className="ml-2 text-white">Loading video...</span>
                  </div>
                ) : videoUrl ? (
                  <div className="w-full h-full">
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      className="w-full h-full object-contain"
                      controls
                      playsInline
                      controlsList="nodownload"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black flex-col">
                    <div className="text-white mb-2">Unable to load video</div>
                    <button 
                      onClick={() => {
                        // Retry loading the video
                        if (currentVideo?.videoKey) {
                          setIsLoadingVideo(true);
                          
                          // Check if the video key is a Cloudinary key
                          if (currentVideo.videoKey.startsWith('cloudinary:')) {
                            // For Cloudinary videos, we should already have a direct URL stored
                            if (currentVideo.videoUrl) {
                              setVideoUrl(currentVideo.videoUrl);
                              setIsLoadingVideo(false);
                            } else {
                              // If for some reason we don't have the URL, try to construct it
                              const publicId = currentVideo.videoKey.replace('cloudinary:', '');
                              const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dzdjiudg1';
                              
                              // Use a direct URL with current timestamp as version
                              const version = Date.now();
                              const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/video/upload/v${version}/${publicId}.mp4`;
                              
                              setVideoUrl(cloudinaryUrl);
                              setIsLoadingVideo(false);
                            }
                          } else {
                            // Fall back to S3 presigned URL for backward compatibility
                            fetch(`/api/submissions/presigned-video-url?key=${encodeURIComponent(currentVideo.videoKey)}`)
                              .then(res => res.json())
                              .then(data => {
                                setVideoUrl(data.url);
                                setIsLoadingVideo(false);
                              })
                              .catch(err => {
                                console.error(err);
                                setIsLoadingVideo(false);
                              });
                          }
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Retry
                    </button>
                  </div>
                )}
                
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
            <div className="p-5 md:w-3/5 md:overflow-y-auto flex flex-col relative">
              {/* Title and candidate info - commented out as requested
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-gray-600 mb-3">{candidate}</p>
              */}
              
              {/* Snipe Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{title || "Untitled Snipe"}</h3>
              
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
              
              {/* Content section - all displayed directly */}
              <div className="mt-4 space-y-6 pb-24">
                {/* Personal Details Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700">Personal Details</h4>
                  {personalDetails && personalDetails.length > 0 ? (
                    <div className="max-h-[180px] overflow-y-auto pr-2 space-y-4">
                      {personalDetails.map((detail, index) => (
                        <div key={index} className="pb-2">
                          <h5 className="text-xs font-medium text-gray-500">{detail.question}</h5>
                          <p className="text-sm text-gray-900">{detail.answer}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No personal details available.</p>
                  )}
                </div>
                
                {/* Video Info Section */}
                <div className="space-y-4 pt-2">
                  <div>
                    <h5 className="text-xs font-medium text-gray-500">Recorded on</h5>
                    <p className="text-gray-900">{date || "N/A"}</p>
                  </div>
                  
                  {/* Decision UI removed from here and moved to bottom */}
                </div>
              </div>
              
              {/* Decision UI - Fixed at bottom */}
              {submissionId && onDecision && (
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-white">
                  <SubmissionDecision 
                    currentDecision={currentDecision}
                    onDecision={(decision) => {
                      setCurrentDecision(decision || undefined);
                      onDecision(submissionId, decision);
                    }} 
                  />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}