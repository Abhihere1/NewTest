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
  const { rating, comment } = await req.json()

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 })
  }

  await connectDB()

  const incident = await Incident.findOneAndUpdate(
    { incident_id: id, user_id: session.userId },
    {
      feedback: { rating, comment: comment || '', submitted: true },
      'timestamps.updated': new Date(),
    },
    { new: true }
  ).lean()

  if (!incident) {
    return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
