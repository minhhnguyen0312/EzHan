"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { HSK_LEVELS } from "@/lib/utils/hsk"
import { cn } from "@/lib/utils/cn"

export default function OnboardingPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleContinue() {
    if (!selected) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hskLevel: selected, onboardingComplete: true }),
      })
      if (!res.ok) throw new Error("Failed to save settings")
      // Hard redirect forces a full session re-read from the DB
      window.location.href = "/dashboard"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-600 mb-1">易汉</h1>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">
            What&apos;s your Chinese level?
          </h2>
          <p className="text-gray-500 mt-2">
            We&apos;ll tailor your daily topics and vocabulary to your level. You can change this
            anytime in settings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {HSK_LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => setSelected(level.value)}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                selected === level.value
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", level.color)}>
                  {level.label}
                </span>
                <span className="text-xs text-gray-400">{level.vocabSize}+ words</span>
              </div>
              <p className="text-sm text-gray-600">{level.description}</p>
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-4">{error}</p>
        )}

        <Button
          onClick={handleContinue}
          disabled={!selected}
          loading={loading}
          size="lg"
          className="w-full"
        >
          Start learning →
        </Button>
      </div>
    </div>
  )
}
