import StatusBadge from './StatusBadge'
import FeedbackCard from './FeedbackCard'

interface EscalationDetails {
  reason?: string
  priority?: string
  urgency?: string
  impact?: string
  support_group?: string
}

interface FeedbackData {
  rating?: number
  comment?: string
  submitted?: boolean
}

interface Props {
  incidentId: string
  status: 'Open' | 'Escalated' | 'Resolved'
  escalationDetails?: EscalationDetails
  feedback?: FeedbackData
}

export default function OutcomeCard({ incidentId, status, escalationDetails, feedback }: Props) {
  if (status === 'Open') return null

  return (
    <div data-testid="outcome-card" className="card rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <StatusBadge status={status} />
        <p className="text-sm font-semibold text-gray-800">
          {status === 'Escalated' ? 'Escalation Details' : 'Resolution Details'}
        </p>
      </div>

      <div className="px-5 py-4">
        {status === 'Escalated' && escalationDetails && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
            {escalationDetails.reason && (
              <div className="col-span-2">
                <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Reason</p>
                <p className="text-sm text-gray-700">{escalationDetails.reason}</p>
              </div>
            )}
            {escalationDetails.priority && (
              <div>
                <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Priority</p>
                <p className="text-sm text-gray-700">{escalationDetails.priority}</p>
              </div>
            )}
            {escalationDetails.urgency && (
              <div>
                <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Urgency</p>
                <p className="text-sm text-gray-700">{escalationDetails.urgency}</p>
              </div>
            )}
            {escalationDetails.impact && (
              <div>
                <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Impact</p>
                <p className="text-sm text-gray-700">{escalationDetails.impact}</p>
              </div>
            )}
            {escalationDetails.support_group && (
              <div>
                <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Support Group</p>
                <p className="text-sm text-gray-700">{escalationDetails.support_group}</p>
              </div>
            )}
          </div>
        )}

        {status === 'Resolved' && (
          <p className="text-sm text-gray-600 mb-4">This incident was resolved through the Patch self-service workflow.</p>
        )}

        <FeedbackCard
          incidentId={incidentId}
          initialRating={feedback?.rating}
          initialComment={feedback?.comment}
          initialSubmitted={feedback?.submitted || false}
          compact
        />
      </div>
    </div>
  )
}
