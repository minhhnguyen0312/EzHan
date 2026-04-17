import { NextResponse } from "next/server"
import { getGuestUser } from "@/lib/guest"
import { getUserProgress } from "@/services/progress.service"

export async function GET() {
  const user = await getGuestUser()
  const progress = await getUserProgress(user.id)
  return NextResponse.json(progress)
}
