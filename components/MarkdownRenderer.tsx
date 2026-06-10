'use client'

import { marked } from 'marked'
import { useMemo } from 'react'

marked.setOptions({ breaks: true })

interface Props {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: Props) {
  const html = useMemo(() => {
    // Replace markdown image tags: ![alt](filename) -> use our image API
    const processed = content.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (_, alt, src) => {
        // If it's already an absolute URL, leave it
        if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
          return `![${alt}](${src})`
        }
        // Map to our image API
        const filename = src.split('/').pop() || src
        return `![${alt}](/api/images/${filename})`
      }
    )

    const result = marked.parse(processed)
    return typeof result === 'string' ? result : ''
  }, [content])

  return (
    <div
      className={`markdown-content ${className}`}
      // Content comes from our controlled LLM — no user-generated HTML
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
