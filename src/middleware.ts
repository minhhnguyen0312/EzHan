import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySessionCookie, SESSION_COOKIE_NAME } from "@/lib/session-edge"

// Public routes accessible without a session.
const PUBLIC_PATHS = ["/login", "/signup", "/offline"]
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/cron", "/api/uploadthing"]

function isPublic(pathname: string): boolean {
  if (pathname === "/") return true
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true
  }
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) return true
  return false
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublic(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const userId = await verifySessionCookie(token)

  if (!userId) {
    // API routes get a JSON 401, page routes get a redirect to /login.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.json|icons/|public/).*)",
  ],
}
