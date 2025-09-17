"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Globe, Languages, FileText, Play, MoreVertical, Edit, Trash2, Copy, Download, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { SnipeQuestionsDialog } from "@/components/snipe-questions-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CreatedSnipe {
  id: string
  title: string
  accessType: "public"
  language: "english" | "mandarin"
  questionsCount: number
  personalDetailsEnabled: boolean
  createdAt: string
  status: "active" | "draft" | "completed"
  submissions: number
  url: string
  textInputs?: Array<{
    id: string
    value: string
    timeLimit?: string
  }>
  personalDetailsConfig?: {
    includePersonalDetails: boolean
    personalFields: Array<{
      id: string
      label: string
      type: string
      required: boolean
      dropdownOptions?: string[]
    }>
  }
}

interface MySnipeTabProps {
  createdSnipes?: CreatedSnipe[]
}

export function MySnipeTab({ createdSnipes = [] }: MySnipeTabProps) {
  const [snipes, setSnipes] = useState<CreatedSnipe[]>(createdSnipes)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [snipeToDelete, setSnipeToDelete] = useState<CreatedSnipe | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [questionsDialogOpen, setQuestionsDialogOpen] = useState<boolean>(false)
  const [selectedSnipe, setSelectedSnipe] = useState<CreatedSnipe | null>(null)
  
  useEffect(() => {
    async function fetchUserSnipes() {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/snipe/user')
        
        if (!response.ok) {
          throw new Error('Failed to fetch snipes')
        }
        
        const data = await response.json()
        setSnipes(data)
      } catch (err) {
        console.error('Error fetching snipes:', err)
        setError('Failed to load your snipes. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserSnipes()
  }, [])
  
  const displaySnipes = snipes

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800"
    }
  }

  const generateQRCode = (url: string, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 200
    canvas.height = 200

    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, 200, 200)
    ctx.fillStyle = "#ffffff"

    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        if ((i + j) % 3 === 0) {
          ctx.fillRect(i * 10, j * 10, 8, 8)
        }
      }
    }

    ctx.fillStyle = "#000000"
    ctx.fillRect(10, 10, 30, 30)
    ctx.fillRect(160, 10, 30, 30)
    ctx.fillRect(10, 160, 30, 30)

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(15, 15, 20, 20)
    ctx.fillRect(165, 15, 20, 20)
    ctx.fillRect(15, 165, 20, 20)
  }

  const copyToClipboard = async (url: string, title: string) => {
    // Use the current origin for the URL
    const fullUrl = `${window.location.origin}/snipe/${url}`
    try {
      await navigator.clipboard.writeText(fullUrl)
      toast({
        title: "URL copied",
        className: "rounded-3xl",
        duration: 3000,
      })
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy URL to clipboard",
        variant: "destructive",
        className: "rounded-3xl",
        duration: 3000,
      })
    }
  }

  const downloadQRCode = (url: string, title: string) => {
    const canvas = document.createElement("canvas")
    generateQRCode(url, canvas)

    canvas.toBlob((blob) => {
      if (blob) {
        const downloadUrl = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = downloadUrl
        link.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_qr_code.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(downloadUrl)

        toast({
          title: "QR Code Downloaded!",
          description: `QR code for "${title}" saved to your device`,
        })
      }
    })
  }
  
  const handleDeleteClick = (snipe: CreatedSnipe) => {
    setSnipeToDelete(snipe)
    setDeleteDialogOpen(true)
  }
  
  const handleDeleteConfirm = async () => {
    if (!snipeToDelete) return
    
    try {
      setIsDeleting(true)
      
      const response = await fetch(`/api/snipe/${snipeToDelete.id}/delete`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete snipe')
      }
      
      // Remove the deleted snipe from the state
      setSnipes(prevSnipes => prevSnipes.filter(snipe => snipe.id !== snipeToDelete.id))
      
      toast({
        title: "Snipe Deleted",
        description: `"${snipeToDelete.title}" has been deleted successfully`,
        className: "rounded-3xl",
      })
    } catch (err) {
      console.error('Error deleting snipe:', err)
      toast({
        title: "Delete Failed",
        description: "Unable to delete the snipe. Please try again.",
        variant: "destructive",
        className: "rounded-3xl",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setSnipeToDelete(null)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
          <h3 className="text-xl font-semibold mb-2">Loading Snipes...</h3>
          <p className="text-muted-foreground">Please wait while we fetch your snipes</p>
        </div>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold mb-2">Error Loading Snipes</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }
  
  // Empty state
  if (displaySnipes.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2">No Snipes Created Yet</h3>
          <p className="text-muted-foreground mb-6">Create your first AI interview to get started</p>
          <Button 
            onClick={() => window.location.href = '/dashboard?tab=create-snipe'}
            className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Create Your First Snipe
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {displaySnipes.map((snipe, index) => (
          <motion.div
            key={snipe.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="rounded-3xl hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header with title and actions */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg leading-tight mb-2">{snipe.title}</h3>
                      <Badge className={`${getStatusColor(snipe.status)} rounded-xl text-xs`}>{snipe.status}</Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl">
                        <DropdownMenuItem className="rounded-xl">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="rounded-xl"
                          onClick={() => copyToClipboard(snipe.url, snipe.title)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl" onClick={() => downloadQRCode(snipe.url, snipe.title)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download QR Code
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="rounded-xl text-red-600"
                          onClick={() => handleDeleteClick(snipe)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Snipe details */}
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Globe className="h-4 w-4 mr-2" />
                      Public URL
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <Languages className="h-4 w-4 mr-2" />
                      {snipe.language === "english" ? "English" : "Mandarin"}
                    </div>

                    <div 
                      className="flex items-center text-sm text-muted-foreground hover:text-blue-600 transition-colors cursor-pointer group"
                      onClick={() => {
                        setSelectedSnipe(snipe);
                        setQuestionsDialogOpen(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2 group-hover:text-blue-600 transition-colors" />
                      <span>
                        {snipe.questionsCount} questions
                        {snipe.personalDetailsEnabled && " + Personal details"}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      Created {new Date(snipe.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="font-medium text-2xl">{snipe.submissions}</span>
                        <span className="text-muted-foreground ml-1">submissions</span>
                      </div>
                      <Button
                        size="sm"
                        className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        onClick={() => window.open(`/snipe/${snipe.url}`, '_blank')}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this snipe?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the snipe
              "{snipeToDelete?.title}" and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="rounded-2xl" 
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-2xl bg-red-600 hover:bg-red-700"
              onClick={(e) => {
                e.preventDefault() // Prevent the dialog from closing automatically
                handleDeleteConfirm()
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Questions and Personal Details Dialog */}
      {selectedSnipe && (
        <SnipeQuestionsDialog
          open={questionsDialogOpen}
          onOpenChange={setQuestionsDialogOpen}
          title={selectedSnipe.title}
          questions={selectedSnipe.textInputs || []}
          personalFields={selectedSnipe.personalDetailsConfig?.personalFields || []}
        />
      )}
    </div>
  )
}
