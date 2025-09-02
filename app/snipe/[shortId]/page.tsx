"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SnipePage } from "@/components/snipe-page"

// This component handles the /snipe/[shortId] route
export default function SnipeWithShortId({ params }: { params: { shortId: string } }) {
  const router = useRouter()
  const { shortId } = params

  // We'll use the shortId to fetch the configuration data
  // Then pass it to the shared SnipePage component
  return <SnipePage shortId={shortId} />
}
