import { NextResponse } from "next/server"
import { getGuestUser } from "@/lib/guest"
import { refreshTodayTopic } from "@/services/topics.service"
import type { HskLevel } from "@prisma/client"

export async function POST() {
  const user = await getGuestUser()

  try {
    const topic = await refreshTodayTopic(user.hskLevel as HskLevel, user.id)
    return NextResponse.json(topic)
  } catch (err) {
    console.error("Failed to refresh topic:", err)
    return NextResponse.json({ error: "Failed to generate a new topic" }, { status: 500 })
  }
}
