import { auth } from "@/lib/auth"
import { getTodayVocab } from "@/services/vocabulary.service"
import { FlashcardDeck } from "@/components/vocabulary/flashcard-deck"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { HskLevel } from "@prisma/client"
import type { DailyVocabSetData, VocabularyWordData } from "@/types/vocabulary"

export default async function FlashcardsPage() {
  const session = await auth()
  const hskLevel = (session?.user?.hskLevel ?? "HSK1") as HskLevel
  const vocabCount = session?.user?.vocabCount ?? 10

  const vocabSet = await getTodayVocab(hskLevel, vocabCount).catch(() => null)
  const words = (vocabSet as DailyVocabSetData | null)?.words ?? []

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flashcards</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Today&apos;s {hskLevel} vocabulary &mdash; {words.length} words
          </p>
        </div>
        <Link href="/vocabulary">
          <Button variant="ghost" size="sm">← Vocabulary</Button>
        </Link>
      </div>

      {words.length > 0 ? (
        <Card>
          <CardContent className="p-6">
            <FlashcardDeck
              words={words as unknown as VocabularyWordData[]}
              hskLevel={hskLevel}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-10 text-center">
          <p className="text-gray-500 font-medium">No vocabulary available for today.</p>
          <p className="text-sm text-gray-400 mt-1">
            Head back to the{" "}
            <Link href="/vocabulary" className="text-red-600 underline underline-offset-2">
              vocabulary page
            </Link>{" "}
            to generate today&apos;s words.
          </p>
        </div>
      )}
    </div>
  )
}
