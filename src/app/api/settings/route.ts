import { NextRequest, NextResponse } from "next/server"
import { getGuestUser } from "@/lib/guest"
import { db } from "@/lib/db"
import { updateSettingsSchema } from "@/lib/validations/settings"

export async function GET() {
  const user = await getGuestUser()

  const settings = await db.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      hskLevel: true,
      vocabCount: true,
      onboardingComplete: true,
    },
  })

  return NextResponse.json(settings)
}

export async function PATCH(req: NextRequest) {
  const user = await getGuestUser()

  try {
    const body = await req.json()
    const parsed = updateSettingsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        hskLevel: true,
        vocabCount: true,
        onboardingComplete: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
