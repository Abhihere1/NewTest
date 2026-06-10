import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Incident } from '@/lib/models'
import { getSession } from '@/lib/session'

function generateIncidentId(): string {
  const num = Math.floor(100000 + Math.random() * 900000)
  return `INC-${num}`
}

export async function GET() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const incidents = await Incident.find({ user_id: session.userId })
    .sort({ 'timestamps.created': -1 })
    .lean()

  return NextResponse.json({ incidents })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { category } = await req.json()

  await connectDB()

  let incidentId = generateIncidentId()
  // Ensure uniqueness
  while (await Incident.findOne({ incident_id: incidentId })) {
    incidentId = generateIncidentId()
  }

  const incident = await Incident.create({
    incident_id: incidentId,
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

  return NextResponse.json({ incident }, { status: 201 })
}
