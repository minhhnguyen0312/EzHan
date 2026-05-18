import "server-only"
import { AUDIO_SPEEDS, AUDIO_VOICES } from "@/types/audio"

const GEMINI_TTS_MODEL = "gemini-3.1-flash-tts-preview"
const SAMPLE_RATE = 24000
const CHANNELS = 1
const BITS_PER_SAMPLE = 16

type GeminiTtsResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: {
          data?: string
          mimeType?: string
        }
      }>
    }
  }>
  error?: {
    message?: string
  }
}

function getGeminiApiKey(apiKey?: string): string {
  const key = apiKey ?? process.env.GEMINI_API_KEY
  if (!key) {
    throw new Error("No Gemini API key available. Add one in Settings or set GEMINI_API_KEY.")
  }
  return key
}

function writeString(view: DataView, offset: number, value: string) {
  for (let i = 0; i < value.length; i += 1) {
    view.setUint8(offset + i, value.charCodeAt(i))
  }
}

export function pcmToWav(pcm: Buffer, sampleRate = SAMPLE_RATE): Buffer {
  const headerSize = 44
  const wav = Buffer.alloc(headerSize + pcm.length)
  const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength)
  const byteRate = sampleRate * CHANNELS * (BITS_PER_SAMPLE / 8)
  const blockAlign = CHANNELS * (BITS_PER_SAMPLE / 8)

  writeString(view, 0, "RIFF")
  view.setUint32(4, 36 + pcm.length, true)
  writeString(view, 8, "WAVE")
  writeString(view, 12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, CHANNELS, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, BITS_PER_SAMPLE, true)
  writeString(view, 36, "data")
  view.setUint32(40, pcm.length, true)
  pcm.copy(wav, headerSize)

  return wav
}

export function estimateDurationSeconds(wavByteLength: number): number {
  const pcmBytes = Math.max(0, wavByteLength - 44)
  const bytesPerSecond = SAMPLE_RATE * CHANNELS * (BITS_PER_SAMPLE / 8)
  return Math.max(1, Math.round(pcmBytes / bytesPerSecond))
}

export function getAudioVoice(voiceName: string) {
  return AUDIO_VOICES.find((voice) => voice.voiceName === voiceName)
}

export function getAudioSpeed(speed: string) {
  return AUDIO_SPEEDS.find((item) => item.value === speed)
}

export async function generateGeminiSpeech(params: {
  text: string
  voiceName: string
  speed: string
  apiKey?: string
}) {
  const key = getGeminiApiKey(params.apiKey)
  const speed = getAudioSpeed(params.speed)
  if (!speed) throw new Error("Unsupported audio speed.")

  const prompt = `${speed.tag} Read this Mandarin Chinese text clearly for a learner. Preserve the text exactly: ${params.text}`
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: params.voiceName },
            },
          },
        },
        model: GEMINI_TTS_MODEL,
      }),
    },
  )

  const payload = (await response.json().catch(() => null)) as GeminiTtsResponse | null
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "Gemini could not generate audio. Please try again.")
  }

  const inlineData = payload?.candidates?.[0]?.content?.parts?.[0]?.inlineData
  if (!inlineData?.data) {
    throw new Error("Gemini returned an empty audio response.")
  }

  const pcm = Buffer.from(inlineData.data, "base64")
  const audioData = pcmToWav(pcm, SAMPLE_RATE)

  return {
    audioData,
    mimeType: "audio/wav",
    sampleRate: SAMPLE_RATE,
    durationSeconds: estimateDurationSeconds(audioData.length),
  }
}
