'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import StatusBadge from '@/components/StatusBadge'

type Status = 'Open' | 'Escalated' | 'Resolved'
type Filter = 'All' | Status

interface Incident {
  incident_id: string
  category: string
  status: Status
  timestamps: { created: string; updated: string }
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString()
}

export default function IncidentsPage() {
  const router = useRouter()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [filter, setFilter] = useState<Filter>('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/incidents')
      .then(r => r.json())
      .then(d => setIncidents(d.incidents || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'All' ? incidents : incidents.filter(i => i.status === filter)
  const filters: Filter[] = ['All', 'Open', 'Escalated', 'Resolved']

  return (
    <div className="flex flex-col h-full" data-testid="incidents-page">
      <TopNav incidentCount={incidents.length} />

      <main className="flex-1 overflow-auto py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 data-testid="incidents-heading" className="text-2xl font-bold text-gray-900 mb-6">My Incidents</h1>

          {/* Filter tabs */}
          <div data-testid="filter-tabs" className="flex gap-1 mb-6 border-b border-gray-200">
            {filters.map(f => (
              <button
                key={f}
                data-testid={`filter-${f.toLowerCase()}`}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  filter === f
                    ? 'text-red-600 border-red-600'
                    : 'text-gray-500 border-transparent hover:text-gray-800'
                }`}
              >
                {f}
                <span className="ml-1.5 text-xs text-gray-400">
                  ({f === 'All' ? incidents.length : incidents.filter(i => i.status === f).length})
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-16">
              <p className="text-sm text-gray-400">Loading incidents...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div data-testid="empty-state" className="text-center py-16">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 font-medium">No incidents yet.</p>
              <p className="text-xs text-gray-400 mt-1">Start a new chat to create your first incident.</p>
            </div>
          ) : (
            <div data-testid="incidents-list" className="space-y-3">
              {filtered.map(inc => (
                <div
                  key={inc.incident_id}
                  data-testid={`incident-row-${inc.incident_id}`}
                  className="card rounded-xl px-5 py-4 flex items-center gap-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-mono font-semibold text-gray-800">{inc.incident_id}</span>
                      <StatusBadge status={inc.status} />
                    </div>
                    <p className="text-xs text-gray-500">
                      {inc.category ? inc.category.toUpperCase() : 'General'} &middot; {timeAgo(inc.timestamps.created)} &middot; {new Date(inc.timestamps.created).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    data-testid={`view-btn-${inc.incident_id}`}
                    onClick={() => router.push(`/incidents/${inc.incident_id}`)}
                    className="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-lg transition-colors flex-shrink-0"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
