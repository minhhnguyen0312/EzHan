import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { getTodayVocab } from "@/services/vocabulary.service"
import { tryDecrypt } from "@/lib/crypto"
import type { HskLevel } from "@prisma/client"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const userKey = tryDecrypt(user.geminiApiKey) ?? undefined
    const vocabSet = await getTodayVocab(
      user.hskLevel as HskLevel,
      user.vocabCount,
      userKey
    )
    return NextResponse.json(vocabSet)
  } catch (error) {
    console.error("Failed to get today's vocab:", error)
    return NextResponse.json({ error: "Failed to fetch vocabulary" }, { status: 500 })
  }
}
