import { db } from "@/lib/db"
import { reviewWriting } from "@/services/claude/writing-review"
import { llamaChat } from "@/lib/llama"

export async function generateWritingHint(params: {
  topicId: string
  hskLevel: string
}) {
  const { topicId, hskLevel } = params

  const topic = await db.dailyTopic.findUnique({ where: { id: topicId } })
  if (!topic) throw new Error("Topic not found")

  const prompt = `You are a helpful Chinese language teacher. A student is struggling to start their writing for the following topic:
Topic: "${topic.titleEn}" (${topic.titleZh})
Prompt: ${topic.promptZh} (${topic.promptEn})
Student Level: ${hskLevel}

Provide 2-3 short, specific ideas or angles they could write about. 
Keep the language simple and appropriate for ${hskLevel}.
Provide each idea in both Chinese and English.
Keep the response concise and encouraging. 
Do not give them the full text to copy, just ideas.

Format:
1. [Chinese Idea] - [English Translation]
2. [Chinese Idea] - [English Translation]`

  const hint = await llamaChat({
    messages: [
      { role: "system", content: "You are an encouraging Chinese teacher helping a student with writing ideas." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    maxTokens: 500,
  })

  return hint
}

export async function submitWriting(params: {
  userId: string
  topicId: string
  submissionType: "TEXT" | "IMAGE"
  contentText?: string
  imageUrl?: string
  hskLevel: string
}) {
  const { userId, topicId, submissionType, contentText, imageUrl, hskLevel } = params

  // Check for existing submission
  const existing = await db.writingSubmission.findUnique({
    where: { userId_topicId: { userId, topicId } },
  })
  if (existing) return { submission: existing, alreadyExists: true }

  // Get topic for context
  const topic = await db.dailyTopic.findUnique({ where: { id: topicId } })
  if (!topic) throw new Error("Topic not found")

  // Create submission with PENDING status
  const submission = await db.writingSubmission.create({
    data: {
      userId,
      topicId,
      submissionType,
      contentText,
      imageUrl,
      feedbackStatus: "PENDING",
    },
  })

  try {
    const feedback = await reviewWriting({
      topic: {
        titleZh: topic.titleZh,
        titleEn: topic.titleEn,
        promptZh: topic.promptZh,
        promptEn: topic.promptEn,
      },
      userWriting: contentText ?? "",
      hskLevel,
      submissionType,
      imageUrl,
    })

    const updated = await db.writingSubmission.update({
      where: { id: submission.id },
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        feedback: feedback as any,
        feedbackStatus: "COMPLETED",
        reviewedAt: new Date(),
      },
      include: { topic: true },
    })

    // Update progress
    await updateUserProgress(userId)

    return { submission: updated, alreadyExists: false }
  } catch {
    await db.writingSubmission.update({
      where: { id: submission.id },
      data: { feedbackStatus: "FAILED" },
    })
    throw new Error("AI review failed. Please try again.")
  }
}

export async function getUserSubmissions(userId: string) {
  return db.writingSubmission.findMany({
    where: { userId },
    orderBy: { submittedAt: "desc" },
    include: {
      topic: {
        select: { id: true, date: true, titleZh: true, titleEn: true, promptZh: true, promptEn: true },
      },
    },
  })
}

export async function getSubmission(id: string, userId: string) {
  return db.writingSubmission.findFirst({
    where: { id, userId },
    include: {
      topic: {
        select: { id: true, date: true, titleZh: true, titleEn: true, promptZh: true, promptEn: true },
      },
    },
  })
}

async function updateUserProgress(userId: string) {
  const today = new Date().toISOString().split("T")[0]

  const progress = await db.userProgress.findUnique({ where: { userId } })

  if (!progress) {
    await db.userProgress.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        totalSubmissions: 1,
        lastActivityDate: today,
      },
    })
    return
  }

  const lastDate = progress.lastActivityDate
  const yesterday = new Date()
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const yesterdayStr = yesterday.toISOString().split("T")[0]

  let newStreak = progress.currentStreak
  if (lastDate === today) return // already counted
  if (lastDate === yesterdayStr) newStreak += 1
  else newStreak = 1

  const newLongest = Math.max(progress.longestStreak, newStreak)

  await db.userProgress.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongest,
      totalSubmissions: { increment: 1 },
      lastActivityDate: today,
    },
  })
}
