import { db } from "@/lib/db"

export async function getUserProgress(userId: string) {
  const progress = await db.userProgress.findUnique({
    where: { userId },
  })

  if (!progress) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalSubmissions: 0,
      totalWordsStudied: 0,
      lastActivityDate: null,
    }
  }

  return progress
}

export async function incrementWordsStudied(userId: string, count: number) {
  await db.userProgress.upsert({
    where: { userId },
    create: {
      userId,
      totalWordsStudied: count,
    },
    update: {
      totalWordsStudied: { increment: count },
    },
  })
}
