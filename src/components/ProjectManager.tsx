import { useState } from 'react'
import { X, Plus, Pencil, Trash2, FolderOpen } from 'lucide-react'
import type { Project } from '../types'

const PRESET_COLORS = [
  '#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444',
  '#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316',
]

interface Props {
  projects: Project[]
  onAdd: (name: string, color: string) => Promise<void>
  onEdit: (id: string, name: string, color: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}

export function ProjectManager({ projects, onAdd, onEdit, onDelete, onClose }: Props) {
  const [editId, setEditId]     = useState<string | null>(null)
  const [name, setName]         = useState('')
  const [color, setColor]       = useState(PRESET_COLORS[0])
  const [newName, setNewName]   = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const [saving, setSaving]     = useState(false)

  const startEdit = (p: Project) => {
    setEditId(p.id); setName(p.name); setColor(p.color)
  }

  const handleSaveEdit = async () => {
    if (!name.trim() || !editId) return
    setSaving(true)
    await onEdit(editId, name.trim(), color)
    setEditId(null); setSaving(false)
  }

  const handleAdd = async () => {
    if (!newName.trim()) return
    setSaving(true)
    await onAdd(newName.trim(), newColor)
    setNewName(''); setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-fadeIn" style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 10, width: 440, maxWidth: '95vw', maxHeight: '85vh',
        overflow: 'auto', padding: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, flex: 1 }}>
            <FolderOpen size={15} style={{ marginRight: 8, display: 'inline', verticalAlign: 'text-top' }} />
            Projects
          </h2>
          <button onClick={onClose} style={iconBtn}><X size={16} /></button>
        </div>

        {/* Existing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {projects.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', padding: 16 }}>
              No projects yet.
            </div>
          )}
          {projects.map(p => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '10px 14px',
              borderLeft: `3px solid ${p.color}`,
            }}>
              {editId === p.id ? (
                <>
                  <input value={name} onChange={e => setName(e.target.value)} style={{ ...mini, flex: 1 }} />
                  <ColorPicker value={color} onChange={setColor} />
                  <button onClick={handleSaveEdit} disabled={saving} style={saveBtn}>Save</button>
                  <button onClick={() => setEditId(null)} style={cancelBtnSm}>✕</button>
                </>
              ) : (
                <>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: p.color, flexShrink: 0,
                  }} />
                  <span style={{ flex: 1, fontSize: 13 }}>{p.name}</span>
                  <button onClick={() => startEdit(p)} style={iconBtn}><Pencil size={13} /></button>
                  <button
                    onClick={() => confirm(`Delete "${p.name}"? Tasks will be unlinked.`) && onDelete(p.id)}
                    style={{ ...iconBtn, color: '#ef4444' }}
                  ><Trash2 size={13} /></button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add new */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 8, padding: 14,
        }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            New Project
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              style={{ ...mini, flex: 1 }}
              placeholder="Project name…"
            />
            <ColorPicker value={newColor} onChange={setNewColor} />
            <button onClick={handleAdd} disabled={saving || !newName.trim()} style={saveBtn}>
              <Plus size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {PRESET_COLORS.map(c => (
        <button key={c} onClick={() => onChange(c)} style={{
          width: 16, height: 16, borderRadius: '50%', background: c,
          border: value === c ? `2px solid #fff` : '2px solid transparent',
          cursor: 'pointer', padding: 0, outline: 'none',
        }} />
      ))}
    </div>
  )
}

const iconBtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4, borderRadius: 4, display: 'flex' }
const mini: React.CSSProperties = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', color: 'var(--text)', fontSize: 12, outline: 'none' }
const saveBtn: React.CSSProperties = { padding: '5px 10px', borderRadius: 6, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center' }
const cancelBtnSm: React.CSSProperties = { ...saveBtn, background: 'var(--border)', color: 'var(--muted)' }
