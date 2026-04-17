"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FeedbackPanel } from "@/components/writing/feedback-panel"
import { UploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/lib/uploadthing"
import type { WritingFeedback } from "@/types/writing"

interface WritingHint {
  titleZh: string
  titleEn: string
  promptZh: string
  promptEn: string
}

interface WritingFormProps {
  topicId: string
  suggestedLength: string
  hint?: WritingHint
}

export function WritingForm({ topicId, suggestedLength, hint }: WritingFormProps) {
  const [mode, setMode] = useState<"text" | "image">("text")
  const [text, setText] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingHint, setLoadingHint] = useState(false)
  const [aiHint, setAiHint] = useState<string | null>(null)
  const [hintOpen, setHintOpen] = useState(false)
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const charCount = text.length

  async function getAiHint() {
    setLoadingHint(true)
    setError(null)
    try {
      const res = await fetch("/api/writing/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to get hint")
      setAiHint(data.hint)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get AI hint")
    } finally {
      setLoadingHint(false)
    }
  }

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      const body =
        mode === "text"
          ? { topicId, submissionType: "TEXT", contentText: text }
          : { topicId, submissionType: "IMAGE", imageUrl }

      const res = await fetch("/api/writing/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Submission failed")

      setFeedback(data.feedback)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (feedback) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Your feedback</h3>
          <Button variant="ghost" size="sm" onClick={() => setFeedback(null)}>
            ← Try again
          </Button>
        </div>
        <FeedbackPanel feedback={feedback} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setMode("text")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            mode === "text"
              ? "bg-red-50 text-red-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          ⌨ Type
        </button>
        <button
          onClick={() => setMode("image")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            mode === "image"
              ? "bg-red-50 text-red-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          📷 Upload photo
        </button>
      </div>

      {/* Hint */}
      {hint && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
          <button
            type="button"
            onClick={() => setHintOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-amber-100 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-amber-800">
              <span>💡</span>
              <span>Topic Details — {hint.titleEn}</span>
            </span>
            <span className="text-amber-600 text-xs">{hintOpen ? "▲ hide" : "▼ show"}</span>
          </button>
          {hintOpen && (
            <div className="px-4 pb-4 space-y-2 border-t border-amber-200">
              <p className="text-base text-gray-900 leading-relaxed pt-3" style={{ fontFamily: '"Noto Sans SC", sans-serif' }}>
                {hint.promptZh}
              </p>
              <p className="text-sm text-gray-500 italic">{hint.promptEn}</p>
            </div>
          )}
        </div>
      )}

      {/* AI Hint Section */}
      <div className="space-y-3">
        {!aiHint ? (
          <button
            type="button"
            onClick={getAiHint}
            disabled={loadingHint}
            className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
          >
            {loadingHint ? "✨ Generating..." : "✨ Get AI Writing Ideas"}
          </button>
        ) : (
          <div className="rounded-xl border border-red-100 bg-white p-4 space-y-2 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider">AI Writing Ideas</span>
              <button 
                onClick={() => setAiHint(null)}
                className="text-[10px] text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: '"Noto Sans SC", sans-serif' }}>
              {aiHint}
            </div>
          </div>
        )}
      </div>

      {/* Text Mode */}
      {mode === "text" && (
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="在这里写中文..."
            className="w-full min-h-[200px] p-4 border border-gray-200 rounded-xl text-lg leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
            style={{ fontFamily: '"Noto Sans SC", sans-serif' }}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">Suggested: {suggestedLength}</span>
            <span className={`text-xs ${charCount > 0 ? "text-gray-600" : "text-gray-400"}`}>
              {charCount} characters
            </span>
          </div>
        </div>
      )}

      {/* Image Mode */}
      {mode === "image" && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          {imageUrl ? (
            <div className="space-y-3">
              <img src={imageUrl} alt="Your writing" className="max-h-64 mx-auto rounded-lg" />
              <button
                onClick={() => setImageUrl(null)}
                className="text-xs text-gray-500 hover:text-red-600"
              >
                Remove and re-upload
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 mb-4 text-sm">
                Take a photo of your handwritten Chinese and upload it
              </p>
              <UploadButton<OurFileRouter, "imageUploader">
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res?.[0]) setImageUrl(res[0].ufsUrl)
                }}
                onUploadError={(error) => setError(error.message)}
              />
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
      )}

      <Button
        onClick={handleSubmit}
        loading={loading}
        disabled={mode === "text" ? !text.trim() : !imageUrl}
        size="lg"
        className="w-full"
      >
        {loading ? "Getting AI feedback..." : "Submit for review"}
      </Button>
    </div>
  )
}
