import { VocabCard } from "./vocab-card"
import type { DailyVocabSetData } from "@/types/vocabulary"
import { formatDate } from "@/lib/utils/date"

interface VocabSetProps {
  data: DailyVocabSetData
}

export function VocabSet({ data }: VocabSetProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {data.words.length} words for today
        </h2>
        <p className="text-sm text-gray-500">{formatDate(data.date)}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.words.map((word) => (
          <VocabCard key={word.id} word={word} />
        ))}
      </div>
    </div>
  )
}
