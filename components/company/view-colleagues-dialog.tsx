"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Users } from "lucide-react"

interface ViewColleaguesDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ViewColleaguesDialog({ isOpen, onClose }: ViewColleaguesDialogProps) {
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch company members when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchMembers()
    }
  }, [isOpen])
  
  const fetchMembers = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/company/info')
      
      if (!response.ok) {
        throw new Error('Failed to fetch company information')
      }
      
      const data = await response.json()
      
      if (data.hasCompany) {
        setMembers(data.members || [])
      } else {
        setMembers([])
      }
    } catch (err: any) {
      console.error('Error fetching members:', err)
      setError(err.message || 'Failed to load team members')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-[32px] border-none shadow-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">Team Members</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-8 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-red-500">{error}</p>
            <Button 
              onClick={fetchMembers}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Try Again
            </Button>
          </div>
        ) : members.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No team members found.</p>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="border rounded-xl overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
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
            
            <DialogFooter>
              <Button
                onClick={onClose}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
