"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function FixSchemaPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const fixSchema = async () => {
    try {
      setStatus("loading")
      setMessage("Fixing schema...")

      const response = await fetch("/api/snipe/fix-schema", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fix schema")
      }

      setStatus("success")
      setMessage("Schema fixed successfully!")
    } catch (error: any) {
      console.error("Error fixing schema:", error)
      setStatus("error")
      setMessage(`Error: ${error.message}`)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Fix Database Schema</h1>
      <p className="mb-4">
        This page allows you to fix the uniqueId index in the snipe collection.
        Use this if you're experiencing duplicate key errors.
      </p>

      <div className="flex flex-col items-start gap-4">
        <Button
          onClick={fixSchema}
          disabled={status === "loading"}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {status === "loading" ? "Fixing..." : "Fix Schema"}
        </Button>

        {message && (
          <div
            className={`p-4 rounded-md ${
              status === "success"
                ? "bg-green-100 text-green-800"
                : status === "error"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
