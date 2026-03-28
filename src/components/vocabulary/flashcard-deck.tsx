"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/cn"
import type { VocabularyWordData } from "@/types/vocabulary"

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = "select" | "study" | "quiz" | "complete"
type QuizState = "unanswered" | "correct" | "wrong"

interface QuizOption {
  word: VocabularyWordData
  isCorrect: boolean
}

interface FlashcardDeckProps {
  words: VocabularyWordData[]
  hskLevel: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function scoreMessage(score: number, total: number): { emoji: string; title: string; sub: string } {
  const pct = score / total
  if (pct === 1)   return { emoji: "🏆", title: "Perfect score!", sub: "You nailed every single word." }
  if (pct >= 0.8)  return { emoji: "🌟", title: "Excellent work!", sub: "You're mastering this vocabulary." }
  if (pct >= 0.6)  return { emoji: "👍", title: "Good effort!", sub: "A bit more practice and you'll have these down." }
  return             { emoji: "📚", title: "Keep studying!", sub: "Review the words and try again — you've got this." }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? (current / total) * 100 : 0
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
        <span>{current} / {total}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-red-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FlashcardDeck({ words, hskLevel }: FlashcardDeckProps) {
  const [screen, setScreen] = useState<Screen>("select")
  const [isQuizMode, setIsQuizMode] = useState(false)
  const [deck, setDeck] = useState<VocabularyWordData[]>([])
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [quizState, setQuizState] = useState<QuizState>("unanswered")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [animClass, setAnimClass] = useState("")
  const animTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentWord = deck[index] as VocabularyWordData | undefined
  const canQuiz = words.length >= 4

  // Quiz options — regenerated per card
  const quizOptions = useMemo<QuizOption[]>(() => {
    if (!currentWord || words.length < 4) return []
    const others = shuffleArray(words.filter((w) => w.id !== currentWord.id)).slice(0, 3)
    return shuffleArray([
      { word: currentWord, isCorrect: true },
      ...others.map((w) => ({ word: w, isCorrect: false })),
    ])
  }, [currentWord, words])

  // ── Actions ──────────────────────────────────────────────────────────────

  const startDeck = useCallback(
    (quiz: boolean) => {
      setIsQuizMode(quiz)
      setDeck(shuffleArray(words))
      setIndex(0)
      setIsFlipped(false)
      setQuizState("unanswered")
      setSelectedId(null)
      setScore(0)
      setScreen(quiz ? "quiz" : "study")
    },
    [words],
  )

  const goNext = useCallback(() => {
    if (index + 1 >= deck.length) {
      setScreen("complete")
    } else {
      setIndex((i) => i + 1)
      setIsFlipped(false)
      setQuizState("unanswered")
      setSelectedId(null)
    }
  }, [index, deck.length])

  const goPrev = useCallback(() => {
    if (index > 0) {
      setIndex((i) => i - 1)
      setIsFlipped(false)
    }
  }, [index])

  const triggerAnim = useCallback((cls: string) => {
    if (animTimeout.current) clearTimeout(animTimeout.current)
    setAnimClass(cls)
    animTimeout.current = setTimeout(() => setAnimClass(""), 500)
  }, [])

  const handleQuizSelect = useCallback(
    (option: QuizOption) => {
      if (quizState !== "unanswered") return
      setSelectedId(option.word.id)
      if (option.isCorrect) {
        setQuizState("correct")
        setScore((s) => s + 1)
        triggerAnim("pop")
      } else {
        setQuizState("wrong")
        triggerAnim("shake")
      }
    },
    [quizState, triggerAnim],
  )

  // ── Keyboard controls (study mode) ───────────────────────────────────────

  useEffect(() => {
    if (screen !== "study") return
    function onKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        if (!isFlipped) setIsFlipped(true)
        else goNext()
      } else if (e.key === "ArrowRight" && isFlipped) {
        goNext()
      } else if (e.key === "ArrowLeft") {
        goPrev()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [screen, isFlipped, goNext, goPrev])

  useEffect(() => () => { if (animTimeout.current) clearTimeout(animTimeout.current) }, [])

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN: SELECT
  // ═══════════════════════════════════════════════════════════════════════════

  if (screen === "select") {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-10">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mb-2">
            <span className="text-3xl">🎴</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Flashcard Practice</h2>
          <p className="text-gray-500 text-sm">
            {words.length} words &middot; {hskLevel}
          </p>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
          {/* Study mode */}
          <button
            onClick={() => startDeck(false)}
            className={cn(
              "group relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-200",
              "bg-white hover:border-red-300 hover:bg-red-50 transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400",
            )}
          >
            <span className="text-4xl group-hover:scale-110 transition-transform duration-200">📖</span>
            <div className="text-center">
              <p className="font-semibold text-gray-900">Study Mode</p>
              <p className="text-xs text-gray-500 mt-0.5">Flip cards to reveal meanings</p>
            </div>
            <span className="text-xs text-gray-400 mt-1">← → Space to navigate</span>
          </button>

          {/* Quiz mode */}
          <button
            onClick={() => canQuiz && startDeck(true)}
            disabled={!canQuiz}
            className={cn(
              "group relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-200",
              "bg-white transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400",
              canQuiz
                ? "hover:border-red-300 hover:bg-red-50 cursor-pointer"
                : "opacity-50 cursor-not-allowed",
            )}
          >
            <span className="text-4xl group-hover:scale-110 transition-transform duration-200">🧠</span>
            <div className="text-center">
              <p className="font-semibold text-gray-900">Quiz Mode</p>
              <p className="text-xs text-gray-500 mt-0.5">4-option multiple choice</p>
            </div>
            {!canQuiz && (
              <span className="text-xs text-gray-400">Needs ≥ 4 words</span>
            )}
          </button>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN: COMPLETE
  // ═══════════════════════════════════════════════════════════════════════════

  if (screen === "complete") {
    const msg = isQuizMode ? scoreMessage(score, deck.length) : { emoji: "✅", title: "All done!", sub: `You reviewed all ${deck.length} words.` }
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-8 text-center">
        <div className="text-7xl">{msg.emoji}</div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">{msg.title}</h2>
          <p className="text-gray-500">{msg.sub}</p>
          {isQuizMode && (
            <p className="text-2xl font-bold text-red-600 mt-3">
              {score} / {deck.length}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setScreen("select")}>
            ← Back
          </Button>
          <Button onClick={() => startDeck(isQuizMode)}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  // Guard — word must exist
  if (!currentWord) return null

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN: STUDY
  // ═══════════════════════════════════════════════════════════════════════════

  if (screen === "study") {
    return (
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setScreen("select")}>
            ← Modes
          </Button>
          <Badge variant="default">Study</Badge>
        </div>

        <ProgressBar current={index} total={deck.length} />

        {/* Flip card */}
        <div
          className="flashcard-scene w-full cursor-pointer select-none"
          style={{ height: 320 }}
          onClick={() => setIsFlipped((f) => !f)}
          role="button"
          aria-label={isFlipped ? "Card back — click to flip" : "Card front — click to reveal"}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIsFlipped(f => !f) } }}
        >
          <div className={cn("flashcard-inner", isFlipped && "flipped")}>
            {/* Front — Hanzi */}
            <div className="flashcard-face rounded-2xl border-2 border-gray-200 bg-white shadow-md flex flex-col items-center justify-center p-8">
              <p className="font-chinese text-7xl font-bold text-gray-900 leading-none mb-4">
                {currentWord.hanzi}
              </p>
              <p className="text-lg text-red-500 font-medium mb-3">{currentWord.pinyin}</p>
              <Badge variant="default" className="mt-1">{currentWord.partOfSpeech}</Badge>
              <p className="text-xs text-gray-400 mt-6 flex items-center gap-1">
                <span>↩</span> tap or press Space to reveal
              </p>
            </div>

            {/* Back — Definition + example */}
            <div className="flashcard-face flashcard-face-back rounded-2xl border-2 border-red-200 bg-red-50 shadow-md flex flex-col justify-between p-8">
              <div>
                <p className="font-chinese text-3xl font-bold text-gray-900 mb-1">{currentWord.hanzi}</p>
                <p className="text-sm text-red-500 font-medium mb-4">{currentWord.pinyin}</p>
                <p className="text-xl font-semibold text-gray-800 leading-snug">{currentWord.definition}</p>
              </div>

              {currentWord.sentences.length > 0 && (
                <div className="mt-5 border-t border-red-200 pt-4 space-y-0.5">
                  <p className="font-chinese text-sm text-gray-700 font-medium leading-relaxed">
                    {currentWord.sentences[0].zh}
                  </p>
                  {currentWord.sentences[0].pinyin && (
                    <p className="text-xs text-red-400 font-medium">{currentWord.sentences[0].pinyin}</p>
                  )}
                  <p className="text-xs text-gray-500 italic">{currentWord.sentences[0].en}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button variant="secondary" onClick={goPrev} disabled={index === 0}>
            ← Prev
          </Button>
          <p className="text-xs text-gray-400 text-center">
            {isFlipped ? "Press → or Next when ready" : "Flip the card first"}
          </p>
          <Button onClick={goNext} disabled={!isFlipped}>
            {index + 1 >= deck.length ? "Finish" : "Next →"}
          </Button>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN: QUIZ
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setScreen("select")}>
          ← Modes
        </Button>
        <div className="flex items-center gap-3">
          <Badge variant="success">{score} correct</Badge>
          <Badge variant="default">Quiz</Badge>
        </div>
      </div>

      <ProgressBar current={index} total={deck.length} />

      {/* Question card */}
      <div
        className={cn(
          "rounded-2xl border-2 bg-white shadow-md flex flex-col items-center justify-center p-10 text-center",
          quizState === "correct" ? "border-green-300 bg-green-50" : "border-gray-200",
          animClass,
        )}
        style={{ minHeight: 200 }}
      >
        <p className="font-chinese text-7xl font-bold text-gray-900 leading-none mb-4">
          {currentWord.hanzi}
        </p>
        <p className="text-lg text-red-500 font-medium">{currentWord.pinyin}</p>

        {quizState !== "unanswered" && (
          <p className={cn("text-sm font-semibold mt-4", quizState === "correct" ? "text-green-700" : "text-red-700")}>
            {quizState === "correct" ? "✓ Correct!" : `✗ The answer was: ${currentWord.definition}`}
          </p>
        )}
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quizOptions.map((option) => {
          const isSelected = selectedId === option.word.id
          const answered = quizState !== "unanswered"

          let borderClass = "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          if (answered && option.isCorrect) {
            borderClass = "border-green-400 bg-green-50"
          } else if (answered && isSelected && !option.isCorrect) {
            borderClass = "border-red-400 bg-red-50"
          } else if (answered) {
            borderClass = "border-gray-200 opacity-50"
          }

          return (
            <button
              key={option.word.id}
              onClick={() => handleQuizSelect(option)}
              disabled={answered}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400",
                borderClass,
                !answered && "cursor-pointer",
              )}
            >
              <p className="text-sm font-medium text-gray-900 leading-snug">{option.word.definition}</p>
              {answered && option.isCorrect && (
                <p className="font-chinese text-xs text-green-600 mt-1 font-semibold">{option.word.hanzi}</p>
              )}
            </button>
          )
        })}
      </div>

      {/* Next button — shows after answering */}
      {quizState !== "unanswered" && (
        <div className="flex justify-end">
          <Button onClick={goNext}>
            {index + 1 >= deck.length ? "See results →" : "Next →"}
          </Button>
        </div>
      )}
    </div>
  )
}
