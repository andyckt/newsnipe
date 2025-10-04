"use client"

import { useState, useEffect } from "react"
import { Menu, PanelLeft, UserPlus, Users, LogIn, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateCompanyDialog } from "@/components/company/create-company-dialog"
import { JoinCompanyDialog } from "@/components/company/join-company-dialog"
import { ViewColleaguesDialog } from "@/components/company/view-colleagues-dialog"

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  notifications: number
}

export function Header({ sidebarOpen, setSidebarOpen, setMobileMenuOpen, notifications }: HeaderProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [viewColleaguesDialogOpen, setViewColleaguesDialogOpen] = useState(false)
  const [companyInfo, setCompanyInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Function to fetch company info
  const fetchCompanyInfo = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/company/info')
      
      if (response.ok) {
        const data = await response.json()
        setCompanyInfo(data)
      }
    } catch (error) {
      console.error('Error fetching company info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch company info when component mounts
  useEffect(() => {
    fetchCompanyInfo()
  }, [])
  
  // Listen for custom event to refresh company info
  useEffect(() => {
    const handleCompanyUpdate = () => {
      fetchCompanyInfo()
    }
    
    // Add event listener
    window.addEventListener('company-updated', handleCompanyUpdate)
    
    // Clean up
    return () => {
      window.removeEventListener('company-updated', handleCompanyUpdate)
    }
  }, [])

  // Render company info and buttons
  const renderCompanySection = () => {
    return (
      <div className="flex items-center gap-3">
        {/* Admin Badge - Show if user is company creator */}
        {!isLoading && companyInfo?.hasCompany && companyInfo.isCreator && (
          <div className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full mr-4">
            Admin
          </div>
        )}
        
        {/* Loading Placeholder */}
        {isLoading && (
          <div className="h-8 w-40 bg-gray-100 animate-pulse rounded-full mr-4"></div>
        )}
        
        {/* Show different buttons based on user role */}
        {!isLoading && companyInfo?.hasCompany ? (
          // User is in a company
          companyInfo.isCreator ? (
            // User is admin - show Add Colleagues button
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-blue-400 rounded-full opacity-75 group-hover:opacity-100 blur-sm animate-border-spin animate-gradient-pulse"></div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="relative flex items-center gap-2 rounded-full px-4 py-2 bg-white dark:bg-gray-900 text-blue-600 border-none hover:text-blue-700 transition-colors"
                onClick={() => setCreateDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4" />
                Add My Colleagues
              </Button>
            </div>
          ) : (
            // User is member - show View Colleagues button
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 rounded-full px-4 py-2 bg-white text-blue-600 border border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 transition-colors"
              onClick={() => setViewColleaguesDialogOpen(true)}
            >
              <UserCheck className="h-4 w-4" />
              View My Colleagues
            </Button>
          )
        ) : (
          // User is not in a company - show both buttons
          <>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-blue-400 rounded-full opacity-75 group-hover:opacity-100 blur-sm animate-border-spin animate-gradient-pulse"></div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="relative flex items-center gap-2 rounded-full px-4 py-2 bg-white dark:bg-gray-900 text-blue-600 border-none hover:text-blue-700 transition-colors"
                onClick={() => setCreateDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4" />
                Add My Colleagues
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2 rounded-full px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
              onClick={() => setJoinDialogOpen(true)}
            >
              <LogIn className="h-4 w-4" />
              Join
            </Button>
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <PanelLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex-1"></div>
          
          {renderCompanySection()}
        </div>
      </header>
      
      <CreateCompanyDialog 
        isOpen={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)} 
      />
      
      <JoinCompanyDialog 
        isOpen={joinDialogOpen} 
        onClose={() => setJoinDialogOpen(false)} 
      />
      
      <ViewColleaguesDialog
        isOpen={viewColleaguesDialogOpen}
        onClose={() => setViewColleaguesDialogOpen(false)}
      />
    </>
  )
}