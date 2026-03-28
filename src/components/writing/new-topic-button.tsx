"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function NewTopicButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/topics/new", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to generate a new topic")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        loading={loading}
        onClick={handleClick}
        title="Generate a different writing topic for today"
      >
        {loading ? "Generating…" : "✦ New topic"}
      </Button>
      {error && (
        <p className="text-xs text-red-600 text-right max-w-[220px]">{error}</p>
      )}
    </div>
  )
}
