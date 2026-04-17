import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const features = [
    {
      icon: "✍",
      title: "Daily Writing Practice",
      description:
        "Get a new writing topic every day tailored to your HSK level. Submit your Chinese writing and receive detailed AI feedback on grammar, vocabulary, and style.",
    },
    {
      icon: "本",
      title: "Daily Vocabulary",
      description:
        "Learn 10 new Chinese words every day with pinyin, definitions, and 3 example sentences — progressing from simple to complex grammar structures.",
    },
    {
      icon: "🔥",
      title: "Streak Tracking",
      description:
        "Build a daily learning habit. Track your writing streak, total submissions, and vocabulary studied over time.",
    },
    {
      icon: "🎯",
      title: "All HSK Levels",
      description:
        "Content is generated specifically for your level — from HSK1 basics to HSK6 mastery — and adapts as you progress.",
    },
  ]

  const hskLevels = [
    { label: "HSK 1", color: "bg-green-100 text-green-800" },
    { label: "HSK 2", color: "bg-teal-100 text-teal-800" },
    { label: "HSK 3", color: "bg-blue-100 text-blue-800" },
    { label: "HSK 4", color: "bg-indigo-100 text-indigo-800" },
    { label: "HSK 5", color: "bg-purple-100 text-purple-800" },
    { label: "HSK 6", color: "bg-rose-100 text-rose-800" },
  ]

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-red-600">易汉</h1>
          <p className="text-xs text-gray-500">EzHan</p>
        </div>
        <Link href="/dashboard">
          <Button variant="primary" size="sm">Start Learning</Button>
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {hskLevels.map((l) => (
            <span key={l.label} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${l.color}`}>
              {l.label}
            </span>
          ))}
        </div>
        <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Learn Chinese with{" "}
          <span className="text-red-600">daily AI practice</span>
        </h2>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Write in Chinese every day. Get instant feedback from Claude AI. Build your vocabulary
          with graduated examples. Track your streak and progress.
        </p>
        <Link href="/dashboard">
          <Button size="lg" className="text-base px-8">Start for free →</Button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-24 text-left">
          {features.map((feature) => (
            <div key={feature.title} className="p-6 rounded-xl border border-gray-100 bg-gray-50">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
