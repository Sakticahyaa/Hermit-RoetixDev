import { X, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { useTaskLogs } from '../hooks/useTaskLogs'
import { StatusBadge } from './ui/StatusBadge'
import { STATUS_COLORS } from '../types'
import type { Task, TaskStatus } from '../types'

interface Props {
  task: Task
  onClose: () => void
}

export function TaskLogModal({ task, onClose }: Props) {
  const { logs, loading } = useTaskLogs(task.id)

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-fadeIn" style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 10, width: 560, maxWidth: '95vw', maxHeight: '85vh',
        overflow: 'auto', padding: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Status History</h2>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{task.title}</div>
          </div>
          <button onClick={onClose} style={iconBtn}><X size={16} /></button>
        </div>

        {/* Current status */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '12px 14px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Current Status</span>
          <StatusBadge status={task.status} />
        </div>

        {loading ? (
          <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 24 }}>Loading…</div>
        ) : logs.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 24 }}>No history yet.</div>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute', left: 15, top: 16, bottom: 16,
              width: 2, background: 'var(--border)',
            }} />

            {logs.map((log, i) => {
              const color = STATUS_COLORS[log.status as TaskStatus] ?? '#6b7280'
              const isLast = i === logs.length - 1
              return (
                <div key={log.id} style={{
                  display: 'flex', gap: 16, marginBottom: isLast ? 0 : 20,
                  alignItems: 'flex-start',
                }}>
                  {/* Dot */}
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: `${color}22`, border: `2px solid ${color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  </div>

                  {/* Content */}
                  <div style={{
                    flex: 1, background: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {log.from_status && (
                        <>
                          <StatusBadge status={log.from_status as TaskStatus} size="sm" />
                          <span style={{ color: 'var(--muted)', fontSize: 11 }}>→</span>
                        </>
                      )}
                      <StatusBadge status={log.status as TaskStatus} size="sm" />
                      <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={10} />
                        {format(new Date(log.changed_at), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                    {log.notes && (
                      <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 6, lineHeight: 1.5 }}>
                        {log.notes}
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                      by {log.changed_by}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--muted)', padding: 4, borderRadius: 4, display: 'flex',
}
