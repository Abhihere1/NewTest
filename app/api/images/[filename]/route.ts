import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params

  // Prevent path traversal
  const safeName = path.basename(filename)
  const imagePath = path.join(process.cwd(), 'knowledge_base', 'images', safeName)

  if (!fs.existsSync(imagePath)) {
    console.error(`[Image] Missing: ${safeName}`)
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  const imageBuffer = fs.readFileSync(imagePath)
  const ext = path.extname(safeName).toLowerCase()
  const mimeMap: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  }
  const contentType = mimeMap[ext] || 'application/octet-stream'

  return new NextResponse(imageBuffer, {
    headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=3600' },
  })
}
