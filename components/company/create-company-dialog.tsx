"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Copy, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { customAlphabet } from 'nanoid'

// Create a custom nanoid generator for 6-digit numeric codes
const generateCompanyCode = customAlphabet('0123456789', 6)

interface CreateCompanyDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateCompanyDialog({ isOpen, onClose }: CreateCompanyDialogProps) {
  const { toast } = useToast()
  const [passcode, setPasscode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [companyCode, setCompanyCode] = useState("")
  const [copied, setCopied] = useState(false)
  
  // Generate a company code when the dialog opens
  useEffect(() => {
    if (isOpen) {
      setCompanyCode(generateCompanyCode())
    }
  }, [isOpen])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!passcode) {
      toast({
        title: "Error",
        description: "Please enter a passcode",
        variant: "destructive",
      })
      return
    }
    
    if (passcode.length < 6) {
      toast({
        title: "Error",
        description: "Passcode must be at least 6 characters",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/company/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passcode,
          companyCode, // Send the frontend-generated company code
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create company')
      }
      
      toast({
        title: "Success!",
        description: "Your company has been created successfully",
      })
      
      // Reload the page to reflect the changes
      window.location.reload()
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create company",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(companyCode)
    setCopied(true)
    
    toast({
      title: "Copied!",
      description: "Company code copied to clipboard",
    })
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }
  
  const handleClose = () => {
    // Reset state when closing
    setPasscode("")
    setCopied(false)
    onClose()
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-[32px] border-none shadow-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">Add My Colleagues</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Company Code Display */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 p-3 rounded-xl flex-1 text-center">
                <span className="text-2xl font-mono tracking-wider">{companyCode}</span>
              </div>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleCopyCode}
                className="flex-shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Share this code with your colleagues.
            </p>
          </div>
          
          {/* Passcode Input */}
          <div className="space-y-2">
            <Label htmlFor="passcode">Create a Passcode</Label>
            <Input
              id="passcode"
              type="password"
              placeholder="Minimum 6 characters"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              disabled={isLoading}
              className="rounded-xl"
            />
            <p className="text-xs text-gray-500">
              This passcode will be required for your colleagues to join.
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
                  Creating...
                </>
              ) : (
                "Create Company"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}