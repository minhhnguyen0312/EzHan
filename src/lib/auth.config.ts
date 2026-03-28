import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import type { JWT } from "next-auth/jwt"

// Lightweight auth config for Edge runtime (middleware)
// No database adapter — just providers and pages
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      checks: ["state"],
    }),
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      checks: ["state"],
    }),
  ],
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      // Always allow public routes
      if (
        pathname === "/" ||
        pathname === "/login" ||
        pathname === "/onboarding" ||
        pathname === "/offline" ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/")
      ) {
        return true
      }

      // Require login for dashboard routes
      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl))
      }

      return true
    },
  },
}
