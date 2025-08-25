"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Play } from "lucide-react"

const snipeVideos = [
  {
    id: 1,
    title: "Exchange Program Interview - Sarah Chen",
    candidate: "Sarah Chen",
    thumbnail: "/placeholder.svg?height=320&width=180",
    aspectRatio: "9/16", // Added 9:16 aspect ratio
    duration: "12:34",
    status: "completed",
    date: "2024-01-15",
  },
  {
    id: 2,
    title: "Teaching Position Assessment - Michael Rodriguez",
    candidate: "Michael Rodriguez",
    thumbnail: "/placeholder.svg?height=240&width=320",
    aspectRatio: "4/3", // Added 4:3 aspect ratio
    duration: "8:45",
    status: "completed",
    date: "2024-01-14",
  },
  {
    id: 3,
    title: "Graduate Admission Interview - Emma Thompson",
    candidate: "Emma Thompson",
    thumbnail: "/placeholder.svg?height=300&width=300",
    aspectRatio: "1/1", // Added square aspect ratio
    duration: "15:22",
    status: "completed",
    date: "2024-01-13",
  },
  {
    id: 4,
    title: "Physics Assessment - David Kim",
    candidate: "David Kim",
    thumbnail: "/placeholder.svg?height=320&width=180",
    aspectRatio: "9/16", // Added 9:16 aspect ratio
    duration: "10:18",
    status: "completed",
    date: "2024-01-12",
  },
  {
    id: 5,
    title: "Leadership Program - Lisa Wang",
    candidate: "Lisa Wang",
    thumbnail: "/placeholder.svg?height=240&width=320",
    aspectRatio: "4/3", // Added 4:3 aspect ratio
    duration: "14:07",
    status: "completed",
    date: "2024-01-11",
  },
  {
    id: 6,
    title: "Research Position - James Miller",
    candidate: "James Miller",
    thumbnail: "/placeholder.svg?height=300&width=300",
    aspectRatio: "1/1", // Added square aspect ratio
    duration: "11:33",
    status: "completed",
    date: "2024-01-10",
  },
  {
    id: 7,
    title: "Study Abroad Program - Maria Garcia",
    candidate: "Maria Garcia",
    thumbnail: "/placeholder.svg?height=320&width=180",
    aspectRatio: "9/16", // Added 9:16 aspect ratio
    duration: "9:28",
    status: "completed",
    date: "2024-01-09",
  },
  {
    id: 8,
    title: "Internship Assessment - Alex Johnson",
    candidate: "Alex Johnson",
    thumbnail: "/placeholder.svg?height=240&width=320",
    aspectRatio: "4/3", // Added 4:3 aspect ratio
    duration: "13:15",
    status: "completed",
    date: "2024-01-08",
  },
]

export function SubmissionsTab() {
  return (
    <div className="space-y-6">
      {/* Masonry Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
      >
        {snipeVideos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileTap={{ scale: 0.98 }}
            className="mb-6 break-inside-avoid"
          >
            <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 rounded-3xl border-0 bg-white group">
              {/* Thumbnail Container */}
              <div
                className="relative bg-gray-100 overflow-hidden"
                style={{ aspectRatio: video.aspectRatio }} // Use specific aspect ratio instead of random
              >
                <img
                  src={video.thumbnail || "/placeholder.svg"}
                  alt={video.title}
                  className="w-full h-full object-cover"
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
