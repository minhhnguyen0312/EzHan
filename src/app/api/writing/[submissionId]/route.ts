import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSubmission } from "@/services/writing.service"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { submissionId } = await params
  const submission = await getSubmission(submissionId, session.user.id)

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(submission)
}
