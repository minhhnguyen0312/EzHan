interface StatsGridProps {
  totalSubmissions: number
  totalWordsStudied: number
  currentStreak: number
  longestStreak: number
}

export function StatsGrid({ totalSubmissions, totalWordsStudied, currentStreak, longestStreak }: StatsGridProps) {
  const stats = [
    { label: "Day streak", value: currentStreak, icon: "🔥" },
    { label: "Best streak", value: longestStreak, icon: "⭐" },
    { label: "Total writings", value: totalSubmissions, icon: "✍" },
    { label: "Words studied", value: totalWordsStudied, icon: "本" },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-gray-200 p-5 text-center"
        >
          <div className="text-2xl mb-1">{stat.icon}</div>
          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
