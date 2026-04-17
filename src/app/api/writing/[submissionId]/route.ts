import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { getSubmission } from "@/services/writing.service"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { submissionId } = await params
  const submission = await getSubmission(submissionId, user.id)

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(submission)
}
