import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from "@/components/providers/session-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Snipe - See and Hear your candidate",
  description: "See and Hear your candidate",
  generator: "v0.app",
  viewport: "width=device-width, initial-scale=1.0",
  icons: {
    icon: [
      { url: '/forQRCode.png', sizes: 'any' },
    ],
    apple: [
      { url: '/forQRCode.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/forQRCode.png', color: '#000000' },
      { rel: 'shortcut icon', url: '/forQRCode.png' },
    ],
  },
  applicationName: 'Snipe',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Snipe',
  },
  themeColor: '#000000',
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
        </SessionProvider>
      </body>
    </html>
  )
}
