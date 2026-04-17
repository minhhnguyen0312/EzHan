import { NextResponse } from "next/server"
import { getGuestUser } from "@/lib/guest"
import { addMoreVocab } from "@/services/vocabulary.service"
import type { HskLevel } from "@prisma/client"

export async function POST() {
  const user = await getGuestUser()

  try {
    const vocabSet = await addMoreVocab(user.hskLevel as HskLevel, 5)
    return NextResponse.json(vocabSet)
  } catch (error) {
    console.error("Failed to add more vocab:", error)
    return NextResponse.json({ error: "Failed to generate more vocabulary" }, { status: 500 })
  }
}
