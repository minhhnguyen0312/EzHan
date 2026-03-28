import { NextRequest, NextResponse } from "next/server"
import { generateAndSaveTopic } from "@/services/topics.service"
import { tomorrowKey } from "@/lib/utils/date"
import type { HskLevel } from "@prisma/client"

const HSK_LEVELS: HskLevel[] = ["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"]

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const date = tomorrowKey()
  const results: Record<string, string> = {}

  // Process in pairs to respect rate limits
  for (let i = 0; i < HSK_LEVELS.length; i += 2) {
    const batch = HSK_LEVELS.slice(i, i + 2)
    await Promise.all(
      batch.map(async (level) => {
        try {
          await generateAndSaveTopic(level, date)
          results[level] = "ok"
        } catch (err) {
          results[level] = `error: ${err instanceof Error ? err.message : "unknown"}`
        }
      })
    )
  }

  return NextResponse.json({ date, results })
}
