"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Play } from "lucide-react"
import { VideoPlayerDialog } from "@/components/video-player-dialog"

interface SnipeVideo {
  id: number;
  title: string;
  candidate: string;
  thumbnail: string;
  videoUrl: string;
  aspectRatio: string;
  duration: string;
  status: string;
  date: string;
}

const snipeVideos: SnipeVideo[] = [
  {
    id: 1,
    title: "Exchange Program Interview - Sarah Chen",
    candidate: "Sarah Chen",
    thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&h=1376&q=80",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    aspectRatio: "9/16",
    duration: "12:34",
    status: "completed",
    date: "2024-01-15",
  },
  {
    id: 2,
    title: "Teaching Position Assessment - Michael Rodriguez",
    candidate: "Michael Rodriguez",
    thumbnail: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&h=1376&q=80",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    aspectRatio: "9/16",
    duration: "8:45",
    status: "completed",
    date: "2024-01-14",
  },
  {
    id: 3,
    title: "Graduate Admission Interview - Emma Thompson",
    candidate: "Emma Thompson",
    thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&h=1376&q=80",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    aspectRatio: "9/16",
    duration: "15:22",
    status: "completed",
    date: "2024-01-13",
  },
  {
    id: 4,
    title: "Physics Assessment - David Kim",
    candidate: "David Kim",
    thumbnail: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&h=1376&q=80",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    aspectRatio: "9/16",
    duration: "10:18",
    status: "completed",
    date: "2024-01-12",
  },
  {
    id: 5,
    title: "Leadership Program - Lisa Wang",
    candidate: "Lisa Wang",
    thumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&h=1376&q=80",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    aspectRatio: "9/16",
    duration: "14:07",
    status: "completed",
    date: "2024-01-11",
  },
  {
    id: 6,
    title: "Research Position - James Miller",
    candidate: "James Miller",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&h=1376&q=80",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    aspectRatio: "9/16",
    duration: "11:33",
    status: "completed",
    date: "2024-01-10",
  },
  {
    id: 7,
    title: "Study Abroad Program - Maria Garcia",
    candidate: "Maria Garcia",
    thumbnail: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&h=1376&q=80",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    aspectRatio: "9/16",
    duration: "9:28",
    status: "completed",
    date: "2024-01-09",
  },
  {
    id: 8,
    title: "Internship Assessment - Alex Johnson",
    candidate: "Alex Johnson",
    thumbnail: "https://images.unsplash.com/photo-1504203772830-87fba72385ee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&h=1376&q=80",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    aspectRatio: "9/16",
    duration: "13:15",
    status: "completed",
    date: "2024-01-08",
  },
]

export function SubmissionsTab() {
  const [selectedVideo, setSelectedVideo] = useState<SnipeVideo | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleOpenVideo = (video: SnipeVideo) => {
    setSelectedVideo(video)
    setIsDialogOpen(true)
  }

  const handleCloseVideo = () => {
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-3 pt-0">
      {/* Video Player Dialog - Rendered outside the flow */}
      <div className="fixed-layer">
        {selectedVideo && (
          <VideoPlayerDialog
            isOpen={isDialogOpen}
            onClose={handleCloseVideo}
            videoUrl={selectedVideo.videoUrl}
            title={selectedVideo.title}
            candidate={selectedVideo.candidate}
            duration={selectedVideo.duration}
            date={selectedVideo.date}
          />
        )}
      </div>

      {/* Masonry Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
      >
        {snipeVideos.map((video: SnipeVideo, index: number) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="mb-6 break-inside-avoid"
          >
            <Card 
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 rounded-3xl border-0 bg-white group"
              onClick={() => handleOpenVideo(video)}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
                e.currentTarget.style.transition = 'transform 0.2s';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.transition = 'transform 0.2s';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.transition = 'transform 0.2s';
              }}
            >
              {/* Thumbnail Container */}
              <div
                className="relative bg-gray-100 overflow-hidden"
                style={{ aspectRatio: video.aspectRatio }}
              >
                <img
                  src={video.thumbnail || "/placeholder.svg"}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="p-4 bg-white/90 rounded-full backdrop-blur-sm">
                    <Play className="h-8 w-8 text-gray-800 ml-1" />
                  </div>
                </div>
              </div>

              {/* Title and Candidate - Below Thumbnail */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2 leading-tight">{video.title}</h3>
                <p className="text-gray-600 text-sm font-medium">{video.candidate}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}