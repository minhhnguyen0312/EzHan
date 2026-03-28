import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"

interface TopicCardProps {
  topic: {
    id: string
    date: string
    titleZh: string
    titleEn: string
    promptZh: string
    promptEn: string
    suggestedLength: string
  }
  compact?: boolean
}

export function TopicCard({ topic, compact = false }: TopicCardProps) {
  return (
    <Card className="border-red-100 bg-red-50/30">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">{formatDate(topic.date)}</p>
            <h2 className="text-xl font-bold text-gray-900">{topic.titleEn}</h2>
            <p className="text-lg text-red-700 font-medium mt-0.5">{topic.titleZh}</p>
          </div>
          <Badge variant="info" className="shrink-0">
            {topic.suggestedLength}
          </Badge>
        </div>
        {!compact && (
          <>
            <p className="text-lg text-gray-900 leading-relaxed mb-2">{topic.promptZh}</p>
            <p className="text-sm text-gray-500 italic">{topic.promptEn}</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
