"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Heart, Target, Lightbulb } from "lucide-react"

const features = [
  {
    title: "AI Voice Interviews",
    description:
      "Real-time AI-powered voice interviews that prevent cheating and provide authentic candidate assessment.",
    videoUrl: "/placeholder.svg?height=300&width=500",
    benefits: ["Prevents AI cheating", "Real-time assessment", "Natural conversation flow"],
  },
  {
    title: "Smart Recording Analysis",
    description: "Advanced AI analysis of interview recordings with detailed insights and candidate scoring.",
    videoUrl: "/placeholder.svg?height=300&width=500",
    benefits: ["Intelligent scoring", "Detailed insights", "Performance metrics"],
  },
  {
    title: "Group Management",
    description: "Organize candidates into groups for different programs, with bulk import and easy management.",
    videoUrl: "/placeholder.svg?height=300&width=500",
    benefits: ["Bulk candidate import", "Program organization", "Easy management"],
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
              <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">AI-Powered</Badge>
              <h2 className="text-3xl font-bold">Welcome to Snipe</h2>
              <p className="max-w-[600px] text-white/80">
                Revolutionize your hiring and assessment process with AI-powered voice interviews that eliminate
                cheating and provide deep candidate insights.
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
            <Card className="rounded-3xl border-0 bg-gradient-to-br from-white to-gray-50 shadow-lg">
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Badge variant="secondary" className="rounded-xl px-3 py-1">
                        Feature {index + 1}
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
                    <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video">
                      <img
                        src={feature.videoUrl || "/placeholder.svg"}
                        alt={`${feature.title} demo`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
                        >
                          <Play className="w-6 h-6 text-gray-900 ml-1" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Why I Do This Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border border-slate-100/50">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5" />
          <div className="relative p-16">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-6">
                <h2 className="text-4xl font-light text-slate-900 tracking-tight">
                  Why I Do{" "}
                  <span className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    This
                  </span>
                </h2>

                <div className="w-16 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto" />

                <div className="space-y-8 text-slate-600">
                  <p className="text-xl leading-relaxed font-light">
                    I've witnessed firsthand how traditional application processes have become compromised by AI tools.
                    Students and job applicants can easily generate perfect responses using ChatGPT, making it
                    impossible to assess their true capabilities and character.
                  </p>
                  <p className="text-xl leading-relaxed font-light">
                    This isn't just about preventing cheating—it's about creating authentic connections between
                    organizations and candidates. Real conversations reveal personality, critical thinking, and genuine
                    passion that no AI can replicate.
                  </p>
                </div>

                <div className="relative mt-12 p-8 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <blockquote className="text-lg font-medium text-slate-700 italic">
                    "Every authentic conversation is worth a thousand perfect AI-generated responses."
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* My Mission Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 border border-emerald-100/50">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-500/5" />
          <div className="relative p-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 mb-8">
                  <Target className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-4xl font-light text-slate-900 tracking-tight mb-6">
                  My{" "}
                  <span className="font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Mission
                  </span>
                </h2>

                <div className="w-16 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto mb-8" />

                <h3 className="text-2xl font-light text-slate-700 leading-relaxed max-w-2xl mx-auto">
                  To restore authenticity in human assessment and selection processes.
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-12 mb-16">
                <div className="relative">
                  <div className="absolute -top-2 -left-2 w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl opacity-60" />
                  <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-sm">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      Current Challenge
                    </h4>
                    <p className="text-slate-600 leading-relaxed font-light">
                      Organizations struggle to identify genuine candidates as AI tools make it easy to generate perfect
                      application responses, masking true abilities and character.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl opacity-60" />
                  <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-sm">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      Our Solution
                    </h4>
                    <p className="text-slate-600 leading-relaxed font-light">
                      Through Snipe's AI-powered voice interviews, we reveal authentic human qualities that no AI can
                      replicate, ensuring decisions are based on genuine merit.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 rounded-3xl blur-xl" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-white/60 shadow-sm text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-6">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-slate-900 mb-6">Vision for the Future</h4>
                  <p className="text-lg text-slate-600 leading-relaxed font-light max-w-3xl mx-auto">
                    A world where merit, authenticity, and real human connection drive important life decisions. Every
                    interview should reveal the person behind the application, not the AI behind the screen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
