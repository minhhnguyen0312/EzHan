"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { VocabularyWordData } from "@/types/vocabulary"

interface VocabCardProps {
  word: VocabularyWordData
}

const complexityColors = {
  simple: "text-green-600",
  medium: "text-blue-600",
  complex: "text-purple-600",
}

const complexityDots = {
  simple: "●○○",
  medium: "●●○",
  complex: "●●●",
}

export function VocabCard({ word }: VocabCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-3xl font-bold text-gray-900 leading-none mb-1">
              {word.hanzi}
            </p>
            <p className="text-sm text-red-500 font-medium">{word.pinyin}</p>
          </div>
          <Badge variant="default" className="mt-1 shrink-0">
            {word.partOfSpeech}
          </Badge>
        </div>

        <p className="text-gray-700 text-sm mb-4">{word.definition}</p>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
        >
          {expanded ? "▲ Hide examples" : "▼ Show examples"}
        </button>

        {expanded && (
          <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
            {word.sentences.map((sentence, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono ${complexityColors[sentence.complexity]}`}>
                    {complexityDots[sentence.complexity]}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900">{sentence.zh}</p>
                {sentence.pinyin && (
                  <p className="text-xs text-red-400 font-medium">{sentence.pinyin}</p>
                )}
                <p className="text-xs text-gray-500">{sentence.en}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
