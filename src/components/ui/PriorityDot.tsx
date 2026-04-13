const COLORS = ['', '#22c55e', '#84cc16', '#f59e0b', '#f97316', '#ef4444']
const LABELS = ['', 'P1', 'P2', 'P3', 'P4', 'P5']

interface Props { priority: number; showLabel?: boolean }

export function PriorityDot({ priority, showLabel = false }: Props) {
  const color = COLORS[priority] ?? '#6b7280'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: color, flexShrink: 0,
        boxShadow: `0 0 4px ${color}88`,
      }} />
      {showLabel && (
        <span style={{ fontSize: 11, color, fontWeight: 600 }}>{LABELS[priority]}</span>
      )}
    </span>
  )
}
