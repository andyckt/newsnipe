"use client"

import type React from "react"

import { motion } from "framer-motion"
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  Plus,
  Upload,
  Mail,
  Trash2,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

interface CandidatesTabProps {
  openCandidateProfile: (candidate: any) => void
  setShowSessionScheduler: (show: boolean) => void
}

export function CandidatesTab({ openCandidateProfile, setShowSessionScheduler }: CandidatesTabProps) {
  const candidates = [
    {
      name: "Sarah Chen",
      email: "sarah.chen@email.com",
      application: "Spring Exchange Program",
      status: "completed",
      aiScore: 92,
      interviewDate: "2024-01-15",
    },
    {
      name: "Michael Rodriguez",
      email: "michael.r@email.com",
      application: "Teaching Position",
      status: "in-progress",
      aiScore: 88,
      interviewDate: "2024-01-16",
    },
    {
      name: "Emma Thompson",
      email: "emma.t@email.com",
      application: "Graduate Admission",
      status: "scheduled",
      aiScore: null,
      interviewDate: "2024-01-18",
    },
  ]

  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [groupTitle, setGroupTitle] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [candidateEmails, setCandidateEmails] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState("")
  const [groups, setGroups] = useState([
    {
      id: 1,
      title: "Spring Exchange Program",
      description: "Exchange program for spring semester 2024",
      candidates: ["sarah.chen@email.com", "john.doe@email.com", "alice.smith@email.com"],
      createdDate: "2024-01-10",
    },
    {
      id: 2,
      title: "Teaching Staff Recruitment",
      description: "Hiring new teaching staff for mathematics department",
      candidates: ["michael.r@email.com", "emma.wilson@email.com"],
      createdDate: "2024-01-12",
    },
  ])

  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [newGroupEmail, setNewGroupEmail] = useState("")

  const addEmail = () => {
    if (newEmail && !candidateEmails.includes(newEmail)) {
      setCandidateEmails([...candidateEmails, newEmail])
      setNewEmail("")
    }
  }

  const removeEmail = (email: string) => {
    setCandidateEmails(candidateEmails.filter((e) => e !== email))
  }

  const removeCandidateFromGroup = (email: string) => {
    if (selectedGroup) {
      const updatedGroup = {
        ...selectedGroup,
        candidates: selectedGroup.candidates.filter((candidate: string) => candidate !== email),
      }
      setSelectedGroup(updatedGroup)
      setGroups(groups.map((group) => (group.id === selectedGroup.id ? updatedGroup : group)))
    }
  }

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const emails = text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.includes("@"))
        setCandidateEmails([...candidateEmails, ...emails.filter((email) => !candidateEmails.includes(email))])
      }
      reader.readAsText(file)
    }
  }

  const createGroup = () => {
    if (groupTitle && candidateEmails.length > 0) {
      const newGroup = {
        id: groups.length + 1,
        title: groupTitle,
        description: groupDescription,
        candidates: candidateEmails,
        createdDate: new Date().toISOString().split("T")[0],
      }
      setGroups([...groups, newGroup])
      setGroupTitle("")
      setGroupDescription("")
      setCandidateEmails([])
      setShowCreateGroup(false)
    }
  }

  const addEmailToGroup = () => {
    if (newGroupEmail && !selectedGroup.candidates.includes(newGroupEmail)) {
      const updatedGroup = {
        ...selectedGroup,
        candidates: [...selectedGroup.candidates, newGroupEmail],
      }
      setSelectedGroup(updatedGroup)
      setGroups(groups.map((group) => (group.id === selectedGroup.id ? updatedGroup : group)))
      setNewGroupEmail("")
    }
  }

  const handleGroupCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const emails = text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.includes("@"))

        const newEmails = emails.filter((email) => !selectedGroup.candidates.includes(email))
        if (newEmails.length > 0) {
          const updatedGroup = {
            ...selectedGroup,
            candidates: [...selectedGroup.candidates, ...newEmails],
          }
          setSelectedGroup(updatedGroup)
          setGroups(groups.map((group) => (group.id === selectedGroup.id ? updatedGroup : group)))
        }
      }
      reader.readAsText(file)
    }
  }

  if (selectedGroup) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedGroup(null)} className="rounded-2xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Groups
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">{selectedGroup.title}</h2>
            {selectedGroup.description && <p className="text-muted-foreground mt-1">{selectedGroup.description}</p>}
            <p className="text-sm text-muted-foreground mt-2">
              {selectedGroup.candidates.length} candidates • Created {selectedGroup.createdDate}
            </p>
          </div>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Candidates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 p-4 bg-muted/30 rounded-2xl">
                <Label className="text-sm font-medium">Add New Candidates</Label>
                <div className="flex gap-2">
                  <Input
                    value={newGroupEmail}
                    onChange={(e) => setNewGroupEmail(e.target.value)}
                    placeholder="Enter candidate email and press Enter"
                    onKeyPress={(e) => e.key === "Enter" && addEmailToGroup()}
                    className="rounded-2xl"
                  />
                  <Button onClick={addEmailToGroup} variant="outline" className="rounded-2xl bg-transparent">
                    <Mail className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Or</span>
                  <Label htmlFor="group-csv-upload" className="cursor-pointer">
                    <Button variant="outline" asChild className="rounded-2xl bg-transparent">
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload CSV
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="group-csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleGroupCSVUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {selectedGroup.candidates.map((email: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl">
                    <span className="text-sm font-medium">{email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCandidateFromGroup(email)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {selectedGroup.candidates.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No candidates in this group</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <>
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Groups Management</h2>
              <p className="max-w-[600px] text-white/80">
                Organize candidates into groups for different interview programs and campaigns.
              </p>
            </div>
            <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
              <DialogTrigger asChild>
                <Button className="w-fit rounded-2xl bg-white text-indigo-700 hover:bg-white/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Group Title</Label>
                    <Input
                      id="title"
                      value={groupTitle}
                      onChange={(e) => setGroupTitle(e.target.value)}
                      placeholder="Enter group title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      placeholder="Enter group description"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Add Candidates</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Enter candidate email"
                        onKeyPress={(e) => e.key === "Enter" && addEmail()}
                      />
                      <Button onClick={addEmail} variant="outline">
                        <Mail className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Or</span>
                      <Label htmlFor="csv-upload" className="cursor-pointer">
                        <Button variant="outline" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload CSV
                          </span>
                        </Button>
                      </Label>
                      <Input id="csv-upload" type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
                    </div>
                    {candidateEmails.length > 0 && (
                      <div className="space-y-2">
                        <Label>Candidates ({candidateEmails.length})</Label>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {candidateEmails.map((email, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-lg">
                              <span className="text-sm">{email}</span>
                              <Button variant="ghost" size="sm" onClick={() => removeEmail(email)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateGroup(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createGroup} disabled={!groupTitle || candidateEmails.length === 0}>
                      Create Group
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>
      </section>

      <section className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <motion.div key={group.id} whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}>
              <Card className="overflow-hidden rounded-3xl border hover:border-primary/50 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{group.title}</CardTitle>
                      <CardDescription>{group.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{group.candidates.length} candidates</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{group.createdDate}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="secondary" className="flex-1 rounded-2xl" onClick={() => setSelectedGroup(group)}>
                    View Details
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-2xl bg-transparent">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Recent Candidates</h2>
          <Button variant="ghost" className="rounded-2xl">
            View All
          </Button>
        </div>
        <div className="rounded-3xl border">
          <div className="grid grid-cols-1 divide-y">
            {candidates.map((candidate) => (
              <motion.div
                key={candidate.name}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => openCandidateProfile(candidate)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{candidate.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {candidate.application} • {candidate.interviewDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {candidate.status === "completed" && (
                    <Badge variant="outline" className="rounded-xl bg-green-50 text-green-700">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Completed
                    </Badge>
                  )}
                  {candidate.status === "in-progress" && (
                    <Badge variant="outline" className="rounded-xl bg-blue-50 text-blue-700">
                      <Clock className="mr-1 h-3 w-3" />
                      In Progress
                    </Badge>
                  )}
                  {candidate.status === "scheduled" && (
                    <Badge variant="outline" className="rounded-xl bg-amber-50 text-amber-700">
                      <Calendar className="mr-1 h-3 w-3" />
                      Scheduled
                    </Badge>
                  )}
                  {candidate.aiScore && (
                    <Badge variant="secondary" className="rounded-xl">
                      AI Score: {candidate.aiScore}
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" className="rounded-xl">
                    View Profile
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
