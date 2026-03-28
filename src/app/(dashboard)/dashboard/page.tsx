import { auth } from "@/lib/auth"
import { getTodayTopic } from "@/services/topics.service"
import { getTodayVocab } from "@/services/vocabulary.service"
import { getUserProgress } from "@/services/progress.service"
import { TopicCard } from "@/components/writing/topic-card"
import { VocabCard } from "@/components/vocabulary/vocab-card"
import { StreakDisplay } from "@/components/progress/streak-display"
import { LevelBadge } from "@/components/progress/level-badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { HskLevel } from "@prisma/client"
import type { VocabularyWordData } from "@/types/vocabulary"

export default async function DashboardPage() {
  const session = await auth()
  const hskLevel = (session?.user?.hskLevel ?? "HSK1") as HskLevel

  const [topic, vocabSet, progress] = await Promise.all([
    getTodayTopic(hskLevel).catch(() => null),
    getTodayVocab(hskLevel, session?.user?.vocabCount ?? 10).catch(() => null),
    getUserProgress(session?.user?.id ?? ""),
  ])

  const previewWords = (vocabSet?.words?.slice(0, 3) ?? []) as unknown as VocabularyWordData[]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today&apos;s Practice</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <StreakDisplay
            currentStreak={progress.currentStreak}
            longestStreak={progress.longestStreak}
          />
          <LevelBadge level={hskLevel} />
        </div>
      </div>

      {/* Today's Writing Topic */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">✍ Writing topic</h2>
          <Link href="/writing">
            <Button variant="ghost" size="sm">Write now →</Button>
          </Link>
        </div>
        {topic ? (
          <TopicCard topic={topic} compact />
        ) : (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
            Generating today&apos;s topic...
          </div>
        )}
      </section>

      {/* Vocabulary Preview */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">本 Vocabulary preview</h2>
          <Link href="/vocabulary">
            <Button variant="ghost" size="sm">See all {vocabSet?.words?.length ?? 10} words →</Button>
          </Link>
        </div>
        {previewWords.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {previewWords.map((word) => (
              <VocabCard key={word.id} word={word} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
            Generating today&apos;s vocabulary...
          </div>
        )}
      </section>
    </div>
  )
}
