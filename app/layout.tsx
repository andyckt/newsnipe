import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from "@/components/providers/session-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Snipe",
  description: "Access Better",
  generator: "v0.app",
  viewport: "width=device-width, initial-scale=1.0",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <SessionProvider>
          {children}
          <Toaster />
          {/* Debug link - only visible in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 right-4 z-50">
              <a 
                href="/debug" 
                className="bg-black text-white px-3 py-1 rounded-md text-sm opacity-50 hover:opacity-100 transition-opacity"
              >
                Debug Logs
              </a>
            </div>
          )}
        </SessionProvider>
      </body>
    </html>
  )
}
