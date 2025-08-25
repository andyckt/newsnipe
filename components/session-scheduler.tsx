"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Calendar, Clock, Video, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface SessionSchedulerProps {
  onClose: () => void
}

export function SessionScheduler({ onClose }: SessionSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedCandidate, setSelectedCandidate] = useState("")
  const [interviewType, setInterviewType] = useState("")

  const upcomingSessions = [
    {
      id: 1,
      candidate: "Sarah Chen",
      email: "sarah.chen@email.com",
      date: "2024-01-25",
      time: "10:00 AM",
      type: "Exchange Program Interview",
      status: "confirmed",
      duration: "30 min",
    },
    {
      id: 2,
      candidate: "Michael Rodriguez",
      email: "michael.r@email.com",
      date: "2024-01-25",
      time: "2:00 PM",
      type: "Teaching Position Interview",
      status: "pending",
      duration: "45 min",
    },
    {
      id: 3,
      candidate: "Emma Thompson",
      email: "emma.t@email.com",
      date: "2024-01-26",
      time: "11:30 AM",
      type: "Graduate Admission Interview",
      status: "confirmed",
      duration: "25 min",
    },
  ]

  const candidates = [
    { id: 1, name: "John Smith", email: "john.smith@email.com" },
    { id: 2, name: "Lisa Wang", email: "lisa.wang@email.com" },
    { id: 3, name: "David Kim", email: "david.kim@email.com" },
    { id: 4, name: "Maria Garcia", email: "maria.garcia@email.com" },
  ]

  const interviewTypes = [
    "Initial Screening",
    "Technical Assessment",
    "Exchange Program Interview",
    "Teaching Position Interview",
    "Graduate Admission Interview",
    "Final Interview",
  ]

  const timeSlots = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
  ]

  const handleSchedule = () => {
    // Handle scheduling logic here
    console.log("Scheduling interview:", {
      candidate: selectedCandidate,
      date: selectedDate,
      time: selectedTime,
      type: interviewType,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="flex h-full max-w-6xl mx-auto">
        {/* Schedule Form */}
        <div className="w-96 bg-background border-r">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Schedule Interview</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="h-full p-4">
            <div className="space-y-6">
              <div>
                <Label htmlFor="candidate">Select Candidate</Label>
                <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Choose a candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.name}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {candidate.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{candidate.name}</p>
                            <p className="text-xs text-muted-foreground">{candidate.email}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="interview-type">Interview Type</Label>
                <Select value={interviewType} onValueChange={setInterviewType}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select interview type" />
                  </SelectTrigger>
                  <SelectContent>
                    {interviewTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="time">Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions or notes..."
                  className="rounded-xl resize-none"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSchedule}
                className="w-full rounded-xl"
                disabled={!selectedCandidate || !selectedDate || !selectedTime || !interviewType}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Interview
              </Button>
            </div>
          </ScrollArea>
        </div>

        {/* Sessions List */}
        <div className="flex-1 bg-background">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Upcoming Sessions</h3>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" />
                  Today
                </Button>
                <Button variant="outline" className="rounded-xl bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" />
                  This Week
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <motion.div key={session.id} whileHover={{ scale: 1.01 }} className="group">
                  <Card className="rounded-2xl border-2 hover:border-primary/50 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {session.candidate
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{session.candidate}</h4>
                            <p className="text-sm text-muted-foreground">{session.email}</p>
                            <p className="text-sm font-medium text-blue-600">{session.type}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{session.date}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {session.time} ({session.duration})
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-xl",
                              session.status === "confirmed" && "bg-green-50 text-green-700",
                              session.status === "pending" && "bg-amber-50 text-amber-700",
                            )}
                          >
                            {session.status === "confirmed" && <CheckCircle className="mr-1 h-3 w-3" />}
                            {session.status === "pending" && <AlertCircle className="mr-1 h-3 w-3" />}
                            {session.status}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="rounded-xl">
                            <Video className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="rounded-xl">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="rounded-xl text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
