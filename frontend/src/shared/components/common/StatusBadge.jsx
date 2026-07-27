import './StatusBadge.css'

function StatusBadge({ status }) {
  const normalized = status?.toLowerCase() || ''
  const isOnline = normalized === 'online' || normalized === 'active'
  const isDraft = normalized === 'draft'

  return (
    <span className={`status-badge ${isOnline ? 'online' : isDraft ? 'draft' : 'default'}`}>
      <span className={`status-dot ${isOnline ? 'online' : isDraft ? 'draft' : 'default'}`} />
      {status}
    </span>
  )
}

export default StatusBadge
