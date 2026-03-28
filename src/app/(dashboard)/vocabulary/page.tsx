import { auth } from "@/lib/auth"
import { getTodayVocab } from "@/services/vocabulary.service"
import { VocabSet } from "@/components/vocabulary/vocab-set"
import { MoreVocabButton } from "@/components/vocabulary/more-vocab-button"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { HskLevel } from "@prisma/client"
import type { DailyVocabSetData } from "@/types/vocabulary"

export default async function VocabularyPage() {
  const session = await auth()
  const hskLevel = (session?.user?.hskLevel ?? "HSK1") as HskLevel
  const vocabCount = session?.user?.vocabCount ?? 10

  let vocabError: string | null = null
  const vocabSet = await getTodayVocab(hskLevel, vocabCount).catch((err: Error) => {
    vocabError = err.message
    console.error("Vocab error:", err)
    return null
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Daily Vocabulary</h1>
        <div className="flex items-center gap-2">
          <Link href="/vocabulary/flashcards">
            <Button variant="secondary" size="sm">🎴 Flashcards</Button>
          </Link>
          <Link href="/vocabulary/history">
            <Button variant="ghost" size="sm">View history →</Button>
          </Link>
        </div>
      </div>

      {vocabSet ? (
        <>
          <VocabSet data={vocabSet as unknown as DailyVocabSetData} />
          <div className="flex justify-center pt-2">
            <MoreVocabButton />
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-red-100 bg-red-50 p-10 text-center">
          <p className="text-red-700 font-medium mb-2">Unable to load vocabulary</p>
          {vocabError && (
            <p className="text-sm text-red-500 font-mono">{vocabError}</p>
          )}
        </div>
      )}
    </div>
  )
}
