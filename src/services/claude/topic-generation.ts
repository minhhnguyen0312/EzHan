import { llamaChat, parseJsonResponse } from "@/lib/llama"
import { z } from "zod"

const topicOutputSchema = z.object({
  titleZh: z.string(),
  titleEn: z.string(),
  promptZh: z.string(),
  promptEn: z.string(),
  suggestedLength: z.string(),
})

type TopicOutput = z.infer<typeof topicOutputSchema>

const HSK_LEVEL_CONTEXT: Record<string, string> = {
  HSK1: "HSK1 (150 vocabulary words). Students write very simple sentences about daily life, family, and greetings. Target length: 50–100 characters.",
  HSK2: "HSK2 (300 words). Students write basic descriptions of routines, preferences, and simple events. Target length: 80–120 characters.",
  HSK3: "HSK3 (600 words). Students write connected sentences expressing experiences and opinions on familiar subjects. Target length: 100–180 characters.",
  HSK4: "HSK4 (1200 words). Students write detailed paragraphs on social issues, comparisons, and abstract concepts. Target length: 150–250 characters.",
  HSK5: "HSK5 (2500 words). Students write extended discourse on culture, society, and professional contexts. Target length: 200–350 characters.",
  HSK6: "HSK6 (5000+ words). Students produce nuanced arguments on current events and complex analysis. Target length: 250–450 characters.",
}

export async function generateDailyTopic(
  hskLevel: string,
  date: string,
  recentTopics: string[] = [],
  userKey?: string
): Promise<TopicOutput> {
  const levelContext = HSK_LEVEL_CONTEXT[hskLevel] ?? HSK_LEVEL_CONTEXT["HSK1"]

  const prompt = `You are a Chinese language teacher creating engaging daily writing topics for HSK students.
Topics should be culturally relevant, level-appropriate, and encourage authentic personal expression.
Respond only with valid JSON — no markdown, no explanation, just the JSON object.

Create a writing topic for ${hskLevel} students for date ${date}.

Student level context: ${levelContext}

${recentTopics.length > 0 ? `Recent topics to avoid repeating: ${recentTopics.join(", ")}` : ""}

Requirements:
1. The topic must suit the student's vocabulary and grammar level
2. It should have a specific, interesting angle (not generic like "describe your family")
3. Be culturally appropriate and engaging for Chinese learners
4. Include a clear, specific writing prompt in both Chinese and English

Respond with JSON in exactly this schema:
{
  "titleZh": "string (topic title in Chinese, under 15 characters)",
  "titleEn": "string (topic title in English)",
  "promptZh": "string (full writing prompt in Chinese, 1-3 sentences)",
  "promptEn": "string (full writing prompt in English translation)",
  "suggestedLength": "string (e.g. '50-100个字' for HSK1)"
}`

  const text = await llamaChat({
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    maxTokens: 900,
    responseFormat: { type: "json_object" },
    apiKey: userKey,
  })

  const parsed = parseJsonResponse(text)
  return topicOutputSchema.parse(parsed)
}
