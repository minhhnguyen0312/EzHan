import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const history = await db.audioGeneration.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      text: true,
      voiceName: true,
      voiceLabel: true,
      speed: true,
      mimeType: true,
      sampleRate: true,
      durationSeconds: true,
      createdAt: true,
    },
  })

  return NextResponse.json({
    items: history.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      audioUrl: `/api/audio/${item.id}`,
    })),
  })
}
