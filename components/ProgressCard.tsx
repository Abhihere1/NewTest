interface Props {
  status: 'Open' | 'Escalated' | 'Resolved'
}

const MILESTONES = ['Open', 'Escalated', 'Resolved'] as const

export default function ProgressCard({ status }: Props) {
  const activeIndex = MILESTONES.indexOf(status)

  // Direct Open->Resolved skips Escalated
  const getStepState = (milestone: string, idx: number) => {
    if (status === 'Resolved' && milestone === 'Escalated') return 'skipped'
    if (idx <= activeIndex) return 'completed'
    return 'pending'
  }

  return (
    <div data-testid="progress-card" className="card rounded-xl p-5">
      <p className="text-sm font-semibold text-gray-800 mb-4">Progress</p>
      <div className="flex items-center">
        {MILESTONES.map((milestone, idx) => {
          const state = getStepState(milestone, idx)
          const isLast = idx === MILESTONES.length - 1
          return (
            <div key={milestone} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  data-testid={`milestone-${milestone.toLowerCase()}`}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    state === 'completed'
                      ? 'bg-red-600 text-white'
                      : state === 'skipped'
                      ? 'bg-gray-200 text-gray-400'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {state === 'completed' ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <p className={`text-xs mt-1 font-medium ${state === 'completed' ? 'text-red-600' : 'text-gray-400'}`}>
                  {milestone}
                </p>
              </div>
              {!isLast && (
                <div
                  className="flex-1 h-0.5 mx-2"
                  style={{ background: idx < activeIndex ? '#DC2626' : '#E5E7EB' }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
