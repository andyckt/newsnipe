"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function UserProfile() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    })
    // Redirect to auth page
    router.push('/auth')
  }

  if (!session?.user) {
    return null
  }

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const userInitials = session.user.name ? getInitials(session.user.name) : "U"

  return (
    <div className="flex items-center gap-4 p-4">
      <Avatar className="h-10 w-10 border-2 border-primary">
        <AvatarImage src="/placeholder-user.jpg" alt={session.user.name || "User"} />
        <AvatarFallback>{userInitials}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{session.user.name}</p>
        <p className="text-sm text-muted-foreground">{session.user.email}</p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleSignOut}
        className="ml-auto"
      >
        Sign Out
      </Button>
    </div>
  )
}
