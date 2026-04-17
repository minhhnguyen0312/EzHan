import { z } from "zod"

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  email: z.string().trim().toLowerCase().email("Invalid email"),
})

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
