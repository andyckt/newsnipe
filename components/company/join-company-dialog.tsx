"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface JoinCompanyDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function JoinCompanyDialog({ isOpen, onClose }: JoinCompanyDialogProps) {
  const { toast } = useToast()
  const [companyCode, setCompanyCode] = useState("")
  const [passcode, setPasscode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [joinedCompanyName, setJoinedCompanyName] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!companyCode || !passcode) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/company/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyCode,
          passcode,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to join company')
      }
      
      // Show success message
      setJoinedCompanyName(data.name)
      setIsSuccess(true)
      
      toast({
        title: "Success!",
        description: `You've joined ${data.name}`,
      })
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join company",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleClose = () => {
    // Reset state when closing
    setCompanyCode("")
    setPasscode("")
    setIsSuccess(false)
    onClose()
    
    // Reload the page if successfully joined to refresh the submissions
    if (isSuccess) {
      window.location.reload()
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-[32px] border-none shadow-lg overflow-hidden">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Join a Company</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="company-code">Company Code</Label>
                <Input
                  id="company-code"
                  placeholder="Enter 6-digit company code"
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value)}
                  disabled={isLoading}
                  maxLength={6}
                  className="rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="join-passcode">Passcode</Label>
                <Input
                  id="join-passcode"
                  type="password"
                  placeholder="Enter company passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  disabled={isLoading}
                  className="rounded-xl"
                />
                <p className="text-xs text-gray-500">
                  Ask your company administrator for the passcode.
                </p>
              </div>
              
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join Company"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl text-blue-600">Successfully Joined!</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <p>
                You have successfully joined <strong>{joinedCompanyName}</strong>'s Snipe. You now have access to view and review all submissions.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-700">
                  The page will refresh when you close this dialog to load the shared submissions.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                onClick={handleClose}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
