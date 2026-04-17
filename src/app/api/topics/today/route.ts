import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { getTodayTopic } from "@/services/topics.service"
import { tryDecrypt } from "@/lib/crypto"
import type { HskLevel } from "@prisma/client"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const userKey = tryDecrypt(user.geminiApiKey) ?? undefined
    const topic = await getTodayTopic(user.hskLevel as HskLevel, userKey)
    return NextResponse.json(topic)
  } catch (error) {
    console.error("Failed to get today's topic:", error)
    return NextResponse.json({ error: "Failed to fetch topic" }, { status: 500 })
  }
}
