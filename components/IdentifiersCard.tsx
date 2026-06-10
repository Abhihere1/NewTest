'use client'

import { useState } from 'react'

interface Props {
  incidentId: string
  sessionId?: string
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div>
      <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-mono text-gray-800 flex-1">{value}</p>
        <button
          data-testid={`copy-${label.toLowerCase().replace(' ', '-')}`}
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-red-600 transition-colors px-2 py-1 rounded border border-gray-200 hover:border-red-300"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

export default function IdentifiersCard({ incidentId, sessionId }: Props) {
  return (
    <div data-testid="identifiers-card" className="card rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800">Identifiers</p>
      </div>
      <div className="px-5 py-4 space-y-3">
        <CopyField label="Incident ID" value={incidentId} />
        {sessionId && <CopyField label="Session ID" value={sessionId} />}
      </div>
    </div>
  )
}
