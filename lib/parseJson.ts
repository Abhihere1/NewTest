export interface LLMResponse {
  response: string
  user_probable_options: string[]
  input_card_variables: { label: string; key: string; required: boolean }[]
  needs_count_first: boolean
  count_prompt: string
  total_cards: number
  should_escalate: boolean
  escalation_data: {
    reason: string
    priority: string
    urgency: string
    impact: string
    support_group: string
  }
  should_resolve: boolean
}

const FALLBACK: LLMResponse = {
  response: "I'm sorry, I encountered an issue processing your request. Please try again.",
  user_probable_options: [],
  input_card_variables: [],
  needs_count_first: false,
  count_prompt: '',
  total_cards: 0,
  should_escalate: false,
  escalation_data: { reason: '', priority: '3 - Moderate', urgency: '3 - Moderate', impact: '2 - Small Group', support_group: 'Trusted Experts' },
  should_resolve: false,
}

function stripCodeFences(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim()
}

function extractJsonBlock(text: string): string | null {
  const match = text.match(/\{[\s\S]*\}/)
  return match ? match[0] : null
}

function normalizeBooleans(obj: Record<string, unknown>): Record<string, unknown> {
  const result = { ...obj }
  for (const key of ['should_escalate', 'should_resolve', 'needs_count_first']) {
    if (typeof result[key] === 'string') {
      result[key] = (result[key] as string).toLowerCase() === 'true'
    }
    if (result[key] === undefined || result[key] === null) {
      result[key] = false
    }
  }
  return result
}

function applyDefaults(parsed: Record<string, unknown>): LLMResponse {
  const normalized = normalizeBooleans(parsed)
  return {
    response: typeof normalized.response === 'string' ? normalized.response : FALLBACK.response,
    user_probable_options: Array.isArray(normalized.user_probable_options) ? normalized.user_probable_options as string[] : [],
    input_card_variables: Array.isArray(normalized.input_card_variables) ? normalized.input_card_variables as { label: string; key: string; required: boolean }[] : [],
    needs_count_first: Boolean(normalized.needs_count_first),
    count_prompt: typeof normalized.count_prompt === 'string' ? normalized.count_prompt : '',
    total_cards: typeof normalized.total_cards === 'number' ? normalized.total_cards : 0,
    should_escalate: Boolean(normalized.should_escalate),
    escalation_data: (normalized.escalation_data && typeof normalized.escalation_data === 'object')
      ? { ...FALLBACK.escalation_data, ...(normalized.escalation_data as object) }
      : FALLBACK.escalation_data,
    should_resolve: Boolean(normalized.should_resolve),
  }
}

export function parseLLMResponse(rawOutput: string): LLMResponse {
  const text = stripCodeFences(rawOutput)

  try {
    const parsed = JSON.parse(text)
    return applyDefaults(parsed)
  } catch {
    // First parse failed — try extracting JSON block
  }

  const extracted = extractJsonBlock(text)
  if (extracted) {
    try {
      const parsed = JSON.parse(extracted)
      return applyDefaults(parsed)
    } catch {
      // Extraction also failed
    }
  }

  console.error('[LLM Parse Error] Could not parse LLM output:', rawOutput.slice(0, 500))
  return { ...FALLBACK }
}
