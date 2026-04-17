import { getGuestUser } from "@/lib/guest"
import { getTodayTopic, getTodayBonusTopic } from "@/services/topics.service"
import { TopicCard } from "@/components/writing/topic-card"
import { WritingForm } from "@/components/writing/writing-form"
import { NewTopicButton } from "@/components/writing/new-topic-button"
import { db } from "@/lib/db"
import type { HskLevel } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FeedbackPanel } from "@/components/writing/feedback-panel"
import type { WritingFeedback } from "@/types/writing"

export default async function WritingPage() {
  const user = await getGuestUser()
  const hskLevel = (user.hskLevel ?? "HSK1") as HskLevel
  const userId = user.id

  const topic = await getTodayTopic(hskLevel).catch(() => null)

  // Submission for the main topic
  const existingSubmission =
    topic && userId
      ? await db.writingSubmission
          .findUnique({ where: { userId_topicId: { userId, topicId: topic.id } } })
          .catch(() => null)
      : null

  // Bonus topic — only needed if main is already submitted
  const bonusTopic =
    existingSubmission && hskLevel
      ? await getTodayBonusTopic(hskLevel).catch(() => null)
      : null

  const bonusSubmission =
    bonusTopic && userId
      ? await db.writingSubmission
          .findUnique({ where: { userId_topicId: { userId, topicId: bonusTopic.id } } })
          .catch(() => null)
      : null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Daily Writing</h1>
        <div className="flex items-center gap-2">
          <NewTopicButton />
          <Link href="/writing/history">
            <Button variant="ghost" size="sm">View history →</Button>
          </Link>
        </div>
      </div>

      {topic ? (
        <>
          {/* ── Main topic ─────────────────────────────────────────────── */}
          <TopicCard topic={topic} />

          {existingSubmission ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <p className="text-green-800 font-medium">
                ✓ You&apos;ve already submitted your writing for today!
              </p>
              {existingSubmission.feedbackStatus === "COMPLETED" && existingSubmission.feedback && (
                <div className="mt-6 text-left">
                  <FeedbackPanel feedback={existingSubmission.feedback as unknown as WritingFeedback} />
                </div>
              )}
            </div>
          ) : (
            <WritingForm
              topicId={topic.id}
              suggestedLength={topic.suggestedLength}
              hint={{
                titleZh: topic.titleZh,
                titleEn: topic.titleEn,
                promptZh: topic.promptZh,
                promptEn: topic.promptEn,
              }}
            />
          )}

          {/* ── Bonus topic (generated when user clicks "New topic" after submitting) ── */}
          {bonusTopic && (
            <div className="space-y-4 pt-2 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">
                ✦ Extra topic
              </p>
              <TopicCard topic={bonusTopic} />
              {bonusSubmission ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <p className="text-green-800 font-medium">
                    ✓ You&apos;ve also submitted this extra topic today!
                  </p>
                  {bonusSubmission.feedbackStatus === "COMPLETED" && bonusSubmission.feedback && (
                    <div className="mt-6 text-left">
                      <FeedbackPanel feedback={bonusSubmission.feedback as unknown as WritingFeedback} />
                    </div>
                  )}
                </div>
              ) : (
                <WritingForm
                  topicId={bonusTopic.id}
                  suggestedLength={bonusTopic.suggestedLength}
                  hint={{
                    titleZh: bonusTopic.titleZh,
                    titleEn: bonusTopic.titleEn,
                    promptZh: bonusTopic.promptZh,
                    promptEn: bonusTopic.promptEn,
                  }}
                />
              )}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-10 text-center">
          <p className="text-gray-500">Unable to load today&apos;s topic. Please try refreshing.</p>
        </div>
      )}
    </div>
  )
}
