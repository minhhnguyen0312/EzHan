"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function MoreVocabButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const router = useRouter()

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/vocabulary/more", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to generate vocabulary")
      setAdded(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (added) {
    return (
      <p className="text-sm text-green-700 font-medium flex items-center gap-1.5">
        <span>✓</span> 5 new words added!
      </p>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        loading={loading}
        onClick={handleClick}
      >
        {loading ? "Generating…" : "✦ Suggest more vocabulary"}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
