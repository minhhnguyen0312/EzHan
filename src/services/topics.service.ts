import { db } from "@/lib/db"
import { generateDailyTopic } from "@/services/claude/topic-generation"
import { todayKey } from "@/lib/utils/date"
import type { HskLevel } from "@prisma/client"

export async function getTodayTopic(hskLevel: HskLevel) {
  const date = todayKey()

  const existing = await db.dailyTopic.findUnique({
    where: { date_hskLevel: { date, hskLevel } },
  })
  if (existing) return existing

  // On-demand generation fallback
  return generateAndSaveTopic(hskLevel, date)
}

export async function generateAndSaveTopic(hskLevel: HskLevel, date: string) {
  const recent = await db.dailyTopic.findMany({
    where: { hskLevel },
    orderBy: { createdAt: "desc" },
    take: 7,
    select: { titleEn: true },
  })
  const recentTitles = recent.map((t) => t.titleEn)

  const generated = await generateDailyTopic(hskLevel, date, recentTitles)

  return db.dailyTopic.upsert({
    where: { date_hskLevel: { date, hskLevel } },
    create: {
      date,
      hskLevel,
      ...generated,
    },
    update: {},
  })
}

/**
 * Generate a new topic for today.
 * - No submission yet → replace the main topic in-place (same record id, existing
 *   submissions stay linked).
 * - User already submitted → create / overwrite a "{date}-bonus" topic so the
 *   original topic + submission are never touched.
 */
export async function refreshTodayTopic(
  hskLevel: HskLevel,
  userId: string
): Promise<Awaited<ReturnType<typeof getTodayTopic>>> {
  const date = todayKey()

  // Check whether the user already submitted for today's main topic
  const mainTopic = await db.dailyTopic.findUnique({
    where: { date_hskLevel: { date, hskLevel } },
    include: { submissions: { where: { userId }, select: { id: true } } },
  })
  const hasMainSubmission = (mainTopic?.submissions.length ?? 0) > 0

  // Target: main date or bonus slot
  const targetDate = hasMainSubmission ? `${date}-bonus` : date

  // Gather recent titles (all levels of today included) to avoid repetition
  const recent = await db.dailyTopic.findMany({
    where: { hskLevel },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { titleEn: true },
  })
  const recentTitles = recent.map((t) => t.titleEn)

  const generated = await generateDailyTopic(hskLevel, targetDate, recentTitles)

  return db.dailyTopic.upsert({
    where: { date_hskLevel: { date: targetDate, hskLevel } },
    create: { date: targetDate, hskLevel, ...generated },
    update: { ...generated },
  })
}

/**
 * Returns the bonus topic for today if one has been generated, otherwise null.
 */
export async function getTodayBonusTopic(hskLevel: HskLevel) {
  const bonusDate = `${todayKey()}-bonus`
  return db.dailyTopic.findUnique({
    where: { date_hskLevel: { date: bonusDate, hskLevel } },
  })
}

export async function getAllHskLevels(): Promise<HskLevel[]> {
  return ["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"]
}
