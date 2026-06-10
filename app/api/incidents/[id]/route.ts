import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Incident } from '@/lib/models'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await connectDB()

  const incident = await Incident.findOne({ incident_id: id, user_id: session.userId }).lean()
  if (!incident) {
    return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
  }

  return NextResponse.json({ incident })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const updates = await req.json()
  await connectDB()

  const incident = await Incident.findOneAndUpdate(
    { incident_id: id, user_id: session.userId },
    { ...updates, 'timestamps.updated': new Date() },
    { new: true }
  ).lean()

  if (!incident) {
    return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
  }

  return NextResponse.json({ incident })
}
