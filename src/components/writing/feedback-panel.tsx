import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { WritingFeedback } from "@/types/writing"

interface FeedbackPanelProps {
  feedback: WritingFeedback
}

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 8 ? "text-green-600" : score >= 6 ? "text-yellow-600" : "text-red-500"
  return (
    <div className={`text-4xl font-bold ${color}`}>
      {score}
      <span className="text-lg text-gray-400">/10</span>
    </div>
  )
}

export function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  return (
    <div className="space-y-4">
      {/* Score + Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <ScoreRing score={feedback.overallScore} />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Overall Assessment</h3>
              <p className="text-sm text-gray-600">{feedback.summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <h3 className="font-semibold text-green-700 flex items-center gap-2">
              ✓ What you did well
            </h3>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-green-500 shrink-0">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Grammar Issues */}
      {feedback.grammarIssues.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <h3 className="font-semibold text-amber-700 flex items-center gap-2">
              ◆ Grammar corrections
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedback.grammarIssues.map((issue, i) => (
              <div key={i} className="border-l-2 border-amber-300 pl-4">
                <div className="flex flex-wrap gap-2 items-center mb-1">
                  <span className="text-sm line-through text-red-500">{issue.original}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-sm font-medium text-green-700">{issue.corrected}</span>
                  <Badge variant="warning" className="text-xs">{issue.rule}</Badge>
                </div>
                <p className="text-xs text-gray-500">{issue.explanation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Vocab Suggestions */}
      {feedback.vocabularySuggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <h3 className="font-semibold text-blue-700 flex items-center gap-2">
              ★ Vocabulary suggestions
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedback.vocabularySuggestions.map((v, i) => (
              <div key={i} className="border-l-2 border-blue-200 pl-4">
                <p className="text-xs text-gray-500 mb-1">In: {v.context}</p>
                <p className="text-sm font-medium text-gray-900">
                  Try: <span className="text-blue-700">{v.suggestion}</span>{" "}
                  <span className="text-red-400 text-xs">{v.pinyin}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{v.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Rewritten Sample */}
      {feedback.rewrittenSample && (
        <Card className="border-green-100 bg-green-50/30">
          <CardHeader className="pb-3">
            <h3 className="font-semibold text-green-800">✏ Model rewrite</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900 leading-relaxed">{feedback.rewrittenSample}</p>
          </CardContent>
        </Card>
      )}

      {/* Next Step Tip */}
      <Card className="border-purple-100 bg-purple-50/20">
        <CardContent className="p-5">
          <p className="text-xs font-medium text-purple-600 mb-1">Your next step</p>
          <p className="text-sm text-gray-700">{feedback.nextStepTip}</p>
        </CardContent>
      </Card>
    </div>
  )
}
