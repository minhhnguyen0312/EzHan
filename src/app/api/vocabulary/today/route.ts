import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getTodayVocab } from "@/services/vocabulary.service"
import type { HskLevel } from "@prisma/client"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const vocabSet = await getTodayVocab(
      session.user.hskLevel as HskLevel,
      session.user.vocabCount
    )
    return NextResponse.json(vocabSet)
  } catch (error) {
    console.error("Failed to get today's vocab:", error)
    return NextResponse.json({ error: "Failed to fetch vocabulary" }, { status: 500 })
  }
}
