function getConfig(): { baseUrl: string; model: string; apiKey: string } {
  const baseUrl = process.env.OLLAMA_BASE_URL
  const model = process.env.OLLAMA_MODEL
  const apiKey = process.env.OLLAMA_API_KEY

  if (!baseUrl || baseUrl.trim() === '') {
    throw new Error(
      'Configuration Error: OLLAMA_BASE_URL is missing or empty. Must be set to https://ollama.com.'
    )
  }
  if (!model || model.trim() === '') {
    throw new Error(
      'Configuration Error: OLLAMA_MODEL is missing or empty. Must be set to gemma4:31b-cloud.'
    )
  }
  if (!apiKey || apiKey.trim() === '') {
    throw new Error(
      'Configuration Error: OLLAMA_API_KEY is missing or empty. Please provide a valid API key in your environment variables.'
    )
  }

  return { baseUrl: baseUrl.trim(), model: model.trim(), apiKey: apiKey.trim() }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function callLLM(messages: ChatMessage[]): Promise<string> {
  const { baseUrl, model, apiKey } = getConfig()

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',

    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: { temperature: 0.3, top_p: 0.9 },
    }),
  })

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'unknown error')
    const msg = `Ollama API HTTP ${res.status} (${res.statusText}): ${errorText}`
    console.error(`[LLM] ${msg}`)
    throw new Error(msg)
  }

  const data = await res.json() as { message?: { content?: string }; error?: string }
  if (data.error) {
    console.error(`[LLM] Ollama response error: ${data.error}`)
    throw new Error(`Ollama error: ${data.error}`)
  }

  return data.message?.content || ''
}
