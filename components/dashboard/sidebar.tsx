"use client"

import { Settings, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { sidebarItems } from "@/constants/sidebar-items"

interface SidebarProps {
  isOpen: boolean
  isMobile?: boolean
  onClose?: () => void
  activeMenu?: string
  onMenuSelect?: (menu: string) => void
}

export function Sidebar({ isOpen, isMobile = false, onClose, activeMenu = "dashboard", onMenuSelect }: SidebarProps) {
  const sidebarClasses = cn(
    "fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-300 ease-in-out",
    isMobile ? "md:hidden" : "hidden md:block z-30",
    isOpen ? "translate-x-0" : "-translate-x-full",
  )

  const handleMenuClick = (menuId: string) => {
    onMenuSelect?.(menuId)
    if (isMobile) {
      onClose?.()
    }
  }

  return (
    <>
      {isMobile && isOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />}

      <div className={sidebarClasses}>
        <div className="flex h-full flex-col border-r">
          <div className="p-4">
            <div className="flex justify-center">
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Snipe
                </h2>
              </div>
            </div>
          </div>

          <div className="px-3 py-2">
            <Button
              onClick={() => handleMenuClick("create-snipe")}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Snipe
            </Button>
          </div>

          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() => handleMenuClick(item.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium",
                    activeMenu === item.id ? "bg-primary/10 text-primary" : "hover:bg-muted",
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="outline" className="ml-auto rounded-full px-2 py-0.5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t p-3">
            <div className="space-y-1">
              <button
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted"
                onClick={() => handleMenuClick("settings")}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>
              <button
                className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted"
                onClick={() => handleMenuClick("profile")}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span>John Doe</span>
                </div>
                <Badge variant="outline" className="ml-auto">
                  Pro
                </Badge>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
