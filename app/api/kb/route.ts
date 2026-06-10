import { NextResponse } from 'next/server'
import { vdiKBStatus } from '@/lib/kb'

export async function GET() {
  return NextResponse.json({ vdi: vdiKBStatus() })
}
