"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, Settings, LogOut, User as UserIcon, Menu, PanelLeft, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface HeaderProps {
  sidebarOpen?: boolean
  setSidebarOpen?: (open: boolean) => void
  setMobileMenuOpen?: (open: boolean) => void
  notifications?: number
}

export function Header({ 
  sidebarOpen = false, 
  setSidebarOpen = () => {}, 
  setMobileMenuOpen = () => {},
  notifications = 0 
}: HeaderProps) {
  const { data: session } = useSession()
  const [userName, setUserName] = useState<string>("")
  const [userImage, setUserImage] = useState<string>("")
  
  useEffect(() => {
    if (session?.user) {
      setUserName(session.user.name || "User")
      setUserImage(session.user.image || "")
    }
  }, [session])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth" })
  }

  const userInitials = userName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <PanelLeft className="h-5 w-5" />
      </Button>
      <div className="flex flex-1 items-center justify-between">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search"
            className="w-full rounded-2xl bg-muted pl-9 pr-4 py-2"
          />
        </div>
        <div className="flex items-center gap-3">
          {/* Notification bell commented out
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </Button>
          */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9 border-2 border-primary">
                  <AvatarImage src={userImage} alt={userName} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{userName}</p>
                  <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}