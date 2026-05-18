import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type Params = {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const audio = await db.audioGeneration.findFirst({
    where: { id, userId: user.id },
    select: {
      audioData: true,
      mimeType: true,
      text: true,
    },
  })

  if (!audio) return NextResponse.json({ error: "Audio not found" }, { status: 404 })

  const fileName = encodeURIComponent(`${audio.text.slice(0, 24) || "ezhan-audio"}.wav`)
  return new NextResponse(audio.audioData, {
    headers: {
      "Content-Type": audio.mimeType,
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Cache-Control": "private, max-age=300",
    },
  })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const audio = await db.audioGeneration.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  })

  if (!audio) return NextResponse.json({ error: "Audio not found" }, { status: 404 })

  await db.audioGeneration.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
