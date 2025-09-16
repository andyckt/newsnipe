"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Play, Loader2 } from "lucide-react"
import { VideoPlayerDialog } from "@/components/video-player-dialog"

interface Video {
  videoKey: string;
  title?: string;
  duration?: string;
  thumbnailUrl?: string | null;
}

interface PersonalDetail {
  question: string;
  answer: string;
}

interface SnipeVideo {
  id: string;
  title?: string;
  candidate?: string;
  thumbnail: string;
  videos: Video[];
  aspectRatio?: string;
  status: string;
  date: string;
  personalDetails?: PersonalDetail[];
  snipeId?: string;
}

// We'll fetch real data from the API instead of using mock data

export function SubmissionsTab() {
  const [submissions, setSubmissions] = useState<SnipeVideo[]>([])
  const [selectedVideo, setSelectedVideo] = useState<SnipeVideo | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  // Fetch submissions when component mounts
  useEffect(() => {
    fetchSubmissions(1);
  }, []);

  // Function to fetch submissions from the API
  const fetchSubmissions = async (pageNum: number) => {
    try {
      setIsLoading(true);
      console.log(`Fetching submissions page ${pageNum}...`);
      const response = await fetch(`/api/submissions?page=${pageNum}&limit=20`);
      
      console.log(`API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error response: ${errorText}`);
        throw new Error(`Failed to fetch submissions: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`API returned ${data.submissions?.length || 0} submissions`);
      console.log('First submission:', data.submissions?.[0]);
      
      if (pageNum === 1) {
        setSubmissions(data.submissions || []);
      } else {
        setSubmissions(prev => [...prev, ...(data.submissions || [])]);
      }
      
      setHasMore(pageNum < (data.pagination?.pages || 1));
      setPage(pageNum);
      setError(null);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError(`Failed to load submissions: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load more submissions when user scrolls to bottom
  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchSubmissions(page + 1);
    }
  };
  
  const handleOpenVideo = (video: SnipeVideo) => {
    setSelectedVideo(video)
    setSelectedVideoIndex(0) // Start with the first video
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
            videos={selectedVideo.videos}
            selectedVideoIndex={selectedVideoIndex}
            onVideoChange={setSelectedVideoIndex}
            title={selectedVideo.title}
            candidate={selectedVideo.candidate}
            date={selectedVideo.date}
            personalDetails={selectedVideo.personalDetails}
          />
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-8 text-center">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => fetchSubmissions(1)} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && submissions.length === 0 && (
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2">Loading submissions...</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && submissions.length === 0 && !error && (
        <div className="p-8 text-center">
          <p className="text-gray-500">No submissions found.</p>
          <p className="text-gray-500 mt-2">Create a Snipe and share it to get responses.</p>
        </div>
      )}

      {/* Masonry Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
      >
        {submissions.map((video: SnipeVideo, index: number) => (
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
                style={{ aspectRatio: video.aspectRatio || "9/16" }}
              >
                <img
                  src={video.thumbnail || "/placeholder-user.jpg"}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    // If thumbnail fails to load, use placeholder
                    (e.target as HTMLImageElement).src = "/placeholder-user.jpg";
                  }}
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="p-4 bg-white/90 rounded-full backdrop-blur-sm">
                    <Play className="h-8 w-8 text-gray-800 ml-1" />
                  </div>
                </div>
              </div>

              {/* Title and Candidate - Below Thumbnail */}
              {/* Commented out as requested
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2 leading-tight">{video.title}</h3>
                <p className="text-gray-600 text-sm font-medium">{video.candidate}</p>
              </div>
              */}
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Load more button */}
      {submissions.length > 0 && hasMore && (
        <div className="flex justify-center mt-8 mb-4">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 flex items-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  )
}