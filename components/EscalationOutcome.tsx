import Link from 'next/link'
import StatusBadge from './StatusBadge'

interface EscalationData {
  reason?: string
  priority?: string
  urgency?: string
  impact?: string
  support_group?: string
}

interface Props {
  incidentId: string
  category: string
  description?: string
  createdFor?: string
  createdAt?: string
  escalationData: EscalationData
}

export default function EscalationOutcome({ incidentId, category, description, createdFor, createdAt, escalationData }: Props) {
  return (
    <div data-testid="escalation-outcome" className="card rounded-xl overflow-hidden mt-2">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">Incident Summary</p>
          <p className="text-xs text-gray-400 mt-0.5">Routed to Trusted Experts</p>
        </div>
        <StatusBadge status="Escalated" />
      </div>

      <div className="px-5 py-4 grid grid-cols-2 gap-x-6 gap-y-3">
        <div>
          <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Incident #</p>
          <p className="text-sm font-semibold text-gray-800">{incidentId}</p>
        </div>
        <div>
          <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Category</p>
          <p className="text-sm text-gray-700">{category || 'General'}</p>
        </div>
        {description && (
          <div className="col-span-2">
            <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Description</p>
            <p className="text-sm text-gray-700">{description}</p>
          </div>
        )}
        {createdFor && (
          <div>
            <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Created For</p>
            <p className="text-sm text-gray-700">{createdFor}</p>
          </div>
        )}
        {createdAt && (
          <div>
            <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Date / Time</p>
            <p className="text-sm text-gray-700">{createdAt}</p>
          </div>
        )}
        {escalationData.reason && (
          <div className="col-span-2">
            <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Reason</p>
            <p className="text-sm text-gray-700">{escalationData.reason}</p>
          </div>
        )}
        {escalationData.priority && (
          <div>
            <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Priority</p>
            <p className="text-sm text-gray-700">{escalationData.priority}</p>
          </div>
        )}
        {escalationData.urgency && (
          <div>
            <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Urgency</p>
            <p className="text-sm text-gray-700">{escalationData.urgency}</p>
          </div>
        )}
        {escalationData.impact && (
          <div>
            <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Impact</p>
            <p className="text-sm text-gray-700">{escalationData.impact}</p>
          </div>
        )}
        {escalationData.support_group && (
          <div>
            <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Support Group</p>
            <p className="text-sm text-gray-700">{escalationData.support_group}</p>
          </div>
        )}
      </div>

      <div className="px-5 py-3 border-t border-gray-100">
        <Link
          data-testid="view-incident-link"
          href={`/incidents/${incidentId}`}
          className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
        >
          View Incident →
        </Link>
      </div>
    </div>
  )
}
