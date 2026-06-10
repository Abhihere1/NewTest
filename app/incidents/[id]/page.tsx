'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import TopNav from '@/components/TopNav'
import StatusBadge from '@/components/StatusBadge'
import ConversationCard from '@/components/ConversationCard'
import ProgressCard from '@/components/ProgressCard'
import OutcomeCard from '@/components/OutcomeCard'
import CaseDetailsCard from '@/components/CaseDetailsCard'
import IdentifiersCard from '@/components/IdentifiersCard'

interface IncidentData {
  incident_id: string
  status: 'Open' | 'Escalated' | 'Resolved'
  category: string
  history: { role: 'user' | 'assistant'; content: string; controls?: import('@/components/DynamicControls').ControlData }[]
  escalation_details: {
    reason?: string
    priority?: string
    urgency?: string
    impact?: string
    support_group?: string
  }
  resolution_details: Record<string, string>
  feedback: { rating?: number; comment?: string; submitted?: boolean }
  lastupdatedby: string
  timestamps: { created: string; updated: string }
}

export default function IncidentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [incident, setIncident] = useState<IncidentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/incidents/${id}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.json()
      })
      .then(d => { if (d?.incident) setIncident(d.incident) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const handleResume = () => {
    sessionStorage.setItem('resume_incident_id', id)
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <TopNav />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (notFound || !incident) {
    return (
      <div className="flex flex-col h-full">
        <TopNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700 mb-2">Incident not found</p>
            <button onClick={() => router.push('/incidents')} className="text-sm text-red-600 hover:text-red-700">
              Back to incidents
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" data-testid="incident-detail-page">
      <TopNav />

      <main className="flex-1 overflow-auto py-6 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div data-testid="incident-detail-header" className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                data-testid="back-btn"
                onClick={() => router.push('/incidents')}
                className="text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Incidents
              </button>
              <span className="text-gray-300">/</span>
              <StatusBadge status={incident.status} />
            </div>

            {incident.status === 'Open' && (
              <button
                data-testid="resume-chat-btn"
                onClick={handleResume}
                className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Resume Chat
              </button>
            )}
          </div>

          <h1
            data-testid="incident-title"
            className="text-2xl font-bold text-gray-900 mb-6"
          >
            {incident.incident_id} &mdash; {incident.category ? incident.category.toUpperCase() : 'Support Incident'}
          </h1>

          {/* Two-column layout */}
          <div className="flex gap-6">
            {/* Left column ~70% */}
            <div className="flex-1 min-w-0 space-y-4">
              <ConversationCard
                history={incident.history}
                readonly={true}
              />

              <ProgressCard status={incident.status} />

              {incident.status !== 'Open' && (
                <OutcomeCard
                  incidentId={incident.incident_id}
                  status={incident.status}
                  escalationDetails={incident.escalation_details}
                  feedback={incident.feedback}
                />
              )}
            </div>

            {/* Right column ~30% */}
            <div className="w-72 flex-shrink-0 space-y-4">
              <CaseDetailsCard
                incidentId={incident.incident_id}
                category={incident.category}
                status={incident.status}
                createdAt={incident.timestamps.created}
                updatedAt={incident.timestamps.updated}
                priority={incident.escalation_details?.priority}
                urgency={incident.escalation_details?.urgency}
                impact={incident.escalation_details?.impact}
              />
              <IdentifiersCard
                incidentId={incident.incident_id}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
