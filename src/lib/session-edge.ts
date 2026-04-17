/**
 * Edge-safe session helpers — no Prisma, no server-only, safe for middleware.
 * Full session helpers (getCurrentUser, createSession, etc.) live in session.ts.
 */
import { jwtVerify } from "jose"

export const SESSION_COOKIE_NAME = "ezhan_session"

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error("SESSION_SECRET is not set")
  return new TextEncoder().encode(secret)
}

/**
 * Verify a raw JWT token string (from the session cookie).
 * Returns the userId on success, null if absent or invalid.
 */
export async function verifySessionCookie(
  token: string | undefined,
): Promise<string | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify<{ userId: string }>(token, getSecret())
    return typeof payload.userId === "string" ? payload.userId : null
  } catch {
    return null
  }
}
