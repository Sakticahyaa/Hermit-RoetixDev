import { useState } from 'react'
import { Pencil, Trash2, Clock, Calendar, History, Archive } from 'lucide-react'
import { isPast, isToday, isTomorrow } from 'date-fns'
import { StatusBadge } from './ui/StatusBadge'
import { PriorityDot } from './ui/PriorityDot'
import { Avatar } from './ui/Avatar'
import { TaskForm } from './TaskForm'
import { TaskLogModal } from './TaskLogModal'
import type { Task, Project, Member, TaskInsert } from '../types'

interface Props {
  task: Task
  projects: Project[]
  members: Member[]
  onEdit: (id: string, data: Partial<TaskInsert>, logNote?: string) => Promise<void>
  onArchive: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  style?: React.CSSProperties
}

function deadlineLabel(dl: string) {
  const d = new Date(dl)
  if (isToday(d))    return { text: 'Today',    color: '#f59e0b' }
  if (isTomorrow(d)) return { text: 'Tomorrow', color: '#84cc16' }
  if (isPast(d))     return { text: 'Overdue',  color: '#ef4444' }
  const days = Math.ceil((d.getTime() - Date.now()) / 86400000)
  return { text: `${days}d`, color: days <= 3 ? '#f97316' : 'var(--muted)' }
}

export function TaskCard({ task, projects, members, onEdit, onArchive, onDelete, style }: Props) {
  const [editing, setEditing]   = useState(false)
  const [showLog, setShowLog]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [hovered, setHovered]   = useState(false)

  const projectColor = task.project?.color ?? '#6b7280'
  const dl = task.deadline ? deadlineLabel(task.deadline) : null

  const handleDelete = async () => {
    if (!confirm(`Delete "${task.title}"?`)) return
    setDeleting(true)
    await onDelete(task.id)
  }

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '12px 14px',
          borderLeft: `3px solid ${projectColor}`,
          opacity: deleting ? 0.5 : 1,
          transition: 'background 0.1s, border-color 0.1s',
          ...(hovered ? { background: '#202020', borderColor: '#333' } : {}),
          ...style,
        }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
          <PriorityDot priority={task.priority} />
          <div style={{ flex: 1, fontSize: 13, fontWeight: 500, lineHeight: 1.4, color: 'var(--text)' }}>
            {task.title}
          </div>
          <div style={{ display: 'flex', gap: 4, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s', flexShrink: 0 }}>
            <button onClick={() => setShowLog(true)} style={actionBtn} title="History">
              <History size={12} />
            </button>
            <button onClick={() => setEditing(true)} style={actionBtn} title="Edit">
              <Pencil size={12} />
            </button>
            <button onClick={() => onArchive(task.id)} style={{ ...actionBtn, color: '#f59e0b' }} title="Archive">
              <Archive size={12} />
            </button>
            <button onClick={handleDelete} style={{ ...actionBtn, color: '#ef4444' }} title="Delete">
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, lineHeight: 1.5,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {task.description}
          </div>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <StatusBadge status={task.status} size="sm" />

          {task.project && (
            <span style={{
              fontSize: 10, padding: '2px 6px', borderRadius: 4,
              background: `${projectColor}22`, color: projectColor,
              border: `1px solid ${projectColor}33`, fontWeight: 500,
            }}>
              {task.project.name}
            </span>
          )}

          {dl && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: dl.color }}>
              <Calendar size={10} /> {dl.text}
            </span>
          )}

          {task.estimated_hours && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--muted)' }}>
              <Clock size={10} /> {task.estimated_hours}h
            </span>
          )}

          {task.assignee && (
            <span style={{ marginLeft: 'auto' }}>
              <Avatar name={task.assignee.name} color={task.assignee.avatar_color} size={20} />
            </span>
          )}
        </div>
      </div>

      {editing && (
        <TaskForm
          task={task}
          projects={projects}
          members={members}
          onSave={(data, note) => onEdit(task.id, data, note)}
          onClose={() => setEditing(false)}
        />
      )}

      {showLog && (
        <TaskLogModal task={task} onClose={() => setShowLog(false)} />
      )}
    </>
  )
}

const actionBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--muted)', padding: 4, borderRadius: 4,
  display: 'flex', alignItems: 'center',
}
