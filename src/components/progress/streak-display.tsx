interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
}

export function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  return (
    <div className="flex gap-6">
      <div className="text-center">
        <div className="text-3xl font-bold text-orange-500">
          {currentStreak > 0 ? "🔥" : "❄"} {currentStreak}
        </div>
        <p className="text-xs text-gray-500 mt-1">Day streak</p>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-700">{longestStreak}</div>
        <p className="text-xs text-gray-500 mt-1">Best streak</p>
      </div>
    </div>
  )
}
