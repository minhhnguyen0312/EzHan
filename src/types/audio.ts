export const AUDIO_TEXT_LIMIT = 300

export const AUDIO_VOICES = [
  { label: "Nữ", voiceName: "Aoede" },
  { label: "Nam", voiceName: "Charon" },
] as const

export const AUDIO_SPEEDS = [
  { label: "Chậm", value: "slow", tag: "[slowly and clearly]" },
  { label: "Bình thường", value: "normal", tag: "[clearly and naturally]" },
  { label: "Nhanh", value: "fast", tag: "[quickly but clearly]" },
] as const

export type AudioVoiceName = (typeof AUDIO_VOICES)[number]["voiceName"]
export type AudioSpeedValue = (typeof AUDIO_SPEEDS)[number]["value"]

export interface AudioHistoryItem {
  id: string
  text: string
  voiceName: string
  voiceLabel: string
  speed: string
  mimeType: string
  sampleRate: number
  durationSeconds: number | null
  createdAt: string
  audioUrl: string
}
