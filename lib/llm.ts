const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma4:31b-cloud'

function getOllamaApiKey(): string {
  const key = process.env.OLLAMA_API_KEY
  if (!key || key.trim() === '') {
    throw new Error(
      'Configuration Error: OLLAMA_API_KEY is missing or empty. Please provide a valid API key in your environment variables.'
    )
  }
  return key
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function callLLM(messages: ChatMessage[]): Promise<string> {
  const apiKey = getOllamaApiKey()

  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: false,
      options: { temperature: 0.3, top_p: 0.9 },
    }),
  })

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'unknown error')
    throw new Error(`Ollama API error ${res.status}: ${errorText}`)
  }

  const data = await res.json() as { message?: { content?: string }; error?: string }
  if (data.error) throw new Error(`Ollama error: ${data.error}`)

  return data.message?.content || ''
}
