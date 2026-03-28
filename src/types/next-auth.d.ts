import { type DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      hskLevel: string
      vocabCount: number
      onboardingComplete: boolean
    } & DefaultSession["user"]
  }

  interface User {
    hskLevel: string
    vocabCount: number
    onboardingComplete: boolean
  }
}
