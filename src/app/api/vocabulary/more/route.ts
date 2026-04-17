import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { addMoreVocab } from "@/services/vocabulary.service"
import { tryDecrypt } from "@/lib/crypto"
import type { HskLevel } from "@prisma/client"

export async function POST() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const userKey = tryDecrypt(user.geminiApiKey) ?? undefined
    const vocabSet = await addMoreVocab(user.hskLevel as HskLevel, 5, userKey)
    return NextResponse.json(vocabSet)
  } catch (error) {
    console.error("Failed to add more vocab:", error)
    return NextResponse.json({ error: "Failed to generate more vocabulary" }, { status: 500 })
  }
}
