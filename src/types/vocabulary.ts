export interface ExampleSentence {
  zh: string
  pinyin?: string
  en: string
  complexity: "simple" | "medium" | "complex"
}

export interface VocabularyWordData {
  id: string
  hanzi: string
  pinyin: string
  definition: string
  partOfSpeech: string
  sentences: ExampleSentence[]
  position: number
}

export interface DailyVocabSetData {
  id: string
  date: string
  hskLevel: string
  words: VocabularyWordData[]
}
