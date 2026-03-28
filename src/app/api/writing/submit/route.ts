import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { submitWriting } from "@/services/writing.service"
import { submitWritingSchema } from "@/lib/validations/writing"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = submitWritingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const result = await submitWriting({
      userId: session.user.id,
      topicId: parsed.data.topicId,
      submissionType: parsed.data.submissionType,
      contentText: parsed.data.contentText,
      imageUrl: parsed.data.imageUrl,
      hskLevel: session.user.hskLevel,
    })

    if (result.alreadyExists) {
      return NextResponse.json(
        { message: "Already submitted for this topic", submission: result.submission },
        { status: 200 }
      )
    }

    return NextResponse.json(result.submission, { status: 201 })
  } catch (error) {
    console.error("Writing submission error:", error)
    const message = error instanceof Error ? error.message : "Submission failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
