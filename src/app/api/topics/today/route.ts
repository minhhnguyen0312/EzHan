import { NextResponse } from "next/server"
import { getGuestUser } from "@/lib/guest"
import { getTodayTopic } from "@/services/topics.service"
import type { HskLevel } from "@prisma/client"

export async function GET() {
  const user = await getGuestUser()

  try {
    const topic = await getTodayTopic(user.hskLevel as HskLevel)
    return NextResponse.json(topic)
  } catch (error) {
    console.error("Failed to get today's topic:", error)
    return NextResponse.json({ error: "Failed to fetch topic" }, { status: 500 })
  }
}
