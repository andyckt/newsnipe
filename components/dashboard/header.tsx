"use client"

import { Menu, PanelLeft, Search, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  notifications: number
}

export function Header({ sidebarOpen, setSidebarOpen, setMobileMenuOpen, notifications }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <PanelLeft className="h-5 w-5" />
      </Button>
      <div className="flex flex-1 items-center justify-between">
        <div className="flex-1">  
          {/* Search bar commented out
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search"
              className="w-full rounded-2xl bg-muted pl-9 pr-4 py-2"
            />
          </div>
          */}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            {/* Animated border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-blue-400 rounded-full opacity-75 group-hover:opacity-100 blur-sm animate-border-spin animate-gradient-pulse"></div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="relative flex items-center gap-2 rounded-full px-4 py-2 bg-white dark:bg-gray-900 text-blue-600 border-none hover:text-blue-700 transition-colors"
              onClick={() => {
                // Will be implemented later
                alert('Add colleagues feature coming soon!');
              }}
            >
              <UserPlus className="h-4 w-4" />
              Add My Colleagues
            </Button>
          </div>
          
          {/* Profile icon commented out
          <Avatar className="h-9 w-9 border-2 border-primary">
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          */}
        </div>
      </div>
    </header>
  )
}
