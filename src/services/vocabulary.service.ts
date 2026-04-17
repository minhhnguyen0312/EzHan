import { db } from "@/lib/db"
import { generateDailyVocab } from "@/services/claude/vocab-generation"
import { todayKey } from "@/lib/utils/date"
import type { HskLevel } from "@prisma/client"

export async function getTodayVocab(hskLevel: HskLevel, vocabCount = 10, userKey?: string) {
  const date = todayKey()

  const existing = await db.dailyVocabularySet.findUnique({
    where: { date_hskLevel: { date, hskLevel } },
    include: { words: { orderBy: { position: "asc" } } },
  })
  if (existing) return existing

  // On-demand fallback
  return generateAndSaveVocab(hskLevel, date, vocabCount, userKey)
}

export async function generateAndSaveVocab(
  hskLevel: HskLevel,
  date: string,
  count = 10,
  userKey?: string
) {
  // Fetch recent words to avoid repetition
  const recentSets = await db.dailyVocabularySet.findMany({
    where: { hskLevel },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { words: { select: { hanzi: true } } },
  })
  const recentWords = recentSets.flatMap((s) => s.words.map((w) => w.hanzi))

  const words = await generateDailyVocab(hskLevel, count, date, recentWords, userKey)

  return db.dailyVocabularySet.upsert({
    where: { date_hskLevel: { date, hskLevel } },
    update: {}, // If it exists, just return it (or we could update words, but usually we just want to avoid the error)
    create: {
      date,
      hskLevel,
      words: {
        create: words.map((w, i) => ({
          hanzi: w.hanzi,
          pinyin: w.pinyin,
          definition: w.definition,
          partOfSpeech: w.partOfSpeech,
          sentences: w.sentences,
          position: i + 1,
        })),
      },
    },
    include: { words: { orderBy: { position: "asc" } } },
  })
}

/**
 * Append more words to today's existing vocabulary set.
 * Excludes all words already in today's set and recent days to avoid repeats.
 */
export async function addMoreVocab(hskLevel: HskLevel, count = 5, userKey?: string) {
  const date = todayKey()

  const existingSet = await db.dailyVocabularySet.findUnique({
    where: { date_hskLevel: { date, hskLevel } },
    include: { words: { orderBy: { position: "asc" } } },
  })

  // No set yet — just do the normal generation
  if (!existingSet) return getTodayVocab(hskLevel, count, userKey)

  const existingHanzi = existingSet.words.map((w) => w.hanzi)

  const recentSets = await db.dailyVocabularySet.findMany({
    where: { hskLevel, NOT: { date } },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { words: { select: { hanzi: true } } },
  })
  const excludeWords = [
    ...existingHanzi,
    ...recentSets.flatMap((s) => s.words.map((w) => w.hanzi)),
  ]

  const newWords = await generateDailyVocab(hskLevel, count, date, excludeWords, userKey)

  const lastPosition = existingSet.words.at(-1)?.position ?? 0

  await db.vocabularyWord.createMany({
    data: newWords.map((w, i) => ({
      setId: existingSet.id,
      hanzi: w.hanzi,
      pinyin: w.pinyin,
      definition: w.definition,
      partOfSpeech: w.partOfSpeech,
      sentences: w.sentences,
      position: lastPosition + i + 1,
    })),
  })

  return db.dailyVocabularySet.findUniqueOrThrow({
    where: { id: existingSet.id },
    include: { words: { orderBy: { position: "asc" } } },
  })
}

export async function getVocabHistory(hskLevel: HskLevel, limit = 30) {
  return db.dailyVocabularySet.findMany({
    where: { hskLevel },
    orderBy: { date: "desc" },
    take: limit,
    include: { words: { orderBy: { position: "asc" } } },
  })
}
