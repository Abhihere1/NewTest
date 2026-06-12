import { NextResponse } from 'next/server'
import { vdiKBStatus, scannerKBStatus } from '@/lib/kb'

export async function GET() {
  return NextResponse.json({ vdi: vdiKBStatus(), scanner: scannerKBStatus() })
}
