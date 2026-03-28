import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { addMoreVocab } from "@/services/vocabulary.service"
import type { HskLevel } from "@prisma/client"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const vocabSet = await addMoreVocab(session.user.hskLevel as HskLevel, 5)
    return NextResponse.json(vocabSet)
  } catch (error) {
    console.error("Failed to add more vocab:", error)
    return NextResponse.json({ error: "Failed to generate more vocabulary" }, { status: 500 })
  }
}
