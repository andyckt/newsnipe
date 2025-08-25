import { LayoutDashboard, Play, Heart, Target, Video } from "lucide-react"

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
    badge: "8",
  },
  // {  // Commented out groups menu item
  //   id: "groups",
  //   title: "Groups",
  //   icon: <Users />,
  //   badge: "28",
  // },
  {
    id: "launch-recorder",
    title: "Launch Recorder",
    icon: <Video />,
  },
  {
    id: "my-snipe",
    title: "My Snipe",
    icon: <Target />,
    badge: "5",
  },
  {
    id: "dashboard",
    title: "Dashboard",
    icon: <LayoutDashboard />,
    badge: "3",
  },
]
