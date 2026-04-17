import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { db } from "@/lib/db"
import { updateSettingsSchema } from "@/lib/validations/settings"
import { encrypt, tryDecrypt, maskKey } from "@/lib/crypto"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      hskLevel: true,
      vocabCount: true,
      onboardingComplete: true,
      geminiApiKey: true,
    },
  })

  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const plainKey = tryDecrypt(dbUser.geminiApiKey)
  const hasGeminiApiKey = plainKey !== null
  const geminiApiKeyPreview = plainKey ? maskKey(plainKey) : null

  return NextResponse.json({
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    image: dbUser.image,
    hskLevel: dbUser.hskLevel,
    vocabCount: dbUser.vocabCount,
    onboardingComplete: dbUser.onboardingComplete,
    hasGeminiApiKey,
    geminiApiKeyPreview,
  })
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = updateSettingsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { geminiApiKey, ...otherFields } = parsed.data

    // Build the DB update payload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = { ...otherFields }

    if (geminiApiKey !== undefined) {
      // null → clear the key; string → encrypt and store
      data.geminiApiKey = geminiApiKey === null ? null : encrypt(geminiApiKey)
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        hskLevel: true,
        vocabCount: true,
        onboardingComplete: true,
        geminiApiKey: true,
      },
    })

    const plainKey = tryDecrypt(updated.geminiApiKey)
    const hasGeminiApiKey = plainKey !== null
    const geminiApiKeyPreview = plainKey ? maskKey(plainKey) : null

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      image: updated.image,
      hskLevel: updated.hskLevel,
      vocabCount: updated.vocabCount,
      onboardingComplete: updated.onboardingComplete,
      hasGeminiApiKey,
      geminiApiKeyPreview,
    })
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
