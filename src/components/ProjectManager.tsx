import { useState, useEffect } from 'react'
import { X, Plus, Pencil, Archive, ArchiveRestore, Trash2, FolderOpen } from 'lucide-react'
import type { Project } from '../types'

interface Props {
  allProjects: Project[]
  onAdd: (name: string, color: string) => Promise<Project>
  onEdit: (id: string, name: string, color: string) => Promise<Project>
  onArchive: (id: string) => Promise<Project>
  onUnarchive: (id: string) => Promise<Project>
  onDelete: (id: string) => Promise<void>
  onClose: () => void
  /** Called when archive/unarchive changes the active project list */
  onActiveListChange: (project: Project, action: 'archive' | 'unarchive') => void
}

export function ProjectManager({
  allProjects, onAdd, onEdit, onArchive, onUnarchive, onDelete, onClose, onActiveListChange,
}: Props) {
  const [editId, setEditId]     = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('#6366f1')
  const [newName, setNewName]   = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [saving, setSaving]     = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const active   = allProjects.filter(p => !p.archived)
  const archived = allProjects.filter(p => p.archived)

  const startEdit = (p: Project) => {
    setEditId(p.id); setEditName(p.name); setEditColor(p.color)
  }

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editId) return
    setSaving(true)
    await onEdit(editId, editName.trim(), editColor)
    setEditId(null); setSaving(false)
  }

  const handleAdd = async () => {
    if (!newName.trim()) return
    setSaving(true)
    await onAdd(newName.trim(), newColor)
    setNewName(''); setSaving(false)
  }

  const handleArchive = async (p: Project) => {
    if (!confirm(`Archive "${p.name}"? It will be hidden from active views but tasks remain linked.`)) return
    const updated = await onArchive(p.id)
    onActiveListChange(updated, 'archive')
  }

  const handleUnarchive = async (p: Project) => {
    const updated = await onUnarchive(p.id)
    onActiveListChange(updated, 'unarchive')
  }

  const handleDelete = async (p: Project) => {
    if (!confirm(`Permanently delete "${p.name}"? Tasks linked to it will be unlinked. This cannot be undone.`)) return
    await onDelete(p.id)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-fadeIn" style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 10, width: 480, maxWidth: '95vw', maxHeight: '88vh',
        overflow: 'auto', padding: 24,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FolderOpen size={15} /> Projects
          </h2>
          <span style={{ fontSize: 11, color: 'var(--muted)', marginRight: 12 }}>
            {active.length} active{archived.length > 0 ? `, ${archived.length} archived` : ''}
          </span>
          <button onClick={onClose} style={iconBtn}><X size={16} /></button>
        </div>

        {/* Active projects */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Active
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {active.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', padding: '12px 0' }}>
                No active projects yet.
              </div>
            )}
            {active.map(p => (
              <ProjectRow
                key={p.id}
                project={p}
                isEditing={editId === p.id}
                editName={editName}
                editColor={editColor}
                saving={saving}
                onStartEdit={() => startEdit(p)}
                onNameChange={setEditName}
                onColorChange={setEditColor}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={() => setEditId(null)}
                onArchive={() => handleArchive(p)}
                onDelete={() => handleDelete(p)}
              />
            ))}
          </div>
        </div>

        {/* Archived projects */}
        {archived.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <button onClick={() => setShowArchived(v => !v)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase',
              letterSpacing: '0.08em', padding: 0, marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Archive size={10} />
              Archived ({archived.length}) {showArchived ? '▲' : '▼'}
            </button>
            {showArchived && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {archived.map(p => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '9px 12px', opacity: 0.65,
                    borderLeft: `3px solid ${p.color}55`,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0, opacity: 0.5 }} />
                    <span style={{ flex: 1, fontSize: 12, color: 'var(--muted)', textDecoration: 'line-through' }}>{p.name}</span>
                    <span style={{
                      fontSize: 9, padding: '2px 6px', borderRadius: 3,
                      background: 'rgba(107,114,128,0.15)', color: '#6b7280',
                      border: '1px solid rgba(107,114,128,0.2)',
                    }}>archived</span>
                    <button
                      onClick={() => handleUnarchive(p)}
                      title="Restore project"
                      style={{ ...iconBtn, color: '#10b981' }}
                    >
                      <ArchiveRestore size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      title="Permanently delete"
                      style={{ ...iconBtn, color: '#ef4444' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add new */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 8, padding: 14,
        }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Add Project
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              style={{ ...mini, flex: 1, minWidth: 120 }}
              placeholder="e.g. Roetix, Batin…"
            />
            <ColorPicker value={newColor} onChange={setNewColor} />
            <button onClick={handleAdd} disabled={saving || !newName.trim()} style={addBtn}>
              <Plus size={13} /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ProjectRow ───────────────────────────────────────────────────────────────
interface RowProps {
  project: Project
  isEditing: boolean
  editName: string
  editColor: string
  saving: boolean
  onStartEdit: () => void
  onNameChange: (v: string) => void
  onColorChange: (v: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onArchive: () => void
  onDelete: () => void
}

function ProjectRow({
  project, isEditing, editName, editColor, saving,
  onStartEdit, onNameChange, onColorChange, onSaveEdit, onCancelEdit, onArchive, onDelete,
}: RowProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '9px 12px',
      borderLeft: `3px solid ${project.color}`,
      transition: 'background 0.1s',
    }}>
      {isEditing ? (
        <>
          <input
            value={editName}
            onChange={e => onNameChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onSaveEdit(); if (e.key === 'Escape') onCancelEdit() }}
            autoFocus
            style={{ ...mini, flex: 1 }}
          />
          <ColorPicker value={editColor} onChange={onColorChange} />
          <button onClick={onSaveEdit} disabled={saving} style={saveBtn}>Save</button>
          <button onClick={onCancelEdit} style={cancelBtnSm}>✕</button>
        </>
      ) : (
        <>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: project.color, flexShrink: 0, boxShadow: `0 0 5px ${project.color}66` }} />
          <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{project.name}</span>
          <button onClick={onStartEdit} style={iconBtn} title="Rename / recolor">
            <Pencil size={13} />
          </button>
          <button onClick={onArchive} style={{ ...iconBtn, color: '#f59e0b' }} title="Archive project">
            <Archive size={13} />
          </button>
          <button onClick={onDelete} style={{ ...iconBtn, color: '#ef4444' }} title="Permanently delete">
            <Trash2 size={13} />
          </button>
        </>
      )}
    </div>
  )
}

// ─── ColorPicker ──────────────────────────────────────────────────────────────
function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  const [hex, setHex] = useState(value)

  useEffect(() => { setHex(value) }, [value])

  const commit = (raw: string) => {
    const v = raw.trim()
    if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input
        type="color"
        value={value}
        onChange={e => { onChange(e.target.value); setHex(e.target.value) }}
        style={{ width: 28, height: 28, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 4, background: 'none' }}
      />
      <input
        type="text"
        value={hex}
        onChange={e => setHex(e.target.value)}
        onBlur={e => commit(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && commit(hex)}
        maxLength={7}
        placeholder="#6366f1"
        style={{ ...mini, width: 72 }}
      />
    </div>
  )
}

const iconBtn:     React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' }
const mini:        React.CSSProperties = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', color: 'var(--text)', fontSize: 12, outline: 'none' }
const saveBtn:     React.CSSProperties = { padding: '5px 10px', borderRadius: 6, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 12, cursor: 'pointer' }
const cancelBtnSm: React.CSSProperties = { ...saveBtn, background: 'var(--border)', color: 'var(--muted)' }
const addBtn:      React.CSSProperties = { ...saveBtn, display: 'flex', alignItems: 'center', gap: 4 }
