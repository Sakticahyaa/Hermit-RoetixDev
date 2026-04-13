import { useState } from 'react'
import { X } from 'lucide-react'
import type { SeerEntry, SeerInsert, Project } from '../../types'

const PRESET_COLORS = [
  '#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444',
  '#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316',
]

interface Props {
  entry?: SeerEntry | null
  projects: Project[]
  onSave: (data: Omit<SeerInsert, 'tenant_id'>) => Promise<void>
  onClose: () => void
}

export function SeerForm({ entry, projects, onSave, onClose }: Props) {
  const isEdit = !!entry
  const [taskName, setName]     = useState(entry?.task_name ?? '')
  const [description, setDesc]  = useState(entry?.description ?? '')
  const [projectId, setProject] = useState(entry?.project_id ?? '')
  const [startDate, setStart]   = useState(entry?.start_date ?? '')
  const [endDate, setEnd]       = useState(entry?.end_date ?? '')
  const [color, setColor]       = useState(entry?.color ?? '#6366f1')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskName.trim()) { setError('Name is required'); return }
    if (!startDate || !endDate) { setError('Start and end dates required'); return }
    if (startDate > endDate) { setError('End date must be after start date'); return }
    setSaving(true)
    try {
      await onSave({
        task_name: taskName.trim(),
        description: description || null,
        project_id: projectId || null,
        start_date: startDate,
        end_date: endDate,
        color,
        order_index: entry?.order_index ?? 0,
      })
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
        borderRadius: 10, width: 460, maxWidth: '95vw', padding: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, flex: 1 }}>
            {isEdit ? 'Edit Timeline Item' : 'New Timeline Item'}
          </h2>
          <button onClick={onClose} style={iconBtn}><X size={16} /></button>
        </div>

        {error && (
          <div style={{ background: '#ef444415', border: '1px solid #ef444433', borderRadius: 6, padding: '8px 12px', marginBottom: 14, fontSize: 12, color: '#ef4444' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Task Name *</label>
            <input value={taskName} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="e.g. Design Sprint" />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={description} onChange={e => setDesc(e.target.value)} style={{ ...inputStyle, height: 60, resize: 'vertical' }} placeholder="Optional…" />
          </div>

          <div>
            <label style={labelStyle}>Project</label>
            <select value={projectId} onChange={e => setProject(e.target.value)} style={inputStyle}>
              <option value="">No project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Start Date *</label>
              <input type="date" value={startDate} onChange={e => setStart(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>End Date *</label>
              <input type="date" value={endDate} onChange={e => setEnd(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Color</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PRESET_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)} style={{
                  width: 24, height: 24, borderRadius: 6, background: c,
                  border: color === c ? '2px solid #fff' : '2px solid transparent',
                  cursor: 'pointer', padding: 0,
                }} />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
            <button type="submit" disabled={saving} style={submitBtn}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add to Timeline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }
const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 10px', color: 'var(--text)', fontSize: 13, outline: 'none' }
const iconBtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4, borderRadius: 4, display: 'flex' }
const cancelBtn: React.CSSProperties = { padding: '7px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }
const submitBtn: React.CSSProperties = { padding: '7px 16px', borderRadius: 6, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }
