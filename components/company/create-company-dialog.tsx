"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Copy, Check, Eye, EyeOff } from "lucide-react"
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
  const [existingCompany, setExistingCompany] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  
  // Check for existing company and generate code if needed
  useEffect(() => {
    if (isOpen) {
      setIsInitializing(true)
      
      // Check if user already has a company
      const checkExistingCompany = async () => {
        try {
          const response = await fetch('/api/company/info')
          
          if (response.ok) {
            const data = await response.json()
            
            if (data.hasCompany && data.isCreator) {
              // User is admin of an existing company
              setExistingCompany(data.company)
              setCompanyCode(data.company.companyCode)
              setMembers(data.members || [])
              
              // For demo purposes, set a temporary password
              // In a real implementation, you would retrieve this from an API
              setPasscode('123456')
            } else {
              // No company or not an admin, generate new code
              setExistingCompany(null)
              setMembers([])
              setCompanyCode(generateCompanyCode())
              setPasscode('')
            }
          } else {
            // Error, fallback to generating new code
            setExistingCompany(null)
            setMembers([])
            setCompanyCode(generateCompanyCode())
            setPasscode('')
          }
        } catch (error) {
          console.error('Error checking existing company:', error)
          // Error, fallback to generating new code
          setExistingCompany(null)
          setMembers([])
          setCompanyCode(generateCompanyCode())
          setPasscode('')
        } finally {
          setIsInitializing(false)
        }
      }
      
      checkExistingCompany()
    }
  }, [isOpen])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // If user already has a company, don't do anything on submit
    if (existingCompany) {
      onClose()
      return
    }
    
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
          companyCode,
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
    setShowPassword(false)
    onClose()
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-[32px] border-none shadow-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">Add My Colleagues</DialogTitle>
        </DialogHeader>
        
        {isInitializing ? (
          <div className="py-8 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
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
              <Label htmlFor="passcode">{existingCompany ? "Current Passcode" : "Create a Passcode"}</Label>
              <div className="relative">
                <Input
                  id="passcode"
                  type={showPassword ? "text" : "password"}
                  placeholder={existingCompany ? "" : "Minimum 6 characters"}
                  value={passcode}
                  onChange={(e) => !existingCompany && setPasscode(e.target.value)}
                  disabled={isLoading || !!existingCompany}
                  className="rounded-xl pr-10"
                />
                {existingCompany && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {existingCompany 
                  ? "This is the passcode your colleagues need to join." 
                  : "This passcode will be required for your colleagues to join."}
              </p>
            </div>
            
            {/* Member List - Only shown for existing companies */}
            {existingCompany && members.length > 0 && (
              <div className="space-y-3">
                <Label>Team Members</Label>
                <div className="border rounded-xl overflow-hidden">
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 text-xs font-medium text-gray-500">
                        <tr>
                          <th className="px-4 py-2 text-left">Name</th>
                          <th className="px-4 py-2 text-left">Email</th>
                          <th className="px-4 py-2 text-right">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {members.map((member) => (
                          <tr key={member.id} className="text-sm">
                            <td className="px-4 py-3 font-medium">{member.name}</td>
                            <td className="px-4 py-3 text-gray-600">{member.email}</td>
                            <td className="px-4 py-3 text-right">
                              {member.isCreator ? (
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                  Admin
                                </span>
                              ) : (
                                <span className="text-gray-500 text-xs">Member</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                {existingCompany ? "Close" : "Cancel"}
              </Button>
              {!existingCompany && (
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
              )}
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}