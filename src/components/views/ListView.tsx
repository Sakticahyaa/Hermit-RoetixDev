import { useState } from 'react'
import { Pencil, Trash2, History, Calendar, Clock, Archive } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'
import { StatusBadge } from '../ui/StatusBadge'
import { PriorityDot } from '../ui/PriorityDot'
import { Avatar } from '../ui/Avatar'
import { TaskForm } from '../TaskForm'
import { TaskLogModal } from '../TaskLogModal'
import type { Task, Project, Member, TaskInsert } from '../../types'

interface Props {
  tasks: Task[]
  projects: Project[]
  members: Member[]
  onEdit: (id: string, data: Partial<TaskInsert>, note?: string) => Promise<void>
  onArchive: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ListView({ tasks, projects, members, onEdit, onArchive, onDelete }: Props) {
  const [editing, setEditing]   = useState<Task | null>(null)
  const [logging, setLogging]   = useState<Task | null>(null)

  if (tasks.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)', fontSize: 13 }}>
        No tasks found.
      </div>
    )
  }

  return (
    <>
      <div style={{ padding: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['', 'Title', 'Status', 'Project', 'Assignee', 'Deadline', 'Hours', ''].map((h, i) => (
                <th key={i} style={{
                  padding: '8px 10px', textAlign: 'left',
                  color: 'var(--muted)', fontWeight: 500,
                  fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => {
              const dl = task.deadline ? new Date(task.deadline) : null
              const dlColor = dl
                ? (isToday(dl) ? '#f59e0b' : isPast(dl) ? '#ef4444' : 'var(--muted)')
                : 'var(--muted)'
              const assigneeMembers = members.filter(m => task.assignees?.includes(m.id))

              return (
                <tr key={task.id} style={{
                  borderBottom: '1px solid var(--border)',
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '10px 10px 10px 14px', width: 20 }}>
                    <PriorityDot priority={task.priority} />
                  </td>
                  <td style={{ padding: '10px', maxWidth: 300 }}>
                    <div style={{ fontWeight: 500, color: 'var(--text)', marginBottom: task.description ? 2 : 0 }}>{task.title}</div>
                    {task.description && (
                      <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: 280 }}>
                        {task.description}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                    <StatusBadge status={task.status} size="sm" />
                  </td>
                  <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                    {task.project ? (
                      <span style={{
                        fontSize: 11, padding: '2px 6px', borderRadius: 4,
                        background: `${task.project.color}22`, color: task.project.color,
                      }}>
                        {task.project.name}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                    {assigneeMembers.length > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                        {assigneeMembers.map(m => (
                          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Avatar name={m.name} color={m.avatar_color} size={18} />
                            <span style={{ color: 'var(--text)' }}>{m.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '10px', color: dlColor, whiteSpace: 'nowrap' }}>
                    {dl ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={11} />
                        {format(dl, 'MMM d')}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                    {task.estimated_hours ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} /> {task.estimated_hours}h
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => setLogging(task)} style={actionBtn} title="History">
                        <History size={13} />
                      </button>
                      <button onClick={() => setEditing(task)} style={actionBtn} title="Edit">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => onArchive(task.id)} style={{ ...actionBtn, color: '#f59e0b' }} title="Archive">
                        <Archive size={13} />
                      </button>
                      <button
                        onClick={() => confirm(`Delete "${task.title}"?`) && onDelete(task.id)}
                        style={{ ...actionBtn, color: '#ef4444' }} title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <TaskForm
          task={editing} projects={projects} members={members}
          onSave={(data, note) => onEdit(editing.id, data, note)}
          onClose={() => setEditing(null)}
        />
      )}
      {logging && (
        <TaskLogModal task={logging} onClose={() => setLogging(null)} />
      )}
    </>
  )
}

const actionBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--muted)', padding: 4, borderRadius: 4, display: 'flex',
}
