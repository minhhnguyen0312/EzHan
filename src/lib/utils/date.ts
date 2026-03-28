/**
 * Returns today's date as "YYYY-MM-DD" in UTC.
 * Using UTC ensures cron jobs and API routes agree on "today".
 */
export function todayKey(): string {
  return new Date().toISOString().split("T")[0]
}

/**
 * Returns tomorrow's date as "YYYY-MM-DD" in UTC.
 */
export function tomorrowKey(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().split("T")[0]
}

/**
 * Formats a date string "YYYY-MM-DD" (or "YYYY-MM-DD-bonus" etc.) to a human-readable form.
 * Bonus-topic dates carry a suffix after the base date; we strip it before parsing.
 */
export function formatDate(dateStr: string): string {
  const base = dateStr.slice(0, 10) // always "YYYY-MM-DD"
  const date = new Date(base + "T00:00:00Z")
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}

/**
 * Calculates streak from a sorted array of activity dates "YYYY-MM-DD" (desc).
 */
export function calculateStreak(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 }

  const sorted = [...dates].sort().reverse()
  const today = todayKey()

  let current = 0
  let longest = 0
  let streak = 0
  let prev: string | null = null

  for (const date of sorted) {
    if (prev === null) {
      // First date must be today or yesterday to count as current
      if (date === today || date === yesterdayKey()) {
        streak = 1
      } else {
        streak = 0
      }
    } else {
      const prevDate = new Date(prev + "T00:00:00Z")
      const currDate = new Date(date + "T00:00:00Z")
      const diffDays = Math.round(
        (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (diffDays === 1) {
        streak += 1
      } else {
        if (streak > longest) longest = streak
        streak = 1
      }
    }
    prev = date
    if (streak > longest) longest = streak
  }

  // current streak is streak from today backwards
  const firstDate = sorted[0]
  if (firstDate !== today && firstDate !== yesterdayKey()) {
    current = 0
  } else {
    current = streak
  }

  return { current, longest }
}

function yesterdayKey(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().split("T")[0]
}
