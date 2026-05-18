import { z } from "zod"
import { AUDIO_SPEEDS, AUDIO_TEXT_LIMIT, AUDIO_VOICES } from "@/types/audio"

const voiceNames = AUDIO_VOICES.map((voice) => voice.voiceName) as [string, ...string[]]
const speedValues = AUDIO_SPEEDS.map((speed) => speed.value) as [string, ...string[]]

export const generateAudioSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Please enter Hanzi text.")
    .max(AUDIO_TEXT_LIMIT, `Text must be ${AUDIO_TEXT_LIMIT} characters or fewer.`),
  voiceName: z.enum(voiceNames),
  speed: z.enum(speedValues),
})
