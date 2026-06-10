import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Incident } from '@/lib/models'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { partial_values } = await req.json()

  if (!Array.isArray(partial_values)) {
    return NextResponse.json({ error: 'partial_values must be an array.' }, { status: 400 })
  }

  await connectDB()

  const incident = await Incident.findOne({ incident_id: id, user_id: session.userId })
  if (!incident) {
    return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
  }

  // Find the last non-completed structured_form assistant message
  let updated = false
  for (let i = incident.history.length - 1; i >= 0; i--) {
    const entry = incident.history[i]
    if (
      entry.role === 'assistant' &&
      entry.controls &&
      entry.controls.type === 'structured_form' &&
      !entry.controls.completed
    ) {
      entry.controls.partial_values = partial_values
      updated = true
      break
    }
  }

  if (!updated) {
    return NextResponse.json({ ok: false, message: 'No active structured form found' })
  }

  incident.markModified('history')
  await incident.save()

  return NextResponse.json({ ok: true })
}
