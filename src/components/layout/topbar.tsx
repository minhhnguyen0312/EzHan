import Link from "next/link"
import { getHskMeta } from "@/lib/utils/hsk"

interface TopbarProps {
  hskLevel: string
  currentStreak?: number
  userName?: string | null
}

export function Topbar({ hskLevel, currentStreak = 0, userName }: TopbarProps) {
  const hskMeta = getHskMeta(hskLevel)

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between md:hidden">
      <h1 className="text-lg font-bold text-red-600">易汉</h1>
      <div className="flex items-center gap-3">
        {currentStreak > 0 && (
          <span className="text-sm font-medium text-orange-600">
            🔥 {currentStreak}
          </span>
        )}
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${hskMeta.color}`}>
          {hskMeta.label}
        </span>
        <Link href="/settings" className="text-sm text-gray-600">
          {userName?.[0]?.toUpperCase() ?? "U"}
        </Link>
      </div>
    </header>
  )
}
