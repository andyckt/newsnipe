"use client"

import { useState, useEffect } from "react"
import { Menu, PanelLeft, UserPlus, Users, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateCompanyDialog } from "@/components/company/create-company-dialog"
import { JoinCompanyDialog } from "@/components/company/join-company-dialog"

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  notifications: number
}

export function Header({ sidebarOpen, setSidebarOpen, setMobileMenuOpen, notifications }: HeaderProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [companyInfo, setCompanyInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch company info when component mounts
  useEffect(() => {
    const fetchCompanyInfo = async () => {
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
    
    fetchCompanyInfo()
  }, [])

  // Render company info or buttons
  const renderCompanySection = () => {
    if (isLoading) {
      return <div className="h-8 w-40 bg-gray-100 animate-pulse rounded-full"></div>
    }
    
    if (companyInfo?.hasCompany) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          <span>Company: <span className="font-medium text-gray-700">{companyInfo.company.name}</span></span>
          {companyInfo.isCreator && (
            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Admin</div>
          )}
        </div>
      )
    }
    
    return (
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
          
          <div className="flex items-center gap-3">
            {renderCompanySection()}
          </div>
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
    </>
  )
}