import { STATUS_COLORS, STATUS_BG } from '../../types'
import type { TaskStatus } from '../../types'

interface Props {
  status: TaskStatus
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const color = STATUS_COLORS[status]
  const bg    = STATUS_BG[status]
  const px    = size === 'sm' ? '6px' : '8px'
  const py    = size === 'sm' ? '2px' : '3px'
  const fs    = size === 'sm' ? '10px' : '11px'

  return (
    <span style={{
      background: bg,
      color,
      border: `1px solid ${color}33`,
      borderRadius: 4,
      padding: `${py} ${px}`,
      fontSize: fs,
      fontWeight: 600,
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  )
}
