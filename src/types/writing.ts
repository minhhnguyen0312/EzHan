export interface GrammarIssue {
  original: string
  corrected: string
  explanation: string
  rule: string
}

export interface VocabSuggestion {
  context: string
  suggestion: string
  pinyin: string
  reason: string
}

export interface WritingFeedback {
  overallScore: number
  summary: string
  strengths: string[]
  grammarIssues: GrammarIssue[]
  vocabularySuggestions: VocabSuggestion[]
  rewrittenSample: string
  nextStepTip: string
}

export interface SubmissionWithFeedback {
  id: string
  submissionType: "TEXT" | "IMAGE"
  contentText: string | null
  imageUrl: string | null
  feedbackStatus: "PENDING" | "COMPLETED" | "FAILED"
  feedback: WritingFeedback | null
  submittedAt: string
  reviewedAt: string | null
  topic: {
    id: string
    date: string
    titleZh: string
    titleEn: string
    promptZh: string
    promptEn: string
  }
}
