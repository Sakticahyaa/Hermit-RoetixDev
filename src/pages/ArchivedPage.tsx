import { useState, useEffect, useCallback } from 'react'
import { ArchiveRestore, Trash2, Calendar, Clock } from 'lucide-react'
import { fetchArchivedTasks, unarchiveTask, deleteTask } from '../lib/supabase'
import { useRoetixDevCtx } from '../context/RoetixDevContext'
import { PriorityDot } from '../components/ui/PriorityDot'
import { StatusBadge } from '../components/ui/StatusBadge'
import { Avatar } from '../components/ui/Avatar'
import type { Task } from '../types'

export function ArchivedPage() {
  const { tenant, members } = useRoetixDevCtx()
  const [tasks, setTasks]     = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!tenant) return
    setLoading(true)
    setError(null)
    try {
      setTasks(await fetchArchivedTasks(tenant.id))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [tenant])

  useEffect(() => { load() }, [load])

  const handleRestore = async (task: Task) => {
    await unarchiveTask(task.id)
    setTasks(prev => prev.filter(t => t.id !== task.id))
  }

  const handleDelete = async (task: Task) => {
    if (!confirm(`Permanently delete "${task.title}"? This cannot be undone.`)) return
    await deleteTask(task.id)
    setTasks(prev => prev.filter(t => t.id !== task.id))
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Archived Tasks</span>
        {!loading && (
          <span style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '2px 8px' }}>
            {tasks.length}
          </span>
        )}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {loading && (
          <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', paddingTop: 40 }}>Loading…</div>
        )}
        {error && (
          <div style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', paddingTop: 40 }}>{error}</div>
        )}
        {!loading && tasks.length === 0 && (
          <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', paddingTop: 40 }}>No archived tasks.</div>
        )}

        {!loading && tasks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 720 }}>
            {tasks.map(task => {
              const projectColor = task.project?.color ?? '#6b7280'
              return (
                <div key={task.id} style={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '12px 14px',
                  borderLeft: `3px solid ${projectColor}55`,
                  display: 'flex', alignItems: 'center', gap: 12, opacity: 0.8,
                }}>
                  <PriorityDot priority={task.priority} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 4 }}>
                      {task.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <StatusBadge status={task.status} size="sm" />
                      {task.project && (
                        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${projectColor}22`, color: projectColor, border: `1px solid ${projectColor}33` }}>
                          {task.project.name}
                        </span>
                      )}
                      {task.deadline && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--muted)' }}>
                          <Calendar size={10} /> {task.deadline.slice(0, 10)}
                        </span>
                      )}
                      {task.estimated_hours && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--muted)' }}>
                          <Clock size={10} /> {task.estimated_hours}h
                        </span>
                      )}
                      {task.assignees?.map(id => {
                        const m = members.find(m => m.id === id)
                        return m ? <Avatar key={id} name={m.name} color={m.avatar_color} size={18} /> : null
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => handleRestore(task)}
                      title="Restore task"
                      style={restoreBtn}
                    >
                      <ArchiveRestore size={13} /> Restore
                    </button>
                    <button
                      onClick={() => handleDelete(task)}
                      title="Permanently delete"
                      style={deleteBtn}
                    >
                      <Trash2 size={13} />
                    </button>
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

const restoreBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  padding: '5px 10px', borderRadius: 6, border: '1px solid #10b98133',
  background: 'none', color: '#10b981', fontSize: 12, cursor: 'pointer',
}
const deleteBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)',
  background: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer',
}
