import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createSession } from "@/lib/session"
import { assertAuthRuntimeConfig, getAuthDatabaseErrorMessage } from "@/lib/config"
import { loginSchema } from "@/lib/validations/auth"

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    )
  }

  try {
    assertAuthRuntimeConfig()

    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, onboardingComplete: true },
    })
    if (!user) {
      return NextResponse.json(
        { error: "No account with that email. Sign up first." },
        { status: 404 },
      )
    }

    await createSession(user.id)
    return NextResponse.json({
      id: user.id,
      onboardingComplete: user.onboardingComplete,
    })
  } catch (error) {
    const configMessage = getAuthDatabaseErrorMessage(error)
    if (configMessage) {
      console.error("Login configuration error:", error)
      return NextResponse.json({ error: configMessage }, { status: 500 })
    }

    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 })
  }
}
