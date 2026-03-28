import { z } from "zod"

export const submitWritingSchema = z.object({
  topicId: z.string().min(1),
  submissionType: z.enum(["TEXT", "IMAGE"]),
  contentText: z.string().optional(),
  imageUrl: z.string().url().optional(),
}).refine(
  (data) => {
    if (data.submissionType === "TEXT") return !!data.contentText && data.contentText.trim().length > 0
    if (data.submissionType === "IMAGE") return !!data.imageUrl
    return false
  },
  { message: "Must provide either text content or an image URL" }
)

export const writingFeedbackSchema = z.object({
  overallScore: z.number().min(1).max(10),
  summary: z.string(),
  strengths: z.array(z.string()),
  grammarIssues: z.array(
    z.object({
      original: z.string(),
      corrected: z.string(),
      explanation: z.string(),
      rule: z.string(),
    })
  ),
  vocabularySuggestions: z.array(
    z.object({
      context: z.string(),
      suggestion: z.string(),
      pinyin: z.string(),
      reason: z.string(),
    })
  ),
  rewrittenSample: z.string(),
  nextStepTip: z.string(),
})
