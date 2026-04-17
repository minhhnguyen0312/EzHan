import { NextRequest, NextResponse } from "next/server"
import { getGuestUser } from "@/lib/guest"
import { getSubmission } from "@/services/writing.service"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const user = await getGuestUser()

  const { submissionId } = await params
  const submission = await getSubmission(submissionId, user.id)

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(submission)
}
