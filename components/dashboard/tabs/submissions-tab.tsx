"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Play, Loader2, Filter, X } from "lucide-react"
import { VideoPlayerDialog } from "@/components/video-player-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

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

interface SnipeFilter {
  id: string;
  title: string;
  createdAt: string;
  selected: boolean;
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
  
  // Filter states
  const [snipeFilters, setSnipeFilters] = useState<SnipeFilter[]>([])
  const [isLoadingFilters, setIsLoadingFilters] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  
  // Fetch snipe filters when component mounts
  useEffect(() => {
    fetchSnipeFilters();
  }, []);
  
  // Fetch submissions when filters change
  useEffect(() => {
    if (snipeFilters.length > 0) {
      fetchSubmissions(1);
    }
  }, [snipeFilters]);
  
  // Function to fetch available snipes for filtering
  const fetchSnipeFilters = async () => {
    try {
      setIsLoadingFilters(true);
      const response = await fetch('/api/snipes/list');
      
      if (!response.ok) {
        throw new Error('Failed to fetch snipes list');
      }
      
      const data = await response.json();
      
      // Initialize all filters as unselected
      const filters = data.snipes.map((snipe: any) => ({
        ...snipe,
        selected: false
      }));
      
      setSnipeFilters(filters);
    } catch (err) {
      console.error('Error fetching snipes list:', err);
    } finally {
      setIsLoadingFilters(false);
      // After filters are loaded, fetch submissions
      fetchSubmissions(1);
    }
  };

  // Function to fetch submissions from the API
  const fetchSubmissions = async (pageNum: number) => {
    try {
      setIsLoading(true);
      
      // Get selected filter IDs
      const selectedFilters = snipeFilters
        .filter(filter => filter.selected)
        .map(filter => filter.id);
      
      // Build the URL with filters if any are selected
      let url = `/api/submissions?page=${pageNum}&limit=20`;
      if (selectedFilters.length > 0) {
        url += `&snipeIds=${selectedFilters.join(',')}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      
      const data = await response.json();
      
      if (pageNum === 1) {
        setSubmissions(data.submissions);
      } else {
        setSubmissions(prev => [...prev, ...data.submissions]);
      }
      
      setHasMore(pageNum < data.pagination?.pages);
      setPage(pageNum);
      setError(null);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError(`Failed to load submissions: Please try again.`);
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
  
  // Toggle a single filter
  const toggleFilter = (id: string) => {
    setSnipeFilters(filters => filters.map(filter => 
      filter.id === id ? { ...filter, selected: !filter.selected } : filter
    ));
  }
  
  // Clear all filters
  const clearFilters = () => {
    setSnipeFilters(filters => filters.map(filter => ({ ...filter, selected: false })));
  }
  
  // Select all filters
  const selectAllFilters = () => {
    setSnipeFilters(filters => filters.map(filter => ({ ...filter, selected: true })));
  }
  
  // Get count of active filters
  const activeFilterCount = snipeFilters.filter(filter => filter.selected).length;

  return (
    <div className="space-y-3 pt-0">
      {/* Filter Controls */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Submissions</h2>
        
        <div className="flex items-center gap-2">
          
          {/* Filter Popover */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`flex items-center gap-1 rounded-full px-4 ${activeFilterCount > 0 ? 'border-blue-500 text-blue-500' : ''}`}
              >
                <Filter size={16} />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filter by Snipe</h4>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={clearFilters} disabled={activeFilterCount === 0}>
                      Clear
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={selectAllFilters}
                      disabled={activeFilterCount === snipeFilters.length}
                    >
                      Select All
                    </Button>
                  </div>
                </div>
                
                {isLoadingFilters ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  </div>
                ) : snipeFilters.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No snipes found
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {snipeFilters.map((filter) => (
                      <div key={filter.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`filter-${filter.id}`} 
                          checked={filter.selected}
                          onCheckedChange={() => toggleFilter(filter.id)}
                        />
                        <label 
                          htmlFor={`filter-${filter.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 truncate"
                          title={filter.title}
                        >
                          {filter.title}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
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