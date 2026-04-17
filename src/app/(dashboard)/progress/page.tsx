import { requireUserForPage } from "@/lib/session"
import { getUserProgress } from "@/services/progress.service"
import { StatsGrid } from "@/components/progress/stats-grid"
import { LevelBadge } from "@/components/progress/level-badge"
import { Card, CardContent } from "@/components/ui/card"

export default async function ProgressPage() {
  const user = await requireUserForPage()
  const progress = await getUserProgress(user.id)

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>

      {/* Current Level */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">Current Level</h2>
          <LevelBadge level={user.hskLevel ?? "HSK1"} showDescription />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-3">Statistics</h2>
        <StatsGrid
          totalSubmissions={progress.totalSubmissions}
          totalWordsStudied={progress.totalWordsStudied}
          currentStreak={progress.currentStreak}
          longestStreak={progress.longestStreak}
        />
      </div>

      {/* Last Activity */}
      {progress.lastActivityDate && (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">
              Last activity:{" "}
              <span className="text-gray-900 font-medium">{progress.lastActivityDate}</span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
