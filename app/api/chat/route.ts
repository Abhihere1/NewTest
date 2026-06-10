import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Incident } from '@/lib/models'
import { getSession } from '@/lib/session'
import { buildKBContext } from '@/lib/kb'
import { buildSystemPrompt } from '@/lib/systemPrompt'
import { callLLM } from '@/lib/llm'
import { parseLLMResponse } from '@/lib/parseJson'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { message, incidentId, category } = await req.json()

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
  }

  await connectDB()

  let incident = incidentId
    ? await Incident.findOne({ incident_id: incidentId, user_id: session.userId })
    : null

  if (!incident) {
    // Create new incident
    let newId = `INC-${Math.floor(100000 + Math.random() * 900000)}`
    while (await Incident.findOne({ incident_id: newId })) {
      newId = `INC-${Math.floor(100000 + Math.random() * 900000)}`
    }
    incident = await Incident.create({
      incident_id: newId,
      user_id: session.userId,
      status: 'Open',
      category: category || '',
      history: [],
      escalation_details: {},
      resolution_details: {},
      feedback: { submitted: false },
      lastupdatedby: 'Patch',
      timestamps: { created: new Date(), updated: new Date() },
    })
  }

  if (incident.status !== 'Open') {
    return NextResponse.json({ error: 'This conversation has ended.' }, { status: 400 })
  }

  // Mark the last assistant message's controls as completed when user responds
  if (incident.history.length > 0) {
    const last = incident.history[incident.history.length - 1]
    if (last.role === 'assistant' && last.controls && !last.controls.completed) {
      last.controls.completed = true
    }
  }

  // Add user message to history
  const userEntry = { role: 'user' as const, content: message }
  incident.history.push(userEntry)

  // Build KB context
  const effectiveCategory = category || incident.category || null
  const kbContext = buildKBContext(effectiveCategory)

  // Build messages for LLM
  const systemPrompt = buildSystemPrompt(kbContext)
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...incident.history.map((h: { role: 'user' | 'assistant'; content: string; controls?: unknown }) => ({
      role: h.role,
      content: h.content,
    })),
  ]

  let llmResult
  try {
    const rawOutput = await callLLM(messages)
    llmResult = parseLLMResponse(rawOutput)
  } catch (err) {
    console.error('[Chat LLM Error]', err)
    llmResult = {
      response: "I'm sorry, I encountered a connection issue. Please try again.",
      user_probable_options: [],
      input_card_variables: [],
      needs_count_first: false,
      count_prompt: '',
      total_cards: 0,
      should_escalate: false,
      escalation_data: { reason: '', priority: '3 - Moderate', urgency: '3 - Moderate', impact: '2 - Small Group', support_group: 'Trusted Experts' },
      should_resolve: false,
    }
  }

  // Determine controls metadata
  let controls = undefined
  const optCount = llmResult.user_probable_options?.length || 0
  if (llmResult.input_card_variables?.length > 0) {
    controls = {
      type: 'structured_form' as const,
      options: [],
      completed: false,
      input_card_variables: llmResult.input_card_variables,
      total_cards: llmResult.total_cards || 1,
    }
  } else if (optCount >= 5) {
    controls = {
      type: 'single_select' as const,
      options: llmResult.user_probable_options,
      completed: false,
    }
  } else if (optCount >= 2) {
    controls = {
      type: 'probable_options' as const,
      options: llmResult.user_probable_options,
      completed: false,
    }
  }

  // Add assistant message to history
  const assistantEntry = {
    role: 'assistant' as const,
    content: llmResult.response,
    controls: controls || undefined,
  }
  incident.history.push(assistantEntry)

  // Update status and details
  let statusUpdate: Record<string, unknown> = {}

  if (llmResult.should_escalate) {
    incident.status = 'Escalated'
    incident.escalation_details = llmResult.escalation_data
    incident.lastupdatedby = 'Escalation Team'
    statusUpdate = {
      status: 'Escalated',
      escalation_details: llmResult.escalation_data,
      lastupdatedby: 'Escalation Team',
    }
  } else if (llmResult.should_resolve) {
    incident.status = 'Resolved'
    incident.lastupdatedby = 'Patch'
    statusUpdate = {
      status: 'Resolved',
      lastupdatedby: 'Patch',
    }
  }

  if (effectiveCategory && !incident.category) {
    incident.category = effectiveCategory
  }

  incident.timestamps.updated = new Date()

  await Incident.findOneAndUpdate(
    { incident_id: incident.incident_id },
    {
      history: incident.history,
      category: incident.category,
      'timestamps.updated': new Date(),
      ...statusUpdate,
    }
  )

  return NextResponse.json({
    incidentId: incident.incident_id,
    response: llmResult.response,
    user_probable_options: llmResult.user_probable_options,
    input_card_variables: llmResult.input_card_variables,
    needs_count_first: llmResult.needs_count_first,
    count_prompt: llmResult.count_prompt,
    total_cards: llmResult.total_cards,
    should_escalate: llmResult.should_escalate,
    escalation_data: llmResult.escalation_data,
    should_resolve: llmResult.should_resolve,
    status: incident.status,
    controls,
  })
}
