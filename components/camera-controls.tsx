"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { unlockAudio } from "@/lib/audio"
import { initAudioContext } from "@/lib/mobile-audio"
import { Camera, Mic, MicOff, Video, VideoOff, ChevronRight, CheckCircle } from "lucide-react"

interface CameraControlsProps {
  showPermissionButton: boolean
  hasPermission: boolean
  isRecording: boolean
  isCountingDown: boolean
  currentRecordingIndex: number
  totalRecordings: number
  isLastRecording: boolean
  onRequestPermissions: () => void
  onStartRecording: () => void
  onNextRecording: () => void
  onCompleteSession: () => void
}

export function CameraControls({
  showPermissionButton,
  hasPermission,
  isRecording,
  isCountingDown,
  currentRecordingIndex,
  totalRecordings,
  isLastRecording,
  onRequestPermissions,
  onStartRecording,
  onNextRecording,
  onCompleteSession,
}: CameraControlsProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
      <div className="flex flex-col items-center gap-4">
        {/* Recording progress indicator */}
        {hasPermission && (
          <div className="text-white text-sm mb-2">
            {isRecording || isCountingDown ? (
              <span>Recording {currentRecordingIndex + 1} of {totalRecordings}</span>
            ) : (
              <span>
                {currentRecordingIndex === 0 
                  ? '' 
                  : currentRecordingIndex === totalRecordings 
                    ? 'All recordings complete' 
                    : `${currentRecordingIndex} of ${totalRecordings} recordings complete`}
              </span>
            )}
          </div>
        )}

        <div className="flex justify-center gap-4">
          {showPermissionButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                onClick={() => {
                  unlockAudio(); // Unlock audio on user interaction
                  initAudioContext(); // Initialize Web Audio API context
                  onRequestPermissions();
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-full min-w-[180px]"
              >
                <Camera className="h-4 w-4 mr-2" />
                Enable Camera
              </Button>
            </motion.div>
          )}

          {hasPermission && !isRecording && !isCountingDown && currentRecordingIndex === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                onClick={() => {
                  unlockAudio(); // Unlock audio on user interaction
                  initAudioContext(); // Initialize Web Audio API context
                  onStartRecording();
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-full min-w-[180px]"
              >
                <Video className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            </motion.div>
          )}

          {isRecording && !isLastRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                onClick={() => {
                  unlockAudio(); // Unlock audio on user interaction
                  initAudioContext(); // Initialize Web Audio API context
                  onNextRecording();
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-full min-w-[180px]"
              >
                Next Question
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {isRecording && isLastRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                onClick={() => {
                  unlockAudio(); // Unlock audio on user interaction
                  initAudioContext(); // Initialize Web Audio API context
                  onCompleteSession();
                }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-full min-w-[180px]"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </Button>
            </motion.div>
          )}
        </div>

        {/* Audio/Video controls */}
        {hasPermission && (isRecording || isCountingDown) && (
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-black bg-opacity-50 border-white border-opacity-30 text-white h-10 w-10"
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-black bg-opacity-50 border-white border-opacity-30 text-white h-10 w-10"
            >
              <Video className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}