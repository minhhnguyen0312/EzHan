import { getHskMeta } from "@/lib/utils/hsk"
import { cn } from "@/lib/utils/cn"

interface LevelBadgeProps {
  level: string
  showDescription?: boolean
}

export function LevelBadge({ level, showDescription = false }: LevelBadgeProps) {
  const meta = getHskMeta(level)

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", meta.color)}>
        {meta.label}
      </span>
      {showDescription && (
        <p className="text-xs text-gray-500 max-w-xs">{meta.description}</p>
      )}
    </div>
  )
}
