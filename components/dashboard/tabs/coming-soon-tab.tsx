"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ComingSoonTab() {
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
              <h2 className="text-3xl font-bold">
                Coming Soon
              </h2>
              <p className="max-w-[600px] text-white/80">
                Exciting new features are on the way! Here's a sneak peek at what we're building.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* TikTok Mode Feature */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="rounded-3xl border-0 bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2">
              {/* Feature Image/Illustration */}
              <div className="bg-gradient-to-br from-pink-500 via-red-500 to-pink-600 p-8 flex items-center justify-center">
                <div className="relative w-full aspect-square max-w-xs">
                  <div className="absolute inset-0 rounded-2xl border-4 border-white/30 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="12" r="4"></circle>
                      </svg>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-50 blur-xl"></div>
                </div>
              </div>
              
              {/* Feature Description */}
              <div className="p-8 flex flex-col justify-center">
                <div className="space-y-6">
                  <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-200 rounded-full px-3 py-1">
                    Coming Q3 2025
                  </Badge>
                  
                  <h3 className="text-2xl font-bold text-gray-900">TikTok Mode</h3>
                  
                  <div className="space-y-4 text-gray-600">
                    <p>
                      Create short-form video questions and responses that are perfect for social media sharing. Engage candidates with the format they're most comfortable with.
                    </p>
                    
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>
                        <span>Vertical video optimized for mobile</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>
                        <span>Fun filters and effects</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>
                        <span>Easy social media sharing</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Powered Summary with Analytics Feature */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="rounded-3xl border-0 bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2">
              {/* Feature Description */}
              <div className="p-8 flex flex-col justify-center order-2 md:order-1">
                <div className="space-y-6">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-full px-3 py-1">
                    Coming Q4 2025
                  </Badge>
                  
                  <h3 className="text-2xl font-bold text-gray-900">AI Powered Summary with Analytics</h3>
                  
                  <div className="space-y-4 text-gray-600">
                    <p>
                      Let AI analyze candidate responses and provide insightful summaries and metrics. Save time reviewing submissions and make data-driven decisions.
                    </p>
                    
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span>Automated response transcription</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span>Sentiment and keyword analysis</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span>Comparative candidate metrics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span>Customizable scoring criteria</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Feature Image/Illustration */}
              <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-8 flex items-center justify-center order-1 md:order-2">
                <div className="relative w-full aspect-square max-w-xs">
                  <div className="absolute inset-0 rounded-2xl border-4 border-white/30 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                      </svg>
                    </div>
                  </div>
                  <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-blue-500 opacity-50 blur-xl"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  )
}
