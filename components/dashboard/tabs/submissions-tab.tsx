"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Play, Loader2, Filter, X, Star, ThumbsUp } from "lucide-react"
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
  decision?: string;
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
  const [submissionDecisions, setSubmissionDecisions] = useState<Record<string, string>>({})
  
  // Filter states
  const [snipeFilters, setSnipeFilters] = useState<SnipeFilter[]>([])
  const [isLoadingFilters, setIsLoadingFilters] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  
  // Reference to track if filters are loaded
  const filtersLoadedRef = useRef(false);
  
  // Reference to store pending filter ID to apply
  const pendingFilterIdRef = useRef<string | null>(null);
  
  // Function to apply filter with retry mechanism
  const applyFilterWithRetry = useRef((filterId: string, maxRetries = 10, delay = 300) => {
    let retryCount = 0;
    
    const attemptApply = () => {
      // Check if filters are loaded and the filter ID exists in our filters
      const filterExists = snipeFilters.some(filter => filter.id === filterId);
      
      if (filtersLoadedRef.current && filterExists) {
        // Filters are loaded and the ID exists, apply the filter
        console.log(`Applying filter ${filterId} (attempt ${retryCount + 1})`);
        applySelectedSnipeFilter(filterId);
        pendingFilterIdRef.current = null;
        return true;
      } else if (retryCount < maxRetries) {
        // Retry after delay
        retryCount++;
        console.log(`Filter application attempt ${retryCount} failed, retrying in ${delay}ms...`);
        setTimeout(attemptApply, delay);
        return false;
      } else {
        // Max retries reached
        console.error(`Failed to apply filter ${filterId} after ${maxRetries} attempts`);
        pendingFilterIdRef.current = null;
        return false;
      }
    };
    
    // Store the pending filter ID
    pendingFilterIdRef.current = filterId;
    
    // Start the retry process
    return attemptApply();
  }).current;
  
  // Track if we've already initialized filters
  const initializedRef = useRef(false);

  // Fetch snipe filters when component mounts
  useEffect(() => {
    // Prevent multiple initializations
    if (initializedRef.current) {
      console.log('Component already initialized, skipping');
      return;
    }
    
    initializedRef.current = true;
    console.log('Initializing component for the first time');
    
    // Check if there's a selected snipe filter from localStorage (set by the View button in My Snipe tab)
    const selectedSnipeFilter = typeof window !== 'undefined' ? localStorage.getItem('selectedSnipeFilter') : null;
    
    // If we have a selected filter in localStorage, prepare to apply it
    if (selectedSnipeFilter) {
      // Mark that we're coming from My Snipe tab
      setIsComingFromMySnipeTab(true);
      console.log('Coming from My Snipe tab via localStorage, setting flag');
      
      // Store it for application after filters are loaded
      pendingFilterIdRef.current = selectedSnipeFilter;
      
      // Clear the localStorage item to prevent it from being applied again on future visits
      localStorage.removeItem('selectedSnipeFilter');
    }
    
    // Now fetch the filters
    fetchSnipeFilters();
    
    // Listen for navigation events from other tabs
    const handleNavigateToTab = (event: CustomEvent) => {
      if (event.detail?.snipeId) {
        // Mark that we're coming from My Snipe tab
        setIsComingFromMySnipeTab(true);
        console.log('Coming from My Snipe tab via event, setting flag');
        
        // Apply the filter when we receive the navigation event
        applyFilterWithRetry(event.detail.snipeId);
      }
    };
    
    // Add event listener
    window.addEventListener('navigateToTab', handleNavigateToTab as EventListener);
    
    return () => {
      window.removeEventListener('navigateToTab', handleNavigateToTab as EventListener);
    };
  }, []);
  
  // Track if we're applying a filter programmatically
  const isApplyingFilterRef = useRef(false);
  
  // Fetch submissions when filters change
  useEffect(() => {
    if (snipeFilters.length > 0) {
      console.log('Filters changed, fetching submissions with current filters');
      // Only fetch if we're not in the middle of applying a filter programmatically
      // or if we're done applying the filter
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
      
      // Get the pending filter ID before we update anything
      const pendingId = pendingFilterIdRef.current;
      
      // Initialize filters - if we have a pending filter, pre-select it
      const filters = data.snipes.map((snipe: any) => ({
        ...snipe,
        selected: pendingId ? snipe.id === pendingId : false
      }));
      
      console.log(`Loaded ${filters.length} filters, pendingId: ${pendingId || 'none'}`);
      console.log('Selected filters:', filters.filter((f: SnipeFilter) => f.selected).map((f: SnipeFilter) => f.id));
      
      // Mark filters as loaded
      filtersLoadedRef.current = true;
      
      // Set the filters with any pre-selected filter
      setSnipeFilters(filters);
      
      // Clear the pending filter reference
      pendingFilterIdRef.current = null;
      
      // If we had a pending filter, log it and open the filter popover briefly
      if (pendingId) {
        console.log(`Applied filter ${pendingId} during filter loading`);
        
        // Show the filter popover briefly
        setFilterOpen(true);
        setTimeout(() => {
          setFilterOpen(false);
        }, 1500);
        
        // Don't fetch submissions here - the useEffect for snipeFilters will handle that
        // with the correct filter already applied
      } else {
        // If no pending filter, fetch all submissions
        setTimeout(() => {
          fetchSubmissions(1);
        }, 100);
      }
    } catch (err) {
      console.error('Error fetching snipes list:', err);
      // If error, still fetch submissions with no filter
      setTimeout(() => {
        fetchSubmissions(1);
      }, 100);
    } finally {
      setIsLoadingFilters(false);
    }
  };

  // Track if we're coming from the View button in My Snipe tab
  const [isComingFromMySnipeTab, setIsComingFromMySnipeTab] = useState<boolean>(false);

  // Function to fetch decisions for submissions
  const fetchDecisionsForSubmissions = async (submissionsToFetch: SnipeVideo[]) => {
    try {
      // Get all submission IDs
      const submissionIds = submissionsToFetch.map((s: SnipeVideo) => s.id).join(',');
      
      // Fetch decisions for these submissions
      const decisionsResponse = await fetch(`/api/submissions/decisions?responseIds=${submissionIds}`);
      
      if (decisionsResponse.ok) {
        const decisionsData = await decisionsResponse.json();
        const decisionsMap = decisionsData.decisions || {};
        
        console.log('Fetched decisions:', decisionsMap);
        
        // Update decisions state
        setSubmissionDecisions(prev => ({
          ...prev,
          ...decisionsMap
        }));
        
        // Update submissions with decisions
        setSubmissions(currentSubmissions => 
          currentSubmissions.map(submission => ({
            ...submission,
            decision: decisionsMap[submission.id] || submission.decision
          }))
        );
      }
    } catch (decisionError) {
      console.error('Error fetching decisions:', decisionError);
      // Continue with submissions without decisions
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
      
      console.log(`Fetching submissions with filters: ${selectedFilters.length > 0 ? selectedFilters.join(', ') : 'none'}`);
      // Log current filter state
      const selectedFiltersInfo = snipeFilters
        .filter((filter: SnipeFilter) => filter.selected)
        .map((filter: SnipeFilter) => ({ id: filter.id, title: filter.title }));
      console.log('Current filter state:', JSON.stringify(selectedFiltersInfo));
      
      // If we're coming from My Snipe tab and there's no filter selected, something went wrong
      // Let's check if we need to recover the filter
      if (isComingFromMySnipeTab && selectedFilters.length === 0 && pendingFilterIdRef.current) {
        console.log(`RECOVERY: Reapplying filter ${pendingFilterIdRef.current} that was lost`);
        // Try to re-apply the filter
        const filterToApply = pendingFilterIdRef.current;
        
        // Update filters to select only the matching one
        setSnipeFilters(filters => {
          const updatedFilters = filters.map(filter => ({
            ...filter,
            selected: filter.id === filterToApply
          }));
          console.log('RECOVERY: Filter re-applied');
          return updatedFilters;
        });
        
        // Skip this fetch since we're about to trigger another one with the fixed filters
        setIsLoading(false);
        return;
      }
      
      // Build the URL with filters if any are selected
      let url = `/api/submissions?page=${pageNum}&limit=20`;
      if (selectedFilters.length > 0) {
        url += `&snipeIds=${selectedFilters.join(',')}`;
        console.log(`Adding filter to URL: ${url}`);
      } else {
        console.log(`No filters applied, URL: ${url}`);
      }
      
      // Log the actual request being made
      console.log(`Making API request to: ${url}`);
      
      // Add a timestamp parameter to prevent caching
      url += `&_t=${new Date().getTime()}`;
      
      const response = await fetch(url, {
        // Add cache control headers to prevent caching
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      
      const data = await response.json();
      
      // Only update submissions if we're still in the same filter state
      // This prevents race conditions where a newer request completes after an older one
      const currentSelectedFilters = snipeFilters
        .filter(filter => filter.selected)
        .map(filter => filter.id);
      
      const filtersMatch = 
        selectedFilters.length === currentSelectedFilters.length && 
        selectedFilters.every(id => currentSelectedFilters.includes(id));
      
      if (filtersMatch) {
        let submissionsToSet = data.submissions;
        
        // If we're coming from the My Snipe tab, handle it like the original version
        if (isComingFromMySnipeTab && pageNum === 1) {
          console.log('Coming from My Snipe tab, using original approach');
          
          // If we have submissions, fetch their decisions
          if (submissionsToSet.length > 0) {
            try {
              // Get all submission IDs
              const submissionIds = submissionsToSet.map((s: SnipeVideo) => s.id).join(',');
              
              // Fetch decisions for these submissions
              const decisionsResponse = await fetch(`/api/submissions/decisions?responseIds=${submissionIds}`);
              
              if (decisionsResponse.ok) {
                const decisionsData = await decisionsResponse.json();
                const decisionsMap = decisionsData.decisions || {};
                
                console.log('Fetched decisions:', decisionsMap);
                
                // Update submissions with decisions
                submissionsToSet = submissionsToSet.map((submission: SnipeVideo) => ({
                  ...submission,
                  decision: decisionsMap[submission.id] || undefined
                }));
                
                // Update decisions state
                setSubmissionDecisions(prev => ({
                  ...prev,
                  ...decisionsMap
                }));
              }
            } catch (decisionError) {
              console.error('Error fetching decisions:', decisionError);
              // Continue with submissions without decisions
            }
          }
          
          // Only reset the flag after successfully handling the request
          if (selectedFilters.length > 0) {
            console.log('Successfully handled My Snipe tab request, resetting flag');
            setIsComingFromMySnipeTab(false);
          } else {
            console.log('WARNING: My Snipe tab request had no filters, keeping flag active');
          }
        }
        
        // Update the submissions state
        if (pageNum === 1) {
          console.log(`Setting ${submissionsToSet.length} submissions with filters: ${selectedFilters.join(', ')}`);
          setSubmissions(submissionsToSet);
        } else {
          setSubmissions(prev => [...prev, ...submissionsToSet]);
        }
        
        setHasMore(pageNum < data.pagination?.pages);
        setPage(pageNum);
        
        // If we're NOT coming from My Snipe tab, fetch decisions separately
        if (!isComingFromMySnipeTab && submissionsToSet.length > 0 && pageNum === 1) {
          fetchDecisionsForSubmissions(submissionsToSet);
        }
      } else {
        console.log('Filter state changed during fetch, ignoring results');
      }
      
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
  
  // Find the index of a video in the submissions array
  const findVideoIndex = (videoId: string) => {
    return submissions.findIndex(video => video.id === videoId);
  }
  
  const handleOpenVideo = (video: SnipeVideo) => {
    setSelectedVideo(video)
    setSelectedVideoIndex(0) // Start with the first video
    setIsDialogOpen(true)
  }
  
  // Handle submission decisions
  const handleSubmissionDecision = async (submissionId: string, decision: string) => {
    try {
      // Optimistically update UI first for better UX
      
      // Handle empty decision (cancellation)
      if (decision === '') {
        // Remove from local state
        const updatedDecisions = { ...submissionDecisions };
        delete updatedDecisions[submissionId];
        setSubmissionDecisions(updatedDecisions);
        
        // Update the submission in the list to remove decision
        setSubmissions(prev => 
          prev.map(submission => 
            submission.id === submissionId 
              ? { ...submission, decision: undefined } 
              : submission
          )
        );
        
        // If the selected video is the one being updated, update it too
        if (selectedVideo?.id === submissionId) {
          setSelectedVideo(prev => 
            prev ? { ...prev, decision: undefined } : null
          );
        }
        
        console.log(`Decision cancelled for submission ${submissionId}`);
      } else {
        // Update local state with new decision
        setSubmissionDecisions(prev => ({
          ...prev,
          [submissionId]: decision
        }));
        
        // Update the submission in the list
        setSubmissions(prev => 
          prev.map(submission => 
            submission.id === submissionId 
              ? { ...submission, decision } 
              : submission
          )
        );
        
        // If the selected video is the one being updated, update it too
        if (selectedVideo?.id === submissionId) {
          setSelectedVideo(prev => 
            prev ? { ...prev, decision } : null
          );
        }
        
        console.log(`Submission ${submissionId} marked as ${decision}`);
      }
      
      // Send decision to backend
      const response = await fetch('/api/submissions/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ submissionId, decision }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save decision');
      }
      
      const data = await response.json();
      console.log('Decision saved to backend:', data);
      
    } catch (error) {
      console.error('Error saving decision:', error);
      // Show error notification (you could add a toast here)
    }
  }

  const handleCloseVideo = () => {
    setIsDialogOpen(false)
  }
  
  // Navigate to the next card
  const handleNextCard = () => {
    if (!selectedVideo) return;
    
    const currentIndex = findVideoIndex(selectedVideo.id);
    if (currentIndex < submissions.length - 1) {
      setSelectedVideo(submissions[currentIndex + 1]);
      setSelectedVideoIndex(0); // Reset to first video of the next card
    }
  }
  
  // Navigate to the previous card
  const handlePrevCard = () => {
    if (!selectedVideo) return;
    
    const currentIndex = findVideoIndex(selectedVideo.id);
    if (currentIndex > 0) {
      setSelectedVideo(submissions[currentIndex - 1]);
      setSelectedVideoIndex(0); // Reset to first video of the previous card
    }
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
  
  // Apply a specific snipe filter by ID
  const applySelectedSnipeFilter = (snipeId: string) => {
    // Set flag to indicate we're applying a filter programmatically
    isApplyingFilterRef.current = true;
    
    console.log(`Applying filter for snipeId: ${snipeId}`);
    
    // Store the snipeId in case we need to recover it
    pendingFilterIdRef.current = snipeId;
    
    // Update filters to select only the matching one
    setSnipeFilters(filters => {
      const updatedFilters = filters.map(filter => ({
        ...filter,
        // Only select the matching filter, deselect all others
        selected: filter.id === snipeId
      }));
      
      const selectedFilters = updatedFilters.filter((f: SnipeFilter) => f.selected).map((f: SnipeFilter) => f.id);
      console.log('Filter applied:', selectedFilters);
      
      // Check if the filter was actually found and applied
      if (selectedFilters.length === 0) {
        console.warn(`WARNING: Filter ${snipeId} not found in available filters!`);
      }
      
      return updatedFilters;
    });
    
    // Open the filter popover to show the selected filter
    setFilterOpen(true);
    
    // Close the filter popover after a short delay
    setTimeout(() => {
      setFilterOpen(false);
    }, 1500);
    
    // Reset the flag after a short delay to allow state updates to complete
    setTimeout(() => {
      isApplyingFilterRef.current = false;
      
      // Double-check that the filter was applied correctly
      const currentSelectedFilters = snipeFilters
        .filter(filter => filter.selected)
        .map(filter => filter.id);
      
      if (!currentSelectedFilters.includes(snipeId)) {
        console.warn(`WARNING: Filter ${snipeId} was not applied correctly. Will retry in fetchSubmissions.`);
      } else {
        // Filter was applied successfully, we can clear the pending reference
        pendingFilterIdRef.current = null;
      }
    }, 100);
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
            <PopoverContent className="w-80 rounded-xl border-none shadow-lg" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filter by Snipe</h4>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-full" 
                      onClick={clearFilters} 
                      disabled={activeFilterCount === 0}
                    >
                      Clear
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-full"
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
                  <div className="max-h-[300px] overflow-y-auto pr-1">
                    <div className="space-y-1">
                      {snipeFilters.map((filter) => (
                        <div 
                          key={filter.id} 
                          className="flex items-center space-x-2 p-2 rounded-lg transition-all duration-200"
                          onClick={() => toggleFilter(filter.id)}
                        >
                          <Checkbox 
                            id={`filter-${filter.id}`} 
                            checked={filter.selected}
                            onCheckedChange={() => toggleFilter(filter.id)}
                            className="transition-opacity"
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
            onNextCard={handleNextCard}
            onPrevCard={handlePrevCard}
            hasNextCard={findVideoIndex(selectedVideo.id) < submissions.length - 1}
            hasPrevCard={findVideoIndex(selectedVideo.id) > 0}
            submissionId={selectedVideo.id}
            decision={selectedVideo.decision || submissionDecisions[selectedVideo.id]}
            onDecision={handleSubmissionDecision}
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
        </div>
      )}

      {/* Regular Grid - 4 items per row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {submissions.map((video: SnipeVideo, index: number) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w-full"
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
              {/* Thumbnail Container - 9:16 aspect ratio as requested */}
              <div
                className="relative bg-gray-100 overflow-hidden w-full"
                style={{ 
                  aspectRatio: "9/16",  // Restore original 9:16 aspect ratio
                  objectFit: "cover"
                }}
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
                
                {/* Decision indicator */}
                {(video.decision || submissionDecisions[video.id]) && (video.decision !== '' && submissionDecisions[video.id] !== '') ? (
                  <div className={`
                    absolute top-2 right-2 z-10 p-1.5 rounded-full shadow-lg
                    ${video.decision === 'like' || submissionDecisions[video.id] === 'like' ? 'bg-amber-500' : ''}
                    ${video.decision === 'potential' || submissionDecisions[video.id] === 'potential' ? 'bg-blue-500' : ''}
                    ${video.decision === 'reject' || submissionDecisions[video.id] === 'reject' ? 'bg-red-500' : ''}
                  `}>
                    {(video.decision === 'like' || submissionDecisions[video.id] === 'like') && (
                      <Star className="h-4 w-4 text-white" />
                    )}
                    {(video.decision === 'potential' || submissionDecisions[video.id] === 'potential') && (
                      <ThumbsUp className="h-4 w-4 text-white" />
                    )}
                    {(video.decision === 'reject' || submissionDecisions[video.id] === 'reject') && (
                      <X className="h-4 w-4 text-white" />
                    )}
                  </div>
                ) : null}

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