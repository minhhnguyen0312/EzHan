import { llamaChat, parseJsonResponse } from "@/lib/llama"
import { writingFeedbackSchema } from "@/lib/validations/writing"
import type { WritingFeedback } from "@/types/writing"

interface ReviewInput {
  topic: {
    titleZh: string
    titleEn: string
    promptZh: string
    promptEn: string
  }
  userWriting: string
  hskLevel: string
  submissionType: "TEXT" | "IMAGE"
  imageUrl?: string
}

const REVIEW_SCHEMA = `{
  "overallScore": <number 1-10>,
  "summary": "<2-3 sentence overall assessment in English>",
  "strengths": ["<specific thing done well, cite Chinese text if possible>"],
  "grammarIssues": [
    {
      "original": "<the problematic phrase>",
      "corrected": "<the corrected version>",
      "explanation": "<why, in English>",
      "rule": "<grammar rule name>"
    }
  ],
  "vocabularySuggestions": [
    {
      "context": "<sentence where improvement applies>",
      "suggestion": "<better word/phrase in Chinese>",
      "pinyin": "<pinyin with tones>",
      "reason": "<why this is more natural/precise>"
    }
  ],
  "rewrittenSample": "<model rewrite of 1-2 key sentences showing corrections>",
  "nextStepTip": "<one actionable learning tip for this student's level>"
}`

export async function reviewWriting(input: ReviewInput): Promise<WritingFeedback> {
  const { topic, userWriting, hskLevel, submissionType } = input

  const topicContext = `Today's writing topic: "${topic.titleEn}" (${topic.titleZh})
Prompt: ${topic.promptZh}
(${topic.promptEn})`

  const systemInstruction = `You are an expert Chinese language teacher specializing in ${hskLevel} students.
Your role is to review student writing and provide structured, encouraging feedback.
Always respond with valid JSON matching the exact schema provided.
Be specific, cite examples from the student's writing, and provide corrected versions.
Keep feedback constructive and motivating — focus on growth, not just errors.`

  if (submissionType === "IMAGE") {
    throw new Error("Image submissions are not supported by the local model.")
  }

  const userPrompt = `${topicContext}

Student's HSK level: ${hskLevel}
Student's writing:
---
${userWriting}
---

Review this Chinese writing submission and respond with JSON in exactly this schema:
${REVIEW_SCHEMA}`

  const text = await llamaChat({
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    maxTokens: 1400,
    responseFormat: { type: "json_object" },
  })

  const parsed = parseJsonResponse(text)
  return writingFeedbackSchema.parse(parsed)
}
