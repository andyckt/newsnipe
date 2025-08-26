import { motion } from "framer-motion"
import type React from "react"

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  countdown: number | null
  recordingTimeLeft?: number | null
}

export function CameraView({ videoRef, countdown, recordingTimeLeft }: CameraViewProps) {
  return (
    <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover scale-x-[-1]" // Mirror the video
      />

      {/* Countdown Overlay */}
      {countdown && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-white text-8xl font-bold drop-shadow-lg"
          >
            {countdown}
          </motion.div>
        </motion.div>
      )}

      {/* Recording Time Left */}
      {recordingTimeLeft !== null && recordingTimeLeft !== undefined && (
        <div className="absolute top-16 right-4 bg-black bg-opacity-50 rounded-lg px-3 py-1">
          <div className="text-white text-xl font-semibold flex items-center">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-3 h-3 rounded-full bg-red-500 mr-2"
            />
            {Math.floor(recordingTimeLeft / 60)}:{(recordingTimeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>
      )}

      {/* Recording Indicator */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 bg-black bg-opacity-50 rounded-lg px-3 py-1">
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-3 h-3 rounded-full bg-red-500"
          />
          <span className="text-white text-sm font-medium">REC</span>
        </div>
      </div>
    </div>
  )
}