import "server-only"
import { geminiChat } from "./gemini"

export type LlamaMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

const DEFAULT_LLAMA_URL = "http://localhost:8080"
const DEFAULT_LLAMA_MODEL = "unsloth/gemma-4-E4B-it-GGUF:Q4_K_S"

function getLlamaBaseUrl() {
  return (process.env.LLAMA_SERVER_URL ?? DEFAULT_LLAMA_URL).replace(/\/$/, "")
}

function getLlamaModel() {
  return process.env.LLAMA_MODEL ?? DEFAULT_LLAMA_MODEL
}

export function isLocalLlmEnabled() {
  // On Vercel / any production deployment, the local llama.cpp server is
  // unreachable — always use Gemini there. Can be forced off anywhere with
  // ENABLE_LOCAL_LLM=false, or forced on with ENABLE_LOCAL_LLM=true.
  const flag = process.env.ENABLE_LOCAL_LLM
  if (flag === "false") return false
  if (flag === "true") return true
  if (process.env.VERCEL || process.env.NODE_ENV === "production") return false
  return true
}

function getAuthHeader(): Record<string, string> {
  const key = process.env.LLAMA_API_KEY
  if (!key) return {}
  return { Authorization: `Bearer ${key}` }
}
export async function llamaChat(params: {
  messages: LlamaMessage[]
  temperature?: number
  maxTokens?: number
  reasoning_effort?: "none" | "low" | "medium" | "high"
  responseFormat?: { type: "json_object" }
  stop?: string[]
}): Promise<string> {
  if (!isLocalLlmEnabled()) {
    return geminiChat({
      messages: params.messages,
      temperature: params.temperature,
      maxTokens: params.maxTokens,
      jsonMode: params.responseFormat?.type === "json_object",
    })
  }

  const { messages, temperature, maxTokens = 4096, reasoning_effort = "none", responseFormat, stop } = params

  const isReasoning = reasoning_effort && reasoning_effort !== "none"

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
  }

  const response = await fetch(`${getLlamaBaseUrl()}/v1/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: getLlamaModel(),
      messages,
      response_format: responseFormat,
      ...(isReasoning
        ? {
            reasoning_effort,
            max_completion_tokens: maxTokens,
          }
        : {
            temperature: temperature ?? 0.2,
            max_tokens: maxTokens,
          }),
      stop,
    }),
  })

  let payload: unknown = null
  try {
    payload = await response.json()
  } catch {
    // ignore JSON parse errors for non-JSON responses
  }

  if (!response.ok) {
    const errorMessage =
      (payload as { error?: { message?: string } })?.error?.message ??
      response.statusText
    throw new Error(`Llama server error (${response.status}): ${errorMessage}`)
  }

  const content = (payload as { choices?: { message?: { content?: string } }[] })?.choices?.[0]
    ?.message?.content
  if (!content) {
    throw new Error("Llama server returned an empty response")
  }

  return content
}

export function parseJsonResponse(text: string): unknown {
  const trimmed = text.trim()

  try {
    return JSON.parse(trimmed)
  } catch {
    // Fall through to cleanup attempts
  }

  let cleaned = trimmed
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim()
  }

  try {
    return JSON.parse(cleaned)
  } catch {
    // Fall through to substring extraction
  }

  const firstBrace = cleaned.indexOf("{")
  const lastBrace = cleaned.lastIndexOf("}")
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in model response")
  }

  const slice = cleaned.slice(firstBrace, lastBrace + 1)
  return JSON.parse(slice)
}
