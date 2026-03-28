import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getTodayTopic } from "@/services/topics.service"
import type { HskLevel } from "@prisma/client"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const topic = await getTodayTopic(session.user.hskLevel as HskLevel)
    return NextResponse.json(topic)
  } catch (error) {
    console.error("Failed to get today's topic:", error)
    return NextResponse.json({ error: "Failed to fetch topic" }, { status: 500 })
  }
}
