import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUserProgress } from "@/services/progress.service"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const progress = await getUserProgress(session.user.id)
  return NextResponse.json(progress)
}
