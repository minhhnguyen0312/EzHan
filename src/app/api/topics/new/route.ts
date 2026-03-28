import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { refreshTodayTopic } from "@/services/topics.service"
import type { HskLevel } from "@prisma/client"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const topic = await refreshTodayTopic(session.user.hskLevel as HskLevel, session.user.id)
    return NextResponse.json(topic)
  } catch (err) {
    console.error("Failed to refresh topic:", err)
    return NextResponse.json({ error: "Failed to generate a new topic" }, { status: 500 })
  }
}
