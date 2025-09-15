"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Play } from "lucide-react"

interface SnipeVideo {
  id: number;
  title: string;
  candidate: string;
  thumbnail: string;
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
    thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
    aspectRatio: "9/16",
    duration: "12:34",
    status: "completed",
    date: "2024-01-15",
  },
  {
    id: 2,
    title: "Teaching Position Assessment - Michael Rodriguez",
    candidate: "Michael Rodriguez",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    aspectRatio: "4/3",
    duration: "8:45",
    status: "completed",
    date: "2024-01-14",
  },
  {
    id: 3,
    title: "Graduate Admission Interview - Emma Thompson",
    candidate: "Emma Thompson",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    aspectRatio: "1/1",
    duration: "15:22",
    status: "completed",
    date: "2024-01-13",
  },
  {
    id: 4,
    title: "Physics Assessment - David Kim",
    candidate: "David Kim",
    thumbnail: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
    aspectRatio: "9/16",
    duration: "10:18",
    status: "completed",
    date: "2024-01-12",
  },
  {
    id: 5,
    title: "Leadership Program - Lisa Wang",
    candidate: "Lisa Wang",
    thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    aspectRatio: "4/3",
    duration: "14:07",
    status: "completed",
    date: "2024-01-11",
  },
  {
    id: 6,
    title: "Research Position - James Miller",
    candidate: "James Miller",
    thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    aspectRatio: "1/1",
    duration: "11:33",
    status: "completed",
    date: "2024-01-10",
  },
  {
    id: 7,
    title: "Study Abroad Program - Maria Garcia",
    candidate: "Maria Garcia",
    thumbnail: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
    aspectRatio: "9/16",
    duration: "9:28",
    status: "completed",
    date: "2024-01-09",
  },
  {
    id: 8,
    title: "Internship Assessment - Alex Johnson",
    candidate: "Alex Johnson",
    thumbnail: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    aspectRatio: "4/3",
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
              onClick={() => {}}
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