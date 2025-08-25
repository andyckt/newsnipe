"use client"

import { useState } from "react"
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Star,
  FileText,
  MessageSquare,
  Video,
  Brain,
  CheckCircle,
  Edit,
  Save,
  DeleteIcon as Cancel,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface CandidateProfileProps {
  candidate: {
    id: string
    name: string
    email: string
    phone?: string
    location?: string
    application: string
    status: string
    aiScore: number
    appliedDate: string
    interviewDate?: string
    avatar?: string
  }
  onClose: () => void
}

export function CandidateProfile({ candidate, onClose }: CandidateProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedCandidate, setEditedCandidate] = useState(candidate)

  const interviewHistory = [
    {
      date: "2024-01-15",
      type: "Initial Screening",
      duration: "15:30",
      score: 85,
      status: "completed",
      interviewer: "AI Agent",
    },
    {
      date: "2024-01-18",
      type: "Technical Assessment",
      duration: "25:45",
      score: 92,
      status: "completed",
      interviewer: "AI Agent",
    },
    {
      date: "2024-01-22",
      type: "Final Interview",
      duration: "18:20",
      score: 89,
      status: "completed",
      interviewer: "AI Agent",
    },
  ]

  const notes = [
    {
      id: 1,
      author: "John Doe",
      date: "2024-01-20",
      content:
        "Strong communication skills demonstrated throughout the interview. Shows good understanding of the program requirements.",
    },
    {
      id: 2,
      author: "Sarah Wilson",
      date: "2024-01-18",
      content: "Technical knowledge is solid. Recommended for next round.",
    },
  ]

  const handleSave = () => {
    // Here you would typically save to your backend
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedCandidate(candidate)
    setIsEditing(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="flex h-full">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-background border-b">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={candidate.avatar || "/placeholder.svg?height=48&width=48"} alt={candidate.name} />
                <AvatarFallback>
                  {candidate.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold">{candidate.name}</h2>
                <p className="text-muted-foreground">{candidate.application}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)} className="rounded-xl">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel} className="rounded-xl bg-transparent">
                    <Cancel className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="rounded-xl">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              )}
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="overview" className="h-full flex flex-col">
              <div className="border-b p-4">
                <TabsList className="grid w-full grid-cols-4 max-w-md">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="interviews">Interviews</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="overview" className="h-full m-0">
                  <ScrollArea className="h-full p-6">
                    <div className="space-y-6">
                      {/* Status and Score */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="rounded-2xl">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "mt-1 rounded-xl",
                                    candidate.status === "completed" && "bg-green-50 text-green-700",
                                    candidate.status === "in-progress" && "bg-blue-50 text-blue-700",
                                    candidate.status === "pending" && "bg-amber-50 text-amber-700",
                                  )}
                                >
                                  {candidate.status}
                                </Badge>
                              </div>
                              <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="rounded-2xl">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">AI Score</p>
                                <p className="text-2xl font-bold text-blue-600">{candidate.aiScore}%</p>
                              </div>
                              <Brain className="h-8 w-8 text-blue-500" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="rounded-2xl">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Interviews</p>
                                <p className="text-2xl font-bold">{interviewHistory.length}</p>
                              </div>
                              <Video className="h-8 w-8 text-purple-500" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Personal Information */}
                      <Card className="rounded-2xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Full Name</Label>
                              {isEditing ? (
                                <Input
                                  id="name"
                                  value={editedCandidate.name}
                                  onChange={(e) => setEditedCandidate({ ...editedCandidate, name: e.target.value })}
                                  className="rounded-xl"
                                />
                              ) : (
                                <p className="mt-1 p-2">{candidate.name}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="email">Email</Label>
                              {isEditing ? (
                                <Input
                                  id="email"
                                  type="email"
                                  value={editedCandidate.email}
                                  onChange={(e) => setEditedCandidate({ ...editedCandidate, email: e.target.value })}
                                  className="rounded-xl"
                                />
                              ) : (
                                <p className="mt-1 p-2 flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  {candidate.email}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone</Label>
                              {isEditing ? (
                                <Input
                                  id="phone"
                                  value={editedCandidate.phone || ""}
                                  onChange={(e) => setEditedCandidate({ ...editedCandidate, phone: e.target.value })}
                                  className="rounded-xl"
                                />
                              ) : (
                                <p className="mt-1 p-2 flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  {candidate.phone || "Not provided"}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="location">Location</Label>
                              {isEditing ? (
                                <Input
                                  id="location"
                                  value={editedCandidate.location || ""}
                                  onChange={(e) => setEditedCandidate({ ...editedCandidate, location: e.target.value })}
                                  className="rounded-xl"
                                />
                              ) : (
                                <p className="mt-1 p-2 flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {candidate.location || "Not provided"}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Application Details */}
                      <Card className="rounded-2xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Application Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Program/Position</Label>
                              <p className="mt-1 p-2">{candidate.application}</p>
                            </div>
                            <div>
                              <Label>Application Date</Label>
                              <p className="mt-1 p-2 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {candidate.appliedDate}
                              </p>
                            </div>
                            {candidate.interviewDate && (
                              <div>
                                <Label>Interview Date</Label>
                                <p className="mt-1 p-2 flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  {candidate.interviewDate}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick Actions */}
                      <Card className="rounded-2xl">
                        <CardHeader>
                          <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Button variant="outline" className="rounded-xl bg-transparent">
                              <Video className="mr-2 h-4 w-4" />
                              Schedule Interview
                            </Button>
                            <Button variant="outline" className="rounded-xl bg-transparent">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Send Message
                            </Button>
                            <Button variant="outline" className="rounded-xl bg-transparent">
                              <FileText className="mr-2 h-4 w-4" />
                              Generate Report
                            </Button>
                            <Button variant="outline" className="rounded-xl bg-transparent">
                              <Star className="mr-2 h-4 w-4" />
                              Add to Favorites
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="interviews" className="h-full m-0">
                  <ScrollArea className="h-full p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Interview History</h3>
                        <Button className="rounded-xl">
                          <Video className="mr-2 h-4 w-4" />
                          Schedule New Interview
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {interviewHistory.map((interview, index) => (
                          <Card key={index} className="rounded-2xl">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100">
                                    <Video className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{interview.type}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {interview.date} • {interview.duration} • {interview.interviewer}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <p className="font-medium">{interview.score}%</p>
                                    <Badge variant="outline" className="rounded-xl bg-green-50 text-green-700">
                                      {interview.status}
                                    </Badge>
                                  </div>
                                  <Button variant="ghost" size="sm" className="rounded-xl">
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="documents" className="h-full m-0">
                  <ScrollArea className="h-full p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Documents & Files</h3>
                        <Button className="rounded-xl">
                          <FileText className="mr-2 h-4 w-4" />
                          Upload Document
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="rounded-2xl">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <FileText className="h-8 w-8 text-blue-500" />
                              <div>
                                <p className="font-medium">Resume.pdf</p>
                                <p className="text-sm text-muted-foreground">Uploaded 2 weeks ago • 1.2 MB</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="rounded-2xl">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <FileText className="h-8 w-8 text-green-500" />
                              <div>
                                <p className="font-medium">Cover Letter.pdf</p>
                                <p className="text-sm text-muted-foreground">Uploaded 2 weeks ago • 0.8 MB</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="rounded-2xl">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <FileText className="h-8 w-8 text-purple-500" />
                              <div>
                                <p className="font-medium">Transcript.pdf</p>
                                <p className="text-sm text-muted-foreground">Uploaded 1 week ago • 2.1 MB</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="rounded-2xl">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Video className="h-8 w-8 text-red-500" />
                              <div>
                                <p className="font-medium">Interview Recording.mp4</p>
                                <p className="text-sm text-muted-foreground">Generated yesterday • 124.5 MB</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="notes" className="h-full m-0">
                  <ScrollArea className="h-full p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Notes & Comments</h3>
                        <Button className="rounded-xl">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Add Note
                        </Button>
                      </div>

                      <Card className="rounded-2xl">
                        <CardContent className="p-4">
                          <Textarea
                            placeholder="Add a note about this candidate..."
                            className="rounded-xl resize-none"
                            rows={3}
                          />
                          <Button className="mt-3 rounded-xl">Save Note</Button>
                        </CardContent>
                      </Card>

                      <div className="space-y-3">
                        {notes.map((note) => (
                          <Card key={note.id} className="rounded-2xl">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {note.author
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-sm">{note.author}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">{note.date}</span>
                              </div>
                              <p className="text-sm">{note.content}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
