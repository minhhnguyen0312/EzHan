import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

// Use lightweight Edge-compatible auth config in middleware (no DB adapter, no Node.js crypto)
export const { auth: middleware } = NextAuth(authConfig)

export default middleware

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.json|icons/|offline|public/).*)"],
}
