"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

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
                Exciting new features are on the way! Stay tuned for updates.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Empty content area - will be filled later */}
      <Card className="rounded-3xl border-0 bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We're working on exciting new features for Snipe. Check back soon for updates!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
