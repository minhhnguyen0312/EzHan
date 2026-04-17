import { getGuestUser } from "@/lib/guest"
import { getUserSubmissions } from "@/services/writing.service"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FeedbackPanel } from "@/components/writing/feedback-panel"
import { formatDate } from "@/lib/utils/date"
import type { WritingFeedback } from "@/types/writing"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function WritingHistoryPage() {
  const user = await getGuestUser()
  const submissions = await getUserSubmissions(user.id)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Writing History</h1>
        <Link href="/writing">
          <Button variant="ghost" size="sm">← Today&apos;s topic</Button>
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-10 text-center">
          <p className="text-gray-500">No writing submissions yet.</p>
          <p className="text-sm text-gray-400 mt-1">Start with today&apos;s topic!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {submissions.map((sub) => (
            <Card key={sub.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">{formatDate(sub.topic.date)}</p>
                    <h3 className="font-semibold text-gray-900 mt-0.5">{sub.topic.titleEn}</h3>
                    <p className="text-sm text-red-700">{sub.topic.titleZh}</p>
                  </div>
                  <Badge
                    variant={
                      sub.feedbackStatus === "COMPLETED"
                        ? "success"
                        : sub.feedbackStatus === "FAILED"
                        ? "error"
                        : "warning"
                    }
                  >
                    {sub.feedbackStatus}
                  </Badge>
                </div>

                {sub.submissionType === "TEXT" && sub.contentText && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700 leading-relaxed font-chinese">
                      {sub.contentText}
                    </p>
                  </div>
                )}

                {sub.submissionType === "IMAGE" && sub.imageUrl && (
                  <img
                    src={sub.imageUrl}
                    alt="Writing"
                    className="max-h-48 rounded-lg mb-4 object-contain"
                  />
                )}

                {sub.feedbackStatus === "COMPLETED" && sub.feedback && (
                  <FeedbackPanel feedback={sub.feedback as unknown as WritingFeedback} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
