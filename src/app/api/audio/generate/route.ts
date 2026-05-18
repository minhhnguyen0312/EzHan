import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { tryDecrypt } from "@/lib/crypto"
import { getCurrentUser } from "@/lib/session"
import { generateAudioSchema } from "@/lib/validations/audio"
import { generateGeminiSpeech, getAudioVoice } from "@/services/audio.service"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = generateAudioSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const voice = getAudioVoice(parsed.data.voiceName)
    if (!voice) {
      return NextResponse.json({ error: "Unsupported voice." }, { status: 400 })
    }

    const generated = await generateGeminiSpeech({
      text: parsed.data.text,
      voiceName: parsed.data.voiceName,
      speed: parsed.data.speed,
      apiKey: tryDecrypt(user.geminiApiKey) ?? undefined,
    })

    const audio = await db.audioGeneration.create({
      data: {
        userId: user.id,
        text: parsed.data.text,
        voiceName: parsed.data.voiceName,
        voiceLabel: voice.label,
        speed: parsed.data.speed,
        mimeType: generated.mimeType,
        sampleRate: generated.sampleRate,
        durationSeconds: generated.durationSeconds,
        audioData: Uint8Array.from(generated.audioData),
      },
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
      ...audio,
      createdAt: audio.createdAt.toISOString(),
      audioUrl: `/api/audio/${audio.id}`,
      dataUrl: `data:${generated.mimeType};base64,${generated.audioData.toString("base64")}`,
    }, { status: 201 })
  } catch (error) {
    console.error("Audio generation error:", error)
    const message = error instanceof Error ? error.message : "Audio generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
