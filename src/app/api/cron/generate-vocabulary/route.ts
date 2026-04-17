import { NextRequest, NextResponse } from "next/server"
import { generateAndSaveVocab } from "@/services/vocabulary.service"
import { tomorrowKey } from "@/lib/utils/date"
import { tryDecrypt } from "@/lib/crypto"
import { db } from "@/lib/db"
import type { HskLevel } from "@prisma/client"

const HSK_LEVELS: HskLevel[] = ["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"]
const DEFAULT_VOCAB_COUNT = 10

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Pick a donor user key (most-recently-updated user who has set a key)
  const donor = await db.user.findFirst({
    where: { geminiApiKey: { not: null } },
    select: { geminiApiKey: true },
    orderBy: { updatedAt: "desc" },
  })
  const userKey = tryDecrypt(donor?.geminiApiKey) ?? undefined

  const date = tomorrowKey()
  const results: Record<string, string> = {}

  for (let i = 0; i < HSK_LEVELS.length; i += 2) {
    const batch = HSK_LEVELS.slice(i, i + 2)
    await Promise.all(
      batch.map(async (level) => {
        try {
          await generateAndSaveVocab(level, date, DEFAULT_VOCAB_COUNT, userKey)
          results[level] = "ok"
        } catch (err) {
          results[level] = `error: ${err instanceof Error ? err.message : "unknown"}`
        }
      })
    )
  }

  return NextResponse.json({ date, results })
}
