"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

const features = [
  {
    title: "What is a Snipe?",
    description:
      "Snipe is a platform that allows you to see and hear your candidates through authentic video responses.",
    videoId: "ttcW7PjHiRY",
    benefits: ["Authentic assessment", "See & hear candidates", "Prevent AI cheating"],
  },
  {
    title: "Create a Snipe",
    description: "Learn how to create your own Snipe to collect video responses from candidates.",
    videoId: "ttcW7PjHiRY", // Replace with actual video ID
    benefits: ["Easy setup", "Customizable questions", "Share with candidates"],
  },
  {
    title: "Review a Snipe",
    description: "Discover how to review and evaluate candidate responses effectively.",
    videoId: "ttcW7PjHiRY", // Replace with actual video ID
    benefits: ["Organized responses", "Evaluation tools", "Candidate comparison"],
  },
  {
    title: "Collaborate with Colleagues",
    description: "Work together with your team to review and discuss candidate submissions.",
    videoId: "ttcW7PjHiRY", // Replace with actual video ID
    benefits: ["Team collaboration", "Shared access", "Collective decision making"],
  },
]

export function FromAndyTab() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              {/* <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">AI-Powered</Badge> */}
              <h2 className="text-3xl font-bold">Welcome to Snipe</h2>
              <p className="max-w-[600px] text-white/80">
                Learn how to see & hear your candidates with our video tutorials below.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => window.dispatchEvent(new CustomEvent('navigateToTab', { detail: { tab: 'create-snipe' } }))}
                  className="rounded-2xl bg-white text-indigo-700 hover:bg-white/90"
                >
                  Start Sniping
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl bg-transparent border-white text-white hover:bg-white/10"
                >
                  View Demo
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 50, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="relative h-40 w-40"
              >
                <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md" />
                <div className="absolute inset-4 rounded-full bg-white/20" />
                <div className="absolute inset-8 rounded-full bg-white/30" />
                <div className="absolute inset-12 rounded-full bg-white/40" />
                <div className="absolute inset-16 rounded-full bg-white/50" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <div className="space-y-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="rounded-3xl border-0 bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-2 gap-10 items-center">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Badge variant="secondary" className="rounded-xl px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200">
                        {index === 0 ? "Introduction" : index === 1 ? "Tutorial" : index === 2 ? "Guide" : "Collaboration"}
                      </Badge>
                      <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Key Benefits:</h4>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-center gap-2 text-gray-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video shadow-lg border border-gray-200">
                      <iframe 
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube-nocookie.com/embed/${feature.videoId}?si=A6tTjAwdGazMJJY_&controls=1`}
                        title={`${feature.title} video`}
                        frameBorder="0"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

    </div>
  )
}
