import { z } from "zod"

export const updateSettingsSchema = z.object({
  hskLevel: z.enum(["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"]).optional(),
  vocabCount: z.number().int().min(5).max(20).optional(),
  onboardingComplete: z.boolean().optional(),
})
