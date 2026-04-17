import { GoogleGenerativeAI, Part } from "@google/generative-ai"
import type { LlamaMessage } from "./llama"

const globalForGemini = globalThis as unknown as { gemini: GoogleGenerativeAI }

export const gemini =
  globalForGemini.gemini ??
  new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

if (process.env.NODE_ENV !== "production") globalForGemini.gemini = gemini

export const GEMINI_MODEL = "gemini-2.5-flash-lite"

export async function geminiChat(params: {
  messages: LlamaMessage[]
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}): Promise<string> {
  const model = gemini.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      temperature: params.temperature ?? 0.2,
      maxOutputTokens: params.maxTokens ?? 4096,
      responseMimeType: params.jsonMode ? "application/json" : "text/plain",
    },
  })

  // Gemini SDK separates system instruction from chat history
  const systemMessage = params.messages.find((m) => m.role === "system")
  const chatMessages = params.messages.filter((m) => m.role !== "system")

  const history = chatMessages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content } as Part],
  }))

  const lastMessage = chatMessages[chatMessages.length - 1]
  if (!lastMessage) {
    throw new Error("No messages provided to geminiChat")
  }

  const chat = model.startChat({
    history,
    systemInstruction: systemMessage
      ? {
          role: "system",
          parts: [{ text: systemMessage.content }],
        }
      : undefined,
  })

  const result = await chat.sendMessage(lastMessage.content)
  const response = result.response
  const text = response.text()

  if (!text) {
    throw new Error("Gemini returned an empty response")
  }

  return text
}
