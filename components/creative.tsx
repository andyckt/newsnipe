"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Header } from "./dashboard/header"
import { Sidebar } from "./dashboard/sidebar"
import { RecordingViewer } from "./recording-viewer"
import { CandidateProfile } from "./candidate-profile"
import { SessionScheduler } from "./session-scheduler"
import { DashboardHome } from "./dashboard/tabs/dashboard-home"
// import { CandidatesTab } from "./dashboard/tabs/candidates-tab"
import { SubmissionsTab } from "./dashboard/tabs/submissions-tab"
import { CreateSnipeTab } from "./dashboard/tabs/create-snipe-tab"
import { FromAndyTab } from "./dashboard/tabs/from-andy-tab"
import { MySnipeTab } from "./dashboard/tabs/my-snipe-tab"
import { SettingsTab } from "./dashboard/tabs/settings-tab"

interface CreatedSnipe {
  id: string
  title: string
  accessType: "public"
  language: "english" | "mandarin"
  questionsCount: number
  personalDetailsEnabled: boolean
  createdAt: string
  status: "active" | "draft" | "completed"
  submissions: number
  url: string
  questions: Array<{ id: string; text: string; timer: string }>
  personalFields: Array<{ id: string; label: string; type: string; required: boolean }>
}

export function DesignaliCreative() {
  const [progress, setProgress] = useState(0)
  const [notifications, setNotifications] = useState(5)
  const [activeMenu, setActiveMenu] = useState("from-andy")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [selectedRecording, setSelectedRecording] = useState<any>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [showSessionScheduler, setShowSessionScheduler] = useState(false)

  const [createdSnipes, setCreatedSnipes] = useState<CreatedSnipe[]>([])

  // Simulate progress loading
  useEffect(() => {
    const timer = setTimeout(() => setProgress(100), 1000)
    return () => clearTimeout(timer)
  }, [])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const openRecordingViewer = (recording: any) => {
    setSelectedRecording({
      id: recording.name,
      name: recording.name,
      candidate: "John Smith",
      duration: "14:32",
      aiScore: 89,
      date: recording.modified,
      thumbnail: "/placeholder.svg",
    })
  }

  const openCandidateProfile = (candidateData: any) => {
    setSelectedCandidate({
      id: candidateData.name,
      name: candidateData.name,
      email: candidateData.email || `${candidateData.name.toLowerCase().replace(" ", ".")}@email.com`,
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      application: candidateData.application || "Spring Exchange Program",
      status: candidateData.status || "completed",
      aiScore: candidateData.aiScore || 92,
      appliedDate: "2024-01-10",
      interviewDate: "2024-01-15",
      avatar: "/placeholder.svg?height=48&width=48",
    })
  }

  const handleSnipeCreated = (formData: any) => {
    const newSnipe: CreatedSnipe = {
      id: Date.now().toString(),
      title: `Interview - ${new Date().toLocaleDateString()}`,
      accessType: "public",
      language: formData.language,
      questionsCount: formData.questions.filter((q: any) => q.text.trim()).length,
      personalDetailsEnabled: formData.includePersonalDetails,
      createdAt: new Date().toISOString().split("T")[0],
      status: "active",
      submissions: 0,
      url: `snipe.ai/interview-${Date.now()}`,
      questions: formData.questions.filter((q: any) => q.text.trim()),
      personalFields: formData.personalFields || [],
    }

    setCreatedSnipes((prev) => [newSnipe, ...prev])
    setActiveMenu("my-snipe")
  }

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <DashboardHome openRecordingViewer={openRecordingViewer} />
      // case "groups":
      //   return (
      //     <CandidatesTab
      //       openCandidateProfile={openCandidateProfile}
      //       setShowSessionScheduler={setShowSessionScheduler}
      //     />
      //   )
      case "submissions":
        return <SubmissionsTab />
      case "my-snipe":
        return <MySnipeTab createdSnipes={createdSnipes} />
      case "create-snipe":
        return <CreateSnipeTab onSnipeCreated={handleSnipeCreated} />
      case "from-andy":
        return <FromAndyTab />
      case "settings":
        return <SettingsTab />
      default:
        return <DashboardHome openRecordingViewer={openRecordingViewer} />
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <motion.div
        className="absolute inset-0 -z-10 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, rgba(120, 41, 190, 0.5) 0%, rgba(53, 71, 125, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 30% 70%, rgba(233, 30, 99, 0.5) 0%, rgba(81, 45, 168, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 70% 30%, rgba(76, 175, 80, 0.5) 0%, rgba(32, 119, 188, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 50% 50%, rgba(120, 41, 190, 0.5) 0%, rgba(53, 71, 125, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
          ],
        }}
        transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      <Sidebar
        isOpen={mobileMenuOpen}
        isMobile={true}
        expandedItems={expandedItems}
        toggleExpanded={toggleExpanded}
        onClose={() => setMobileMenuOpen(false)}
        activeMenu={activeMenu}
        onMenuSelect={setActiveMenu}
      />

      <Sidebar
        isOpen={sidebarOpen}
        isMobile={false}
        expandedItems={expandedItems}
        toggleExpanded={toggleExpanded}
        activeMenu={activeMenu}
        onMenuSelect={setActiveMenu}
      />

      {/* Main Content */}
      <div className={cn("min-h-screen transition-all duration-300 ease-in-out", sidebarOpen ? "md:pl-64" : "md:pl-0")}>
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          notifications={notifications}
        />

        {selectedRecording && (
          <RecordingViewer recording={selectedRecording} onClose={() => setSelectedRecording(null)} />
        )}

        {selectedCandidate && (
          <CandidateProfile candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
        )}

        {showSessionScheduler && <SessionScheduler onClose={() => setShowSessionScheduler(false)} />}

        <main className="flex-1 p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
