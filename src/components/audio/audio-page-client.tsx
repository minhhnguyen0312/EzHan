"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AUDIO_SPEEDS, AUDIO_TEXT_LIMIT, AUDIO_VOICES, type AudioHistoryItem } from "@/types/audio"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils/cn"

type GenerateAudioResponse = AudioHistoryItem & {
  dataUrl: string
}

function speedLabel(value: string) {
  return AUDIO_SPEEDS.find((item) => item.value === value)?.label ?? value
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "—"
  return `${seconds} giây`
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))
}

export function AudioPageClient() {
  const [text, setText] = useState("学")
  const [voiceName, setVoiceName] = useState<(typeof AUDIO_VOICES)[number]["voiceName"]>("Aoede")
  const [speed, setSpeed] = useState<(typeof AUDIO_SPEEDS)[number]["value"]>("normal")
  const [history, setHistory] = useState<AudioHistoryItem[]>([])
  const [current, setCurrent] = useState<GenerateAudioResponse | AudioHistoryItem | null>(null)
  const [audioSrc, setAudioSrc] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const selectedVoice = useMemo(
    () => AUDIO_VOICES.find((voice) => voice.voiceName === voiceName) ?? AUDIO_VOICES[0],
    [voiceName],
  )

  useEffect(() => {
    fetch("/api/audio/history")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.items)) setHistory(data.items)
      })
      .catch(() => setError("Không thể tải lịch sử audio."))
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)

    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("ended", onEnded)

    return () => {
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("ended", onEnded)
    }
  }, [audioSrc])

  async function generateAudio() {
    setError(null)
    setIsGenerating(true)
    try {
      const res = await fetch("/api/audio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceName, speed }),
      })
      const data = await res.json()
      if (!res.ok) {
        const message = typeof data.error === "string"
          ? data.error
          : data.error?.fieldErrors?.text?.[0] ?? "Không thể tạo audio."
        throw new Error(message)
      }

      const generated = data as GenerateAudioResponse
      setCurrent(generated)
      setAudioSrc(generated.dataUrl)
      setHistory((items) => [generated, ...items.filter((item) => item.id !== generated.id)].slice(0, 20))
      setTimeout(() => audioRef.current?.play().catch(() => undefined), 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo audio.")
    } finally {
      setIsGenerating(false)
    }
  }

  async function playItem(item: AudioHistoryItem) {
    setCurrent(item)
    setAudioSrc(item.audioUrl)
    setTimeout(() => audioRef.current?.play().catch(() => undefined), 0)
  }

  async function deleteItem(id: string) {
    setError(null)
    const res = await fetch(`/api/audio/${id}`, { method: "DELETE" })
    if (!res.ok) {
      setError("Không thể xóa audio.")
      return
    }
    setHistory((items) => items.filter((item) => item.id !== id))
    if (current?.id === id) {
      setCurrent(null)
      setAudioSrc(null)
    }
  }

  function togglePlayback() {
    const audio = audioRef.current
    if (!audio || !audioSrc) return
    if (audio.paused) audio.play().catch(() => setError("Trình duyệt không thể phát audio này."))
    else audio.pause()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-red-600">Gemini 3.1 Flash TTS</p>
          <h1 className="text-2xl font-bold text-gray-900">Audio</h1>
          <p className="text-sm text-gray-500">Generate Mandarin pronunciation from Hanzi text.</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-red-100 bg-red-50/60">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-xl text-white">
              声
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tạo audio</h2>
              <p className="text-sm text-gray-500">Nhập chữ Hán, chọn giọng đọc và tốc độ.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="audio-text" className="text-sm font-medium text-gray-800">
                    Nội dung
                  </label>
                  <span className={cn("text-xs", text.length > AUDIO_TEXT_LIMIT ? "text-red-600" : "text-gray-400")}>
                    {text.length}/{AUDIO_TEXT_LIMIT}
                  </span>
                </div>
                <textarea
                  id="audio-text"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  className="min-h-36 w-full resize-y rounded-lg border border-gray-200 bg-white p-4 font-chinese text-3xl leading-relaxed text-gray-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  placeholder="输入汉字..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="audio-voice" className="mb-2 block text-sm font-medium text-gray-800">
                    Giọng đọc
                  </label>
                  <select
                    id="audio-voice"
                    value={voiceName}
                    onChange={(event) => setVoiceName(event.target.value as typeof voiceName)}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  >
                    {AUDIO_VOICES.map((voice) => (
                      <option key={voice.voiceName} value={voice.voiceName}>
                        {voice.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="audio-speed" className="mb-2 block text-sm font-medium text-gray-800">
                    Tốc độ
                  </label>
                  <select
                    id="audio-speed"
                    value={speed}
                    onChange={(event) => setSpeed(event.target.value as typeof speed)}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  >
                    {AUDIO_SPEEDS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-lg border border-red-100 bg-gradient-to-b from-red-50 to-white p-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-red-600">Đang chọn</p>
                <div className="mt-3 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                    <span className="text-gray-500">Giọng</span>
                    <span className="font-medium text-gray-900">{selectedVoice.label}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                    <span className="text-gray-500">Tốc độ</span>
                    <span className="font-medium text-gray-900">{speedLabel(speed)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-2">
                <Button
                  onClick={generateAudio}
                  loading={isGenerating}
                  disabled={!text.trim() || text.length > AUDIO_TEXT_LIMIT}
                  className="w-full"
                >
                  ◉ Tạo audio
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setText("")
                    setError(null)
                  }}
                  className="w-full"
                >
                  Xóa nội dung
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <audio ref={audioRef} src={audioSrc ?? undefined} preload="metadata" className="hidden" />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={togglePlayback}
                disabled={!audioSrc || isGenerating}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-red-200 bg-white text-2xl text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
                aria-label={isPlaying ? "Pause audio" : "Play audio"}
              >
                {isPlaying ? "Ⅱ" : "▶"}
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {isGenerating ? "Đang tạo audio..." : current ? current.text : "Chưa có audio"}
                </p>
                <p className="text-xs text-gray-500">
                  {current
                    ? `${current.voiceLabel} · ${speedLabel(current.speed)} · ${formatDuration(current.durationSeconds)}`
                    : "Audio mới sẽ tự phát sau khi tạo xong."}
                </p>
              </div>
              {current && (
                <a
                  href={current.audioUrl}
                  download={`${current.text.slice(0, 24) || "ezhan-audio"}.wav`}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Tải xuống
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Lịch sử audio</h2>
          <p className="text-sm text-gray-500">20 audio gần nhất được lưu cho tài khoản này.</p>
        </CardHeader>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Chưa có audio nào. Tạo audio đầu tiên từ chữ Hán ở trên.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {history.map((item) => (
                <div key={item.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_120px_120px_110px] sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate font-chinese text-xl font-semibold text-gray-900">{item.text}</p>
                    <p className="text-xs text-gray-500">{formatTime(item.createdAt)}</p>
                  </div>
                  <p className="text-sm text-gray-700">{item.voiceLabel}</p>
                  <p className="text-sm text-gray-700">{speedLabel(item.speed)}</p>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => playItem(item)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-red-100 text-red-600 transition hover:bg-red-50"
                      aria-label="Play audio"
                    >
                      ▶
                    </button>
                    <a
                      href={item.audioUrl}
                      download={`${item.text.slice(0, 24) || "ezhan-audio"}.wav`}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-gray-50"
                      aria-label="Download audio"
                    >
                      ↓
                    </a>
                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-red-100 text-red-600 transition hover:bg-red-50"
                      aria-label="Delete audio"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
