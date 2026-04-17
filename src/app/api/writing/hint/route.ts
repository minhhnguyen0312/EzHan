import { NextRequest, NextResponse } from "next/server"
import { getGuestUser } from "@/lib/guest"
import { generateWritingHint } from "@/services/writing.service"

export async function POST(req: NextRequest) {
  const user = await getGuestUser()

  try {
    const body = await req.json()
    const { topicId } = body

    if (!topicId) {
      return NextResponse.json({ error: "topicId is required" }, { status: 400 })
    }

    const hint = await generateWritingHint({
      topicId,
      hskLevel: user.hskLevel,
    })

    return NextResponse.json({ hint })
  } catch (error) {
    console.error("Writing hint generation error:", error)
    const message = error instanceof Error ? error.message : "Hint generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
