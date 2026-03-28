import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import { authConfig } from "@/lib/auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(db) as any,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On sign-in, user object is available — fetch extra fields from DB
      if (user) {
        token.id = user.id
        const dbUser = await db.user.findUnique({
          where: { id: user.id! },
          select: { hskLevel: true, vocabCount: true, onboardingComplete: true },
        })
        if (dbUser) {
          token.hskLevel = dbUser.hskLevel
          token.vocabCount = dbUser.vocabCount
          token.onboardingComplete = dbUser.onboardingComplete
        }
      }

      // On session update (e.g. after settings change), re-fetch from DB
      if (trigger === "update" && token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { hskLevel: true, vocabCount: true, onboardingComplete: true },
        })
        if (dbUser) {
          token.hskLevel = dbUser.hskLevel
          token.vocabCount = dbUser.vocabCount
          token.onboardingComplete = dbUser.onboardingComplete
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.hskLevel = (token.hskLevel as string) ?? "HSK1"
        session.user.vocabCount = (token.vocabCount as number) ?? 10
        session.user.onboardingComplete = (token.onboardingComplete as boolean) ?? false
      }
      return session
    },
  },
})
