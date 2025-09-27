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
  
  // Reset currentDecision when the submission changes
  useEffect(() => {
    setCurrentDecision(decision);
  }, [submissionId, decision])
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [spaceKeyTimer, setSpaceKeyTimer] = useState<NodeJS.Timeout | null>(null)
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
  
  // Toggle video play/pause
  const togglePlayPause = () => {
    if (!videoRef.current) return
    
    if (videoRef.current.paused) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.error("Video play failed:", e))
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }
  
  // Create a ref for the dialog container
  const dialogRef = useRef<HTMLDivElement>(null)
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip handling if focus is on a video control or menu
      // This allows the native video controls to work properly
      const activeElement = document.activeElement;
      const isVideoControlFocused = 
        activeElement?.tagName === 'VIDEO' || 
        activeElement?.closest('video') || 
        activeElement?.hasAttribute('role') ||
        activeElement?.tagName === 'BUTTON' ||
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'SELECT';
      
      // If a video control has focus and it's not the spacebar, let the control handle it
      if (isVideoControlFocused && e.key !== " " && e.code !== "Space") {
        return;
      }
      
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
      
      // Handle Space key press for both toggle play/pause and speed control
      if (e.key === " " || e.code === "Space") {
        // Only handle spacebar if we're not in a text input or similar
        if (activeElement?.tagName !== 'INPUT' && 
            activeElement?.tagName !== 'TEXTAREA' && 
            activeElement?.tagName !== 'SELECT') {
          
          e.preventDefault() // Prevent default space behavior (page scroll)
          
          // Set a timer to detect if this is a press-and-hold or a quick tap
          const timer = setTimeout(() => {
            // This is a press-and-hold (longer than 200ms)
            setIsSpacePressed(true)
            
            // Set playback rate to 1.5x without changing play state
            if (videoRef.current) {
              // If video is paused, play it first
              if (videoRef.current.paused) {
                videoRef.current.play()
                  .then(() => {
                    videoRef.current!.playbackRate = 1.5
                    setIsPlaying(true)
                  })
                  .catch(e => console.error("Video play failed:", e))
              } else {
                // If already playing, just increase speed
                videoRef.current.playbackRate = 1.5
              }
            }
          }, 200)
          
          // Store the timer ID so we can clear it if needed
          setSpaceKeyTimer(timer)
        }
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      // Handle Space key release
      if (e.key === " " || e.code === "Space") {
        // Skip handling if focus is on a text input or similar
        const activeElement = document.activeElement;
        if (activeElement?.tagName === 'INPUT' || 
            activeElement?.tagName === 'TEXTAREA' || 
            activeElement?.tagName === 'SELECT') {
          return;
        }
        
        e.preventDefault()
        
        // If spacebar was being held down (speed control was active)
        if (isSpacePressed) {
          setIsSpacePressed(false)
          
          // Reset playback rate to normal without changing play state
          if (videoRef.current) {
            videoRef.current.playbackRate = 1.0
          }
          
          // Important: Do NOT toggle play/pause when releasing after speed control
          return
        } 
        
        // If there's a pending timer (this was a quick press)
        if (spaceKeyTimer) {
          // Clear the timer to prevent speed control from activating
          clearTimeout(spaceKeyTimer)
          setSpaceKeyTimer(null)
          
          // Toggle play/pause ONLY for quick press
          togglePlayPause()
        }
      }
    }
    
    // Add event listeners directly to the document to capture all keyboard events
    // regardless of which element has focus
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("keyup", handleKeyUp)
      
      // Clear any pending timers on cleanup
      if (spaceKeyTimer) {
        clearTimeout(spaceKeyTimer)
      }
    }
  }, [onClose, selectedVideoIndex, videos.length, hasPrevCard, hasNextCard, onPrevCard, onNextCard, isSpacePressed, spaceKeyTimer, togglePlayPause])
  
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
  
  // Add event listeners to keep track of video play/pause state
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return
    
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    
    // We're removing the aggressive focus management that was breaking the settings menu
    
    videoElement.addEventListener('play', handlePlay)
    videoElement.addEventListener('pause', handlePause)
    
    return () => {
      videoElement.removeEventListener('play', handlePlay)
      videoElement.removeEventListener('pause', handlePause)
    }
  }, [videoUrl])
  
  // Reset video URL when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setVideoUrl(null);
    }
  }, [isOpen])
 // Add body scroll lock when dialog is open
 useEffect(() => {
  if (isOpen) {
    // Save current scroll position
    const scrollY = window.scrollY;
    
    // Add styles to prevent scrolling on the body
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflowY = 'hidden';
    
    return () => {
      // Remove styles and restore scroll position when dialog closes
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      window.scrollTo(0, scrollY);
    };
  }
}, [isOpen])
  
  // We're removing the aggressive focus trap that was causing issues with the settings menu

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
            ref={dialogRef}
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
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              tabIndex={-1}
              className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors focus:outline-none"
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
                  <div className="w-full h-full relative">
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      className="w-full h-full object-contain"
                      controls
                      playsInline
                      controlsList="nodownload"
                      onKeyDown={(e) => {
                        // Only prevent spacebar default behavior
                        if (e.key === " " || e.code === "Space") {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      }}
                    />
                    {/* Speed indicator */}
                    {isSpacePressed && (
                      <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                        1.5x
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black flex-col">
                    <div className="text-white mb-2">Unable to load video</div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
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
                        // Immediately blur the button to prevent it from capturing keyboard events
                        (document.activeElement as HTMLElement)?.blur();
                      }}
                      tabIndex={-1}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
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
                            // Immediately blur the button to prevent it from capturing keyboard events
                            (document.activeElement as HTMLElement)?.blur();
                          }}
                          tabIndex={-1}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full text-white transition-colors focus:outline-none"
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
                            // Immediately blur the button to prevent it from capturing keyboard events
                            (document.activeElement as HTMLElement)?.blur();
                          }}
                          tabIndex={-1}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full text-white transition-colors focus:outline-none"
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
                      onClick={() => {
                        onVideoChange(index);
                        // Immediately blur the button to prevent it from capturing keyboard events
                        (document.activeElement as HTMLElement)?.blur();
                      }}
                      tabIndex={-1}
                      className={`text-left p-2 rounded-lg transition-colors focus:outline-none ${
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