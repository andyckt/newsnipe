"use client"

import { Settings, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { sidebarItems } from "@/constants/sidebar-items"
import UserProfile from "@/components/user-profile"

interface SidebarProps {
  isOpen: boolean
  isMobile?: boolean
  onClose?: () => void
  activeMenu?: string
  onMenuSelect?: (menu: string) => void
  expandedItems?: Record<string, boolean>
  toggleExpanded?: (title: string) => void
}

export function Sidebar({ isOpen, isMobile = false, onClose, activeMenu = "dashboard", onMenuSelect, expandedItems, toggleExpanded }: SidebarProps) {
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
                  Snipe 1.0
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
                  <div className={cn(
                    "flex items-center",
                    item.badgePosition === "left" ? "gap-1" : "gap-3"
                  )}>
                    {item.icon && item.icon}
                    {item.badgePosition === "left" && item.badge && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "mr-0.5 rounded-full px-1.5 py-0.5 text-xs font-bold",
                          item.badgeColor || ""
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                    <span>{item.title}</span>
                  </div>
                  {item.badge && item.badgePosition !== "left" && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "ml-auto rounded-full px-2 py-0.5 text-xs font-bold",
                        item.badgeColor || ""
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t mt-2">
            <UserProfile />
          </div>
        </div>
      </div>
    </>
  )
}
