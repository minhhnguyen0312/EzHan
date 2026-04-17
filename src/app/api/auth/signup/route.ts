import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import { createSession } from "@/lib/session"
import { signupSchema } from "@/lib/validations/auth"

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = signupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    )
  }

  try {
    const user = await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
      },
      select: { id: true, onboardingComplete: true },
    })
    await createSession(user.id)
    return NextResponse.json({
      id: user.id,
      onboardingComplete: user.onboardingComplete,
    })
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      )
    }
    console.error("Signup error:", err)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 },
    )
  }
}
