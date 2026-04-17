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
  hasGeminiApiKey: boolean
  geminiApiKeyPreview: string | null
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [hskLevel, setHskLevel] = useState("HSK1")
  const [vocabCount, setVocabCount] = useState(10)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Gemini key state
  const [geminiKeyInput, setGeminiKeyInput] = useState("")
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [keySaving, setKeySaving] = useState(false)
  const [keyError, setKeyError] = useState<string | null>(null)
  const [keySuccess, setKeySuccess] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: UserSettings) => {
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

  async function handleSaveGeminiKey() {
    setKeyError(null)
    setKeySuccess(null)
    if (!geminiKeyInput.trim()) return
    setKeySaving(true)
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ geminiApiKey: geminiKeyInput.trim() }),
    })
    const data = await res.json()
    setKeySaving(false)
    if (!res.ok) {
      const msg = data?.error?.fieldErrors?.geminiApiKey?.[0] ?? data?.error ?? "Invalid key"
      setKeyError(typeof msg === "string" ? msg : "Invalid Gemini API key format")
    } else {
      setSettings((s) => s ? { ...s, hasGeminiApiKey: data.hasGeminiApiKey, geminiApiKeyPreview: data.geminiApiKeyPreview } : s)
      setGeminiKeyInput("")
      setShowKeyInput(false)
      setKeySuccess("Key saved and encrypted successfully.")
      setTimeout(() => setKeySuccess(null), 4000)
    }
  }

  async function handleRemoveGeminiKey() {
    setKeyError(null)
    setKeySuccess(null)
    setKeySaving(true)
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ geminiApiKey: null }),
    })
    const data = await res.json()
    setKeySaving(false)
    if (res.ok) {
      setSettings((s) => s ? { ...s, hasGeminiApiKey: data.hasGeminiApiKey, geminiApiKeyPreview: null } : s)
      setKeySuccess("Key removed. Using shared server key.")
      setTimeout(() => setKeySuccess(null), 4000)
    }
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

      {/* Gemini API Key */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-gray-900">Gemini API Key</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Optional. Bring your own key to use your Gemini quota for AI features.
              </p>
            </div>
            <span className={cn(
              "shrink-0 text-xs font-medium px-2 py-1 rounded-full",
              settings.hasGeminiApiKey
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-500"
            )}>
              {settings.hasGeminiApiKey ? "Using your key" : "Using shared key"}
            </span>
          </div>

          {settings.hasGeminiApiKey && !showKeyInput && (
            <div className="flex items-center gap-3">
              <code className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded font-mono">
                {settings.geminiApiKeyPreview}
              </code>
              <button
                type="button"
                onClick={() => setShowKeyInput(true)}
                className="text-xs text-blue-600 hover:underline"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemoveGeminiKey}
                disabled={keySaving}
                className="text-xs text-red-500 hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          )}

          {(!settings.hasGeminiApiKey || showKeyInput) && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => { setGeminiKeyInput(e.target.value); setKeyError(null) }}
                  placeholder="AIza…"
                  autoComplete="off"
                  className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                />
                <Button
                  onClick={handleSaveGeminiKey}
                  loading={keySaving}
                  disabled={!geminiKeyInput.trim()}
                  size="sm"
                >
                  Save
                </Button>
                {showKeyInput && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setShowKeyInput(false); setGeminiKeyInput(""); setKeyError(null) }}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              <p className="text-xs text-gray-400">
                Get your free key at{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  aistudio.google.com
                </a>
              </p>

              {keyError && (
                <p className="text-xs text-red-600">{keyError}</p>
              )}

              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 leading-relaxed">
                🔒 Your key is encrypted at rest with AES-256-GCM on our server and only
                decrypted in-memory when making a request on your behalf. We never log it,
                never show it back to you, and never send it anywhere except Google&apos;s Gemini API.
              </p>
            </div>
          )}

          {keySuccess && (
            <p className="text-xs text-green-600">{keySuccess}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
