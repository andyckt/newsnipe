import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Snipe - Record Video Responses",
  description: "Record video responses with audio prompts",
}

export default function SnipeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
