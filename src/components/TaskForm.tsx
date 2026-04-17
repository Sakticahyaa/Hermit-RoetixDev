import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { ALL_STATUSES, STATUS_COLORS } from '../types'
import type { Task, TaskInsert, Project, Member, TaskStatus } from '../types'

interface Props {
  task?: Task | null
  projects: Project[]
  members: Member[]
  onSave: (data: Partial<TaskInsert>, logNote?: string) => Promise<void>
  onClose: () => void
}

export function TaskForm({ task, projects, members, onSave, onClose }: Props) {
  const isEdit = !!task
  const [title, setTitle]       = useState(task?.title ?? '')
  const [description, setDesc]  = useState(task?.description ?? '')
  const [status, setStatus]     = useState<TaskStatus>(task?.status ?? 'Unassigned')
  const [priority, setPriority] = useState<1|2|3|4|5>(task?.priority ?? 3)
  const [projectId, setProject] = useState(task?.project_id ?? '')
  const [assigneeId, setAssign] = useState(task?.assigned_to ?? '')
  const [deadline, setDeadline] = useState(task?.deadline ?? '')
  const [hours, setHours]       = useState(task?.estimated_hours?.toString() ?? '')
  const [logNote, setLogNote]   = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const statusChanged = isEdit && status !== task.status

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        description: description || null,
        status,
        priority: priority as 1|2|3|4|5,
        project_id: projectId || null,
        assigned_to: assigneeId || null,
        deadline: deadline || null,
        estimated_hours: hours ? parseFloat(hours) : null,
      }, statusChanged ? logNote || undefined : undefined)
      onClose()
    } catch (e) {
      setError((e as Error).message)
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-fadeIn" style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 10, width: 520, maxWidth: '95vw', maxHeight: '90vh',
        overflow: 'auto', padding: 24,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, flex: 1 }}>
            {isEdit ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} style={iconBtn}>
            <X size={16} />
          </button>
        </div>

        {error && (
          <div style={{ background: '#ef444415', border: '1px solid #ef444433', borderRadius: 6, padding: '8px 12px', marginBottom: 14, fontSize: 12, color: '#ef4444', display: 'flex', gap: 6 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} placeholder="Task title…" />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Notes / Description</label>
            <textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              style={{ ...inputStyle, height: 72, resize: 'vertical' }}
              placeholder="Optional notes…"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Status */}
            <div>
              <label style={labelStyle}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)} style={{
                ...inputStyle,
                color: STATUS_COLORS[status],
                borderColor: `${STATUS_COLORS[status]}44`,
              }}>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label style={labelStyle}>Priority</label>
              <select value={priority} onChange={e => setPriority(Number(e.target.value) as 1|2|3|4|5)} style={inputStyle}>
                {([1,2,3,4,5] as const).map(p => <option key={p} value={p}>P{p} — {['Critical','High','Medium','Low','Minimal'][p-1]}</option>)}
              </select>
            </div>

            {/* Project */}
            <div>
              <label style={labelStyle}>Project</label>
              <select value={projectId} onChange={e => setProject(e.target.value)} style={inputStyle}>
                <option value="">No project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label style={labelStyle}>Assignee</label>
              <select value={assigneeId} onChange={e => setAssign(e.target.value)} style={inputStyle}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="task-deadline" style={{ ...labelStyle, cursor: 'pointer' }}>Deadline</label>
              <input id="task-deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={inputStyle} />
            </div>

            {/* Hours */}
            <div>
              <label style={labelStyle}>Est. Hours</label>
              <input type="number" min="0" step="0.5" value={hours} onChange={e => setHours(e.target.value)} style={inputStyle} placeholder="e.g. 4" />
            </div>
          </div>

          {/* Status change note */}
          {statusChanged && (
            <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: 12 }}>
              <label style={{ ...labelStyle, color: 'var(--accent)' }}>
                Status Change Note (optional)
              </label>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
                {task?.status} → {status}
              </div>
              <input
                value={logNote}
                onChange={e => setLogNote(e.target.value)}
                style={inputStyle}
                placeholder="Add context for this status change…"
              />
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
            <button type="submit" disabled={saving} style={submitBtn}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, color: 'var(--muted)',
  marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em',
}
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 6, padding: '7px 10px', color: 'var(--text)',
  fontSize: 13, outline: 'none',
}
const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--muted)', padding: 4, borderRadius: 4, display: 'flex',
}
const cancelBtn: React.CSSProperties = {
  padding: '7px 14px', borderRadius: 6, border: '1px solid var(--border)',
  background: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer',
}
const submitBtn: React.CSSProperties = {
  padding: '7px 16px', borderRadius: 6, border: 'none',
  background: 'var(--accent)', color: '#fff', fontSize: 13,
  fontWeight: 600, cursor: 'pointer',
}
