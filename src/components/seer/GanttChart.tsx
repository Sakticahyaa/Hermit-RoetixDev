import { useState, useMemo } from 'react'
import { addDays, differenceInDays, format, startOfWeek, eachDayOfInterval, isToday } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'
import type { SeerEntry, SeerInsert, SeerUpdate, Project } from '../../types'
import { SeerForm } from './SeerForm'

interface Props {
  entries: SeerEntry[]
  projects: Project[]
  onAdd: (data: Omit<SeerInsert, 'tenant_id'>) => Promise<void>
  onEdit: (id: string, data: SeerUpdate) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const ROW_H     = 44
const LABEL_W   = 200
const DAY_W     = 36
const HEADER_H  = 60

export function GanttChart({ entries, projects, onAdd, onEdit, onDelete }: Props) {
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState<SeerEntry | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Determine visible date range
  const today = new Date()
  const rangeStart = useMemo(() => {
    if (entries.length === 0) return startOfWeek(today, { weekStartsOn: 1 })
    const min = entries.reduce((a, e) => a < e.start_date ? a : e.start_date, entries[0].start_date)
    return addDays(new Date(min), -7)
  }, [entries])

  const rangeEnd = useMemo(() => {
    if (entries.length === 0) return addDays(today, 30)
    const max = entries.reduce((a, e) => a > e.end_date ? a : e.end_date, entries[0].end_date)
    return addDays(new Date(max), 7)
  }, [entries])

  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd })
  const totalW = days.length * DAY_W

  // Group days by month
  const months = useMemo(() => {
    const groups: { label: string; days: number; start: number }[] = []
    let cur = ''
    let count = 0
    let startIdx = 0
    days.forEach((d, i) => {
      const m = format(d, 'MMMM yyyy')
      if (m !== cur) {
        if (cur) groups.push({ label: cur, days: count, start: startIdx })
        cur = m; count = 1; startIdx = i
      } else count++
    })
    if (cur) groups.push({ label: cur, days: count, start: startIdx })
    return groups
  }, [days])

  const getX = (date: string) => {
    const d = new Date(date)
    const diff = differenceInDays(d, rangeStart)
    return diff * DAY_W
  }

  const getW = (start: string, end: string) => {
    return Math.max(4, (differenceInDays(new Date(end), new Date(start)) + 1) * DAY_W)
  }

  const todayX = getX(format(today, 'yyyy-MM-dd'))

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{
        padding: '12px 20px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Seer</span>
          <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 10 }}>Timeline / Gantt</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{entries.length} items</span>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => setShowForm(true)} style={{
            padding: '7px 14px', borderRadius: 6, border: 'none',
            background: 'var(--accent)', color: '#fff', fontSize: 12,
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            + Add Item
          </button>
        </div>
      </div>

      {/* Gantt area */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <div style={{ display: 'flex', minWidth: LABEL_W + totalW }}>

          {/* Left label column */}
          <div style={{
            width: LABEL_W, minWidth: LABEL_W, flexShrink: 0,
            position: 'sticky', left: 0, zIndex: 10,
            background: 'var(--surface)', borderRight: '1px solid var(--border)',
          }}>
            {/* Header spacer */}
            <div style={{ height: HEADER_H, borderBottom: '1px solid var(--border)' }} />
            {entries.map((entry, i) => {
              const project = projects.find(p => p.id === entry.project_id)
              const isHov = hoveredId === entry.id
              return (
                <div
                  key={entry.id}
                  onMouseEnter={() => setHoveredId(entry.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    height: ROW_H, display: 'flex', alignItems: 'center',
                    padding: '0 12px', gap: 8,
                    borderBottom: '1px solid var(--border)',
                    background: isHov ? 'var(--hover)' : i % 2 === 1 ? '#141414' : 'var(--surface)',
                    transition: 'background 0.1s',
                  }}
                >
                  {project && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: project.color, flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {entry.task_name}
                    </div>
                    {entry.description && (
                      <div style={{ fontSize: 10, color: 'var(--muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {entry.description}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 2, opacity: isHov ? 1 : 0, transition: 'opacity 0.15s' }}>
                    <button onClick={() => setEditing(entry)} style={actionBtn}><Pencil size={11} /></button>
                    <button onClick={() => confirm(`Delete "${entry.task_name}"?`) && onDelete(entry.id)} style={{ ...actionBtn, color: '#ef4444' }}><Trash2 size={11} /></button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right chart column */}
          <div style={{ flex: 1, position: 'relative' }}>
            {/* Date header */}
            <div style={{ height: HEADER_H, position: 'sticky', top: 0, zIndex: 5, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              {/* Month row */}
              <div style={{ height: 28, display: 'flex', borderBottom: '1px solid var(--border)' }}>
                {months.map((m, i) => (
                  <div key={i} style={{
                    width: m.days * DAY_W, minWidth: m.days * DAY_W,
                    padding: '0 8px', display: 'flex', alignItems: 'center',
                    fontSize: 11, fontWeight: 700, color: 'var(--text)',
                    borderRight: '1px solid var(--border)',
                  }}>
                    {m.label}
                  </div>
                ))}
              </div>
              {/* Day row */}
              <div style={{ height: 32, display: 'flex', alignItems: 'center' }}>
                {days.map((d, i) => {
                  const isT = isToday(d)
                  const isWknd = d.getDay() === 0 || d.getDay() === 6
                  return (
                    <div key={i} style={{
                      width: DAY_W, minWidth: DAY_W, textAlign: 'center',
                      fontSize: 10,
                      color: isT ? 'var(--accent)' : isWknd ? '#555' : 'var(--muted)',
                      fontWeight: isT ? 700 : 400,
                      borderRight: '1px solid var(--border)',
                    }}>
                      {format(d, 'd')}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Rows */}
            <div style={{ position: 'relative' }}>
              {entries.map((entry, i) => {
                const isHov = hoveredId === entry.id
                return (
                  <div
                    key={entry.id}
                    onMouseEnter={() => setHoveredId(entry.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      height: ROW_H, position: 'relative',
                      borderBottom: '1px solid var(--border)',
                      background: isHov ? 'rgba(255,255,255,0.02)' : i % 2 === 1 ? '#0c0c0c' : 'transparent',
                    }}
                  >
                    {/* Weekend shading */}
                    {days.map((d, di) => {
                      if (d.getDay() === 0 || d.getDay() === 6) {
                        return <div key={di} style={{ position: 'absolute', left: di * DAY_W, top: 0, width: DAY_W, height: '100%', background: 'rgba(255,255,255,0.015)' }} />
                      }
                      return null
                    })}

                    {/* Bar */}
                    <div
                      className="gantt-bar"
                      style={{
                        left: getX(entry.start_date),
                        width: getW(entry.start_date, entry.end_date),
                        background: entry.color,
                        opacity: isHov ? 0.95 : 0.75,
                      }}
                      title={`${entry.task_name} (${entry.start_date} – ${entry.end_date})`}
                    >
                      <div style={{
                        padding: '0 8px', height: '100%',
                        display: 'flex', alignItems: 'center',
                        fontSize: 10, fontWeight: 600, color: '#fff',
                        overflow: 'hidden', whiteSpace: 'nowrap',
                      }}>
                        {entry.task_name}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Today line */}
            <div style={{
              position: 'absolute', top: HEADER_H, bottom: 0,
              left: todayX + DAY_W / 2,
              width: 2, background: 'var(--accent)',
              opacity: 0.6, pointerEvents: 'none', zIndex: 4,
            }} />
          </div>
        </div>
      </div>

      {showForm && (
        <SeerForm
          projects={projects}
          onSave={onAdd}
          onClose={() => setShowForm(false)}
        />
      )}
      {editing && (
        <SeerForm
          entry={editing}
          projects={projects}
          onSave={(data) => onEdit(editing.id, data)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

const actionBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--muted)', padding: 3, borderRadius: 4, display: 'flex',
}
