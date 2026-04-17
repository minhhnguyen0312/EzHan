import { GoogleGenerativeAI, Part } from "@google/generative-ai"
import type { LlamaMessage } from "./llama"

export const GEMINI_MODEL = "gemini-2.5-flash-lite"

function getClient(apiKey?: string): GoogleGenerativeAI {
  const key = apiKey ?? process.env.GEMINI_API_KEY
  if (!key) {
    throw new Error(
      "No Gemini API key available. Set GEMINI_API_KEY or pass a user-supplied key.",
    )
  }
  return new GoogleGenerativeAI(key)
}

export async function geminiChat(params: {
  messages: LlamaMessage[]
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
  /** Optional user-supplied Gemini API key. Falls back to process.env.GEMINI_API_KEY. */
  apiKey?: string
}): Promise<string> {
  const client = getClient(params.apiKey)
  const model = client.getGenerativeModel({
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
