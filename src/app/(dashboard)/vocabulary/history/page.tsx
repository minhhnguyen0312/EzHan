import { getGuestUser } from "@/lib/guest"
import { getVocabHistory } from "@/services/vocabulary.service"
import { VocabSet } from "@/components/vocabulary/vocab-set"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { HskLevel } from "@prisma/client"
import type { DailyVocabSetData } from "@/types/vocabulary"

export default async function VocabHistoryPage() {
  const user = await getGuestUser()
  const hskLevel = (user.hskLevel ?? "HSK1") as HskLevel

  const history = await getVocabHistory(hskLevel)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vocabulary History</h1>
        <Link href="/vocabulary">
          <Button variant="ghost" size="sm">← Today</Button>
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-10 text-center">
          <p className="text-gray-500">No vocabulary history yet.</p>
        </div>
      ) : (
        history.map((set) => (
          <section key={set.id}>
            <VocabSet data={set as unknown as DailyVocabSetData} />
          </section>
        ))
      )}
    </div>
  )
}
