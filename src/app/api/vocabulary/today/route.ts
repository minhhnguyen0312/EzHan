import { NextResponse } from "next/server"
import { getGuestUser } from "@/lib/guest"
import { getTodayVocab } from "@/services/vocabulary.service"
import type { HskLevel } from "@prisma/client"

export async function GET() {
  const user = await getGuestUser()

  try {
    const vocabSet = await getTodayVocab(
      user.hskLevel as HskLevel,
      user.vocabCount
    )
    return NextResponse.json(vocabSet)
  } catch (error) {
    console.error("Failed to get today's vocab:", error)
    return NextResponse.json({ error: "Failed to fetch vocabulary" }, { status: 500 })
  }
}
