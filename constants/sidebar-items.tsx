import { LayoutDashboard, Play, Heart, Target, Video, PlusCircle, Clock } from "lucide-react"

export const sidebarItems = [
  {
    id: "from-andy",
    title: "From Andy",
    icon: <Heart />,
  },
  {
    id: "submissions",
    title: "Submissions",
    icon: <Play />,
    // badge: "8",
  },
  // {  // Commented out groups menu item
  //   id: "groups",
  //   title: "Groups",
  //   icon: <Users />,
  //   badge: "28",
  // },

  {
    id: "my-snipe",
    title: "My Snipe",
    icon: <Target />,
  },
  {
    id: "coming-soon",
    title: "What's Coming Soon",
    icon: null,
    badge: "NEW",
    badgeColor: "bg-red-500 text-white",
    badgePosition: "left",
  },
  // {
  //   id: "dashboard",
  //   title: "Dashboard",
  //   icon: <LayoutDashboard />,
  // },
]
