import fs from 'fs'
import path from 'path'

const KB_DIR = path.join(process.cwd(), 'knowledge_base', 'workflows')

export function kbFileExists(category: string): boolean {
  try {
    const filePath = path.join(KB_DIR, `${category.toLowerCase()}.md`)
    return fs.existsSync(filePath)
  } catch {
    return false
  }
}

export function loadKBFile(category: string): string | null {
  try {
    const filePath = path.join(KB_DIR, `${category.toLowerCase()}.md`)
    if (!fs.existsSync(filePath)) return null
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return null
  }
}

export function loadAllKBFiles(): { category: string; filename: string; content: string }[] {
  try {
    if (!fs.existsSync(KB_DIR)) return []
    const files = fs.readdirSync(KB_DIR).filter(f => f.endsWith('.md'))
    return files.map(filename => {
      const category = filename.replace('.md', '').toUpperCase()
      const content = fs.readFileSync(path.join(KB_DIR, filename), 'utf-8')
      return { category, filename, content }
    })
  } catch {
    return []
  }
}

export function buildKBContext(category: string | null): string {
  if (category) {
    const content = loadKBFile(category)
    if (content) return content
  }

  const allFiles = loadAllKBFiles()
  if (allFiles.length === 0) return ''

  return allFiles
    .map(({ category: cat, filename, content }) =>
      `[CATEGORY: ${cat} | FILE: ${filename}]\n${content}`)
    .join('\n\n---\n\n')
}

export function vdiKBStatus(): 'available' | 'missing' {
  return kbFileExists('vdi') ? 'available' : 'missing'
}

export function scannerKBStatus(): 'available' | 'missing' {
  return kbFileExists('scanner') ? 'available' : 'missing'
}
