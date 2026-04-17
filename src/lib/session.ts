import "server-only"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SignJWT, jwtVerify } from "jose"
import { db } from "@/lib/db"
import type { User } from "@prisma/client"

import { SESSION_COOKIE_NAME } from "@/lib/session-edge"

const COOKIE_NAME = SESSION_COOKIE_NAME
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error("SESSION_SECRET is not set")
  }
  return new TextEncoder().encode(secret)
}

export type SessionPayload = {
  userId: string
}

/** Sign a session JWT and write it into an HTTP-only cookie. */
export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecret())

  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  })
}

/** Verify the session cookie and return the payload, or null if absent/invalid. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, getSecret())
    if (typeof payload.userId !== "string") return null
    return { userId: payload.userId }
  } catch {
    return null
  }
}

/** Clear the session cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

/**
 * Returns the current user from the session, or null if not signed in.
 * Use at the edge of server components / route handlers; redirect as needed.
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  if (!session) return null
  const user = await db.user.findUnique({ where: { id: session.userId } })
  return user
}

/**
 * Like getCurrentUser() but throws a 401-shaped error for route handlers.
 * Route handlers should catch and return NextResponse.json({...}, { status: 401 }).
 */
export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new UnauthorizedError()
  }
  return user
}

/**
 * Pages: returns the current user, or triggers a redirect to /login.
 * Safe to call at the top of any server component.
 */
export async function requireUserForPage(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized")
    this.name = "UnauthorizedError"
  }
}

export { verifySessionCookie, SESSION_COOKIE_NAME } from "@/lib/session-edge"
