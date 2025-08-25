"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  RotateCcw,
  Brain,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  User,
  MessageSquare,
  Star,
  X,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface RecordingViewerProps {
  recording: {
    id: string
    name: string
    candidate: string
    duration: string
    aiScore: number
    date: string
    thumbnail: string
  }
  onClose: () => void
}

export function RecordingViewer({ recording, onClose }: RecordingViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState([75])
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  const aiAnalysis = {
    overallScore: recording.aiScore,
    confidence: 92,
    communicationSkills: 88,
    technicalKnowledge: 85,
    problemSolving: 91,
    culturalFit: 89,
    keyInsights: [
      "Strong communication skills with clear articulation",
      "Demonstrated problem-solving approach with structured thinking",
      "Good cultural alignment with company values",
      "Technical knowledge appears solid with room for growth",
    ],
    redFlags: ["Slight hesitation when discussing team conflict resolution"],
    recommendations: [
      "Consider for next round - strong candidate overall",
      "Follow up on leadership experience in team settings",
      "Technical assessment recommended for final evaluation",
    ],
  }

  const transcript = [
    {
      time: "00:12",
      speaker: "AI",
      text: "Hello! Thank you for joining us today. Can you start by telling me about yourself and why you're interested in this exchange program?",
    },
    {
      time: "00:18",
      speaker: "Candidate",
      text: "Hi! I'm Sarah Chen, currently a junior studying International Relations at UC Berkeley. I'm really excited about this exchange program because...",
    },
    {
      time: "01:45",
      speaker: "AI",
      text: "That's great background. Can you tell me about a time when you had to adapt to a completely new environment?",
    },
    {
      time: "01:52",
      speaker: "Candidate",
      text: "Absolutely. When I first moved to California from Taiwan, I had to navigate not just a new educational system but also...",
    },
  ]

  const totalDuration = 14 * 60 + 32 // 14:32 in seconds
  const progressPercentage = (currentTime / totalDuration) * 100

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="flex h-full">
        {/* Video Player Section */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-black/50">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt={recording.candidate} />
                <AvatarFallback>
                  {recording.candidate
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-white font-medium">{recording.candidate}</h3>
                <p className="text-white/60 text-sm">{recording.name}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Video Container - 9:16 aspect ratio */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div
              className="relative bg-gray-900 rounded-2xl overflow-hidden"
              style={{ aspectRatio: "9/16", height: "80vh" }}
            >
              {/* Video placeholder */}
              <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">{recording.candidate}</p>
                  <p className="text-sm opacity-60">Interview Recording</p>
                </div>
              </div>

              {/* Play/Pause overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                <Button
                  size="icon"
                  className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-8 w-8 text-white" /> : <Play className="h-8 w-8 text-white ml-1" />}
                </Button>
              </div>

              {/* AI Analysis Overlay */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-blue-500/90 text-white backdrop-blur-sm">
                  <Brain className="mr-1 h-3 w-3" />
                  AI Score: {recording.aiScore}%
                </Badge>
              </div>
            </div>
          </div>

          {/* Video Controls */}
          <div className="p-6 bg-black/50">
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={[progressPercentage]}
                  onValueChange={(value) => setCurrentTime((value[0] / 100) * totalDuration)}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-white/60">
                  <span>
                    {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, "0")}
                  </span>
                  <span>{recording.duration}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  {/* Volume Control */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/10"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="w-20" />
                  </div>

                  {/* Playback Speed */}
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="bg-white/10 text-white rounded px-2 py-1 text-sm border-0 outline-0"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>

                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="w-96 bg-background border-l">
          <Tabs defaultValue="analysis" className="h-full flex flex-col">
            <div className="border-b p-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="analysis" className="h-full m-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-6">
                    {/* Overall Score */}
                    <Card className="rounded-2xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-blue-500" />
                          AI Analysis Score
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-blue-600 mb-2">{aiAnalysis.overallScore}%</div>
                          <div className="text-sm text-muted-foreground mb-4">Overall Performance</div>
                          <div className="flex items-center justify-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>{aiAnalysis.confidence}% Confidence</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Skill Breakdown */}
                    <Card className="rounded-2xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          Skill Assessment
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Communication</span>
                            <span>{aiAnalysis.communicationSkills}%</span>
                          </div>
                          <Progress value={aiAnalysis.communicationSkills} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Technical Knowledge</span>
                            <span>{aiAnalysis.technicalKnowledge}%</span>
                          </div>
                          <Progress value={aiAnalysis.technicalKnowledge} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Problem Solving</span>
                            <span>{aiAnalysis.problemSolving}%</span>
                          </div>
                          <Progress value={aiAnalysis.problemSolving} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Cultural Fit</span>
                            <span>{aiAnalysis.culturalFit}%</span>
                          </div>
                          <Progress value={aiAnalysis.culturalFit} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Key Insights */}
                    <Card className="rounded-2xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-yellow-500" />
                          Key Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {aiAnalysis.keyInsights.map((insight, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Red Flags */}
                    {aiAnalysis.redFlags.length > 0 && (
                      <Card className="rounded-2xl border-amber-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Areas of Concern
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {aiAnalysis.redFlags.map((flag, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                <span>{flag}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Recommendations */}
                    <Card className="rounded-2xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-500" />
                          Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {aiAnalysis.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="transcript" className="h-full m-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {transcript.map((entry, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "p-3 rounded-2xl",
                          entry.speaker === "AI"
                            ? "bg-blue-50 border-l-4 border-blue-500"
                            : "bg-green-50 border-l-4 border-green-500",
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {entry.time}
                          </Badge>
                          <span className="text-sm font-medium">
                            {entry.speaker === "AI" ? "AI Interviewer" : recording.candidate}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{entry.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="notes" className="h-full m-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    <Card className="rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg">Interview Notes</CardTitle>
                        <CardDescription>Add your observations and comments</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <textarea
                          placeholder="Add notes about this interview..."
                          className="w-full h-32 p-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button className="mt-3 rounded-xl">Save Notes</Button>
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start rounded-xl bg-transparent">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Reviewed
                        </Button>
                        <Button variant="outline" className="w-full justify-start rounded-xl bg-transparent">
                          <Star className="mr-2 h-4 w-4" />
                          Add to Favorites
                        </Button>
                        <Button variant="outline" className="w-full justify-start rounded-xl bg-transparent">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Schedule Follow-up
                        </Button>
                        <Button variant="outline" className="w-full justify-start rounded-xl bg-transparent">
                          <FileText className="mr-2 h-4 w-4" />
                          Generate Report
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
