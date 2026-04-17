import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { generateWritingHint } from "@/services/writing.service"
import { tryDecrypt } from "@/lib/crypto"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { topicId } = body

    if (!topicId) {
      return NextResponse.json({ error: "topicId is required" }, { status: 400 })
    }

    const userKey = tryDecrypt(user.geminiApiKey) ?? undefined

    const hint = await generateWritingHint({
      topicId,
      hskLevel: user.hskLevel,
      userKey,
    })

    return NextResponse.json({ hint })
  } catch (error) {
    console.error("Writing hint generation error:", error)
    const message = error instanceof Error ? error.message : "Hint generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
