interface Props {
  status: 'Open' | 'Escalated' | 'Resolved'
  className?: string
}

export default function StatusBadge({ status, className = '' }: Props) {
  const cls =
    status === 'Open' ? 'badge-open' :
    status === 'Escalated' ? 'badge-escalated' :
    'badge-resolved'

  return (
    <span
      data-testid={`status-badge-${status.toLowerCase()}`}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${cls} ${className}`}
    >
      {status}
    </span>
  )
}
