interface Props {
  incidentId: string
  category: string
  status: 'Open' | 'Escalated' | 'Resolved'
  createdAt: string
  updatedAt: string
  priority?: string
  urgency?: string
  impact?: string
}

export default function CaseDetailsCard({ category, status, createdAt, updatedAt, priority, urgency, impact }: Props) {
  return (
    <div data-testid="case-details-card" className="card rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800">Case Details</p>
      </div>
      <div className="px-5 py-4 space-y-3">
        <div>
          <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Category</p>
          <p className="text-sm text-gray-700">{category || 'General'}</p>
        </div>
        <div>
          <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Status</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
            status === 'Open' ? 'bg-yellow-100 text-yellow-800' :
            status === 'Escalated' ? 'bg-red-100 text-red-800' :
            'bg-green-100 text-green-800'
          }`}>
            {status}
          </span>
        </div>
        {priority && (
          <div>
            <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Priority</p>
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{priority}</span>
          </div>
        )}
        {urgency && (
          <div>
            <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Urgency</p>
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{urgency}</span>
          </div>
        )}
        {impact && (
          <div>
            <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Impact</p>
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{impact}</span>
          </div>
        )}
        <div>
          <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Created</p>
          <p className="text-sm text-gray-700">{new Date(createdAt).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs uppercase font-semibold text-gray-400 tracking-wide mb-0.5">Last Updated</p>
          <p className="text-sm text-gray-700">{new Date(updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
