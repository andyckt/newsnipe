"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, PlayCircle, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { apps, recentFiles } from "@/constants/dashboard-data"

interface DashboardHomeProps {
  openRecordingViewer: (recording: any) => void
}

export function DashboardHome({ openRecordingViewer }: DashboardHomeProps) {
  return (
    <>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Live Interview Status</h2>
          <Button variant="ghost" className="rounded-2xl">
            View All Sessions
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="rounded-3xl border-2 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-700">3</p>
                  <p className="text-sm text-green-600">Active Interviews</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
                  <PlayCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-700">12</p>
                  <p className="text-sm text-blue-600">Scheduled Today</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-2 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-amber-700">8</p>
                  <p className="text-sm text-amber-600">Pending Review</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Active Tools</h2>
          <Button variant="ghost" className="rounded-2xl">
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {apps
            .filter((app) => app.recent)
            .map((app) => (
              <motion.div key={app.name} whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}>
                <Card className="overflow-hidden rounded-3xl border-2 hover:border-primary/50 transition-all duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">{app.icon}</div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-2xl">
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <CardTitle className="text-lg">{app.name}</CardTitle>
                    <CardDescription>{app.description}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button variant="secondary" className="w-full rounded-2xl">
                      Open
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Recent Recordings</h2>
          <Button variant="ghost" className="rounded-2xl">
            View All
          </Button>
        </div>
        <div className="rounded-3xl border">
          <div className="grid grid-cols-1 divide-y">
            {recentFiles.slice(0, 4).map((file) => (
              <motion.div
                key={file.name}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">{file.icon}</div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {file.app} • {file.modified}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => openRecordingViewer(file)}>
                    <PlayCircle className="mr-1 h-4 w-4" />
                    Play
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
