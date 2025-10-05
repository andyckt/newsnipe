"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Loader2 } from "lucide-react" // Trash2 removed as delete feature is commented out
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Comment {
  id: string
  text: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  isCurrentUser: boolean
}

interface SubmissionCommentsProps {
  submissionId: string
}

export function SubmissionComments({ submissionId }: SubmissionCommentsProps) {
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const commentsEndRef = useRef<HTMLDivElement>(null)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  
  // Fetch comments when component mounts or submissionId changes
  useEffect(() => {
    if (submissionId) {
      fetchComments()
    }
  }, [submissionId])
  
  // Scroll to bottom when comments change
  useEffect(() => {
    scrollToBottom()
  }, [comments])
  
  // Fetch comments from API
  const fetchComments = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/submissions/comments?submissionId=${submissionId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }
      
      const data = await response.json()
      setComments(data.comments || [])
    } catch (err) {
      console.error('Error fetching comments:', err)
      setError('Failed to load comments')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Send a new comment
  const sendComment = async () => {
    if (!newComment.trim()) return
    
    setIsSending(true)
    
    try {
      // Optimistically add comment to UI
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        text: newComment,
        createdAt: new Date().toISOString(),
        user: { name: 'You', email: '' },
        isCurrentUser: true
      }
      
      setComments(prev => [...prev, optimisticComment])
      setNewComment("")
      
      // Send to server
      const response = await fetch('/api/submissions/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          submissionId,
          text: newComment
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to send comment')
      }
      
      const data = await response.json()
      
      // Replace optimistic comment with real one
      setComments(prev => 
        prev.filter(c => c.id !== optimisticComment.id).concat(data)
      )
      
      // Focus back on input
      if (commentInputRef.current) {
        commentInputRef.current.focus()
      }
    } catch (err) {
      console.error('Error sending comment:', err)
      
      // Remove optimistic comment on error
      setComments(prev => prev.filter(c => !c.id.startsWith('temp-')))
      
      toast({
        title: "Error",
        description: "Failed to send comment. Please try again.",
        variant: "destructive"
      })
      
      // Restore the comment text
      setNewComment(newComment)
    } finally {
      setIsSending(false)
    }
  }
  
  // Delete a comment - Commented out for now
  /*
  const deleteComment = async (commentId: string) => {
    try {
      // Optimistically remove from UI
      const commentToDelete = comments.find(c => c.id === commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
      
      const response = await fetch(`/api/submissions/comments?commentId=${commentId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete comment')
      }
    } catch (err) {
      console.error('Error deleting comment:', err)
      
      // Restore comment on error
      if (commentToDelete) {
        setComments(prev => [...prev, commentToDelete].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ))
      }
      
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive"
      })
    }
  }
  */
  
  // Handle Enter key to send comment
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendComment()
    }
  }
  
  // Scroll to bottom of comments
  const scrollToBottom = () => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  // Format date function removed as timestamps are no longer displayed
  
  return (
    <div className="flex flex-col h-full">
      {/* Comments list */}
      <div className="flex-1 overflow-y-auto max-h-[175px] space-y-3 pr-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-500 text-sm">{error}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchComments}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">No comments yet</p>
          </div>
        ) : (
          <>
            {comments.map(comment => (
              <div 
                key={comment.id} 
                className={`flex gap-2 ${comment.isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                {!comment.isCurrentUser && (
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                      {getInitials(comment.user.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`
                  max-w-[80%] rounded-xl px-3 py-2 text-sm
                  ${comment.isCurrentUser 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800'}
                `}>
                  {!comment.isCurrentUser && (
                    <p className="text-xs font-medium mb-1">{comment.user.name}</p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{comment.text}</p>
                </div>
                
                {/* Delete button commented out
                {comment.isCurrentUser && !comment.id.startsWith('temp-') && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-red-100 hover:text-red-500"
                    onClick={() => deleteComment(comment.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
                */}
              </div>
            ))}
            <div ref={commentsEndRef} />
          </>
        )}
      </div>
      
      {/* Comment input */}
      <div className="mt-3 flex gap-2 items-end">
        <Textarea
          ref={commentInputRef}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What do you think of this?"
          className="resize-none min-h-[40px] max-h-[120px] rounded-xl"
          disabled={isSending}
        />
        <Button
          size="icon"
          className={`rounded-full h-9 w-9 flex-shrink-0 ${
            newComment.trim() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300'
          }`}
          disabled={!newComment.trim() || isSending}
          onClick={sendComment}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
