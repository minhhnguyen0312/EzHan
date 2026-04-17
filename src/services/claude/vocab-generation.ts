import { llamaChat, parseJsonResponse } from "@/lib/llama"
import { z } from "zod"

const sentenceSchema = z.object({
  zh: z.string(),
  pinyin: z.string(),
  en: z.string(),
  complexity: z.enum(["simple", "medium", "complex"]),
})

const wordSchema = z.object({
  hanzi: z.string(),
  pinyin: z.string(),
  definition: z.string(),
  partOfSpeech: z.string(),
  sentences: z.array(sentenceSchema).length(3),
})

const vocabOutputSchema = z.object({
  words: z.array(wordSchema),
})

export type GeneratedWord = z.infer<typeof wordSchema>

const HSK_SENTENCE_GUIDE: Record<string, string> = {
  HSK1: "Sentence 1 (simple): Subject + Verb only, 3-6 characters. Sentence 2 (medium): S+V+O, 6-10 characters. Sentence 3 (complex): Adds a basic time or location word, 8-14 characters.",
  HSK2: "Sentence 1 (simple): S+V+O, 5-8 characters. Sentence 2 (medium): Adds an adverb or measure word, 8-14 characters. Sentence 3 (complex): Two clauses using 但是 or 因为, 12-18 characters.",
  HSK3: "Sentence 1 (simple): S+V+O, 6-10 characters. Sentence 2 (medium): Uses time, place, or complement, 10-16 characters. Sentence 3 (complex): Includes a 把/被 construction or result complement, 14-22 characters.",
  HSK4: "Sentence 1 (simple): Clear S+V+O with one modifier, 8-12 characters. Sentence 2 (medium): Uses 虽然…但是 or 不管…都, 12-20 characters. Sentence 3 (complex): Includes a relative clause or formal structure, 18-28 characters.",
  HSK5: "Sentence 1 (simple): Clean professional sentence, 8-14 characters. Sentence 2 (medium): Uses 尽管/即便 or formal connectors, 14-22 characters. Sentence 3 (complex): Academic/professional register with complex structure, 20-35 characters.",
  HSK6: "Sentence 1 (simple): Formal but clear, 10-16 characters. Sentence 2 (medium): Idiomatic expression or 4-character chengyu in context, 16-26 characters. Sentence 3 (complex): Argumentative sentence with multiple clauses and nuanced vocabulary, 25-45 characters.",
}

export async function generateDailyVocab(
  hskLevel: string,
  count: number,
  date: string,
  existingWords: string[] = []
): Promise<GeneratedWord[]> {
  const sentenceGuide = HSK_SENTENCE_GUIDE[hskLevel] ?? HSK_SENTENCE_GUIDE["HSK1"]

  const prompt = `You are a Chinese language curriculum designer creating daily vocabulary sets for HSK learners.
Generate vocabulary appropriate for the specified HSK level.
Respond only with valid JSON — no markdown, no explanation, just the JSON object.
Ensure example sentences genuinely progress in grammatical complexity as specified.

Generate ${count} Chinese vocabulary words for ${hskLevel} students for ${date}.

${existingWords.length > 0 ? `Do not repeat these recently used words: ${existingWords.join(", ")}` : ""}

For each word, the THREE example sentences must follow this complexity progression:
${sentenceGuide}

Each sentence must include Chinese (zh), full sentence pinyin with tone marks (pinyin), and English (en) translation.
The sentences must use the vocabulary word naturally.

Respond with JSON in exactly this schema:
{
  "words": [
    {
      "hanzi": "string (the Chinese word/phrase)",
      "pinyin": "string (with tone marks, e.g. nǐ hǎo)",
      "definition": "string (clear English definition)",
      "partOfSpeech": "string (noun/verb/adjective/adverb/measure word/etc)",
      "sentences": [
        { "zh": "string", "pinyin": "string (full sentence pinyin with tone marks)", "en": "string", "complexity": "simple" },
        { "zh": "string", "pinyin": "string (full sentence pinyin with tone marks)", "en": "string", "complexity": "medium" },
        { "zh": "string", "pinyin": "string (full sentence pinyin with tone marks)", "en": "string", "complexity": "complex" }
      ]
    }
  ]
}`

  const text = await llamaChat({
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    maxTokens: 3000,
    responseFormat: { type: "json_object" },
  })

  let parsed: unknown
  try {
    parsed = parseJsonResponse(text)
  } catch (e) {
    console.error("Vocab JSON parse failed. Raw response:", text)
    throw new Error(`JSON parse error: ${e}`)
  }

  const validated = vocabOutputSchema.safeParse(parsed)
  if (!validated.success) {
    console.error("Vocab Zod validation failed:", JSON.stringify(validated.error.issues, null, 2))
    console.error("Parsed data:", JSON.stringify(parsed, null, 2))
    throw new Error(`Validation error: ${validated.error.issues[0]?.message ?? "unknown"}`)
  }
  return validated.data.words
}
