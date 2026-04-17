import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { refreshTodayTopic } from "@/services/topics.service"
import { tryDecrypt } from "@/lib/crypto"
import type { HskLevel } from "@prisma/client"

export async function POST() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const userKey = tryDecrypt(user.geminiApiKey) ?? undefined
    const topic = await refreshTodayTopic(user.hskLevel as HskLevel, user.id, userKey)
    return NextResponse.json(topic)
  } catch (err) {
    console.error("Failed to refresh topic:", err)
    return NextResponse.json({ error: "Failed to generate a new topic" }, { status: 500 })
  }
}
