"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { HSK_LEVELS } from "@/lib/utils/hsk"
import { cn } from "@/lib/utils/cn"
import { Card, CardContent } from "@/components/ui/card"

interface UserSettings {
  id: string
  name: string | null
  email: string
  image: string | null
  hskLevel: string
  vocabCount: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [hskLevel, setHskLevel] = useState("HSK1")
  const [vocabCount, setVocabCount] = useState(10)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data)
        setHskLevel(data.hskLevel)
        setVocabCount(data.vocabCount)
      })
  }, [])

  async function handleSave() {
    setSaving(true)
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hskLevel, vocabCount }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  if (!settings) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Profile (read-only) */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-4">Profile</h2>
          <div className="flex items-center gap-4">
            {settings.image ? (
              <img src={settings.image} alt="" className="h-12 w-12 rounded-full" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                {settings.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{settings.name ?? "Learner"}</p>
              <p className="text-sm text-gray-500">{settings.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HSK Level */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-4">HSK Level</h2>
          <div className="grid grid-cols-2 gap-2">
            {HSK_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => setHskLevel(level.value)}
                className={cn(
                  "p-3 rounded-lg border-2 text-left transition-all",
                  hskLevel === level.value
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", level.color)}>
                  {level.label}
                </span>
                <p className="text-xs text-gray-500 mt-1 truncate">{level.description.split("—")[0]}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vocab Count */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-1">
            Daily vocabulary count
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            How many new words to study each day (5–20)
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={5}
              max={20}
              value={vocabCount}
              onChange={(e) => setVocabCount(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-lg font-bold text-gray-900 w-8 text-center">{vocabCount}</span>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        loading={saving}
        size="lg"
        className="w-full"
      >
        {saved ? "✓ Saved!" : "Save changes"}
      </Button>
    </div>
  )
}
