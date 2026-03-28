export const HSK_LEVELS = [
  {
    value: "HSK1",
    label: "HSK 1",
    description: "Beginner — ~150 words, basic greetings and daily life",
    vocabSize: 150,
    writingLength: "50–100 characters",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "HSK2",
    label: "HSK 2",
    description: "Elementary — ~300 words, simple descriptions and routines",
    vocabSize: 300,
    writingLength: "80–120 characters",
    color: "bg-teal-100 text-teal-800",
  },
  {
    value: "HSK3",
    label: "HSK 3",
    description: "Intermediate — ~600 words, connected sentences and opinions",
    vocabSize: 600,
    writingLength: "100–180 characters",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "HSK4",
    label: "HSK 4",
    description: "Upper-Intermediate — ~1200 words, detailed paragraphs",
    vocabSize: 1200,
    writingLength: "150–250 characters",
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    value: "HSK5",
    label: "HSK 5",
    description: "Advanced — ~2500 words, professional and academic contexts",
    vocabSize: 2500,
    writingLength: "200–350 characters",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "HSK6",
    label: "HSK 6",
    description: "Mastery — ~5000+ words, complex analysis and nuanced expression",
    vocabSize: 5000,
    writingLength: "250–450 characters",
    color: "bg-rose-100 text-rose-800",
  },
] as const

export type HskLevelValue = (typeof HSK_LEVELS)[number]["value"]

export function getHskMeta(level: string) {
  return HSK_LEVELS.find((l) => l.value === level) ?? HSK_LEVELS[0]
}
