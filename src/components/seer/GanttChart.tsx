import { useState, useMemo, useRef, useEffect } from 'react'
import { addDays, differenceInDays, format, startOfWeek, eachDayOfInterval, isToday } from 'date-fns'
import { Pencil, Trash2, Plus } from 'lucide-react'
import type { SeerEntry, SeerInsert, SeerUpdate, Project } from '../../types'
import { SeerForm } from './SeerForm'

interface Props {
  entries: SeerEntry[]
  projects: Project[]
  onAdd: (data: Omit<SeerInsert, 'tenant_id'>) => Promise<void>
  onEdit: (id: string, data: SeerUpdate) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const ENTRY_H  = 44
const GROUP_H  = 30
const LABEL_W  = 210
const DAY_W    = 36
const HEADER_H = 60

// ─── Row types ────────────────────────────────────────────────────────────────
type GanttRow =
  | { kind: 'group'; project: Project | null; count: number }
  | { kind: 'entry'; entry: SeerEntry; project: Project | null }

// ─── Component ────────────────────────────────────────────────────────────────
export function GanttChart({ entries, projects, onAdd, onEdit, onDelete }: Props) {
  const [showForm,   setShowForm]   = useState(false)
  const [editing,    setEditing]    = useState<SeerEntry | null>(null)
  const [dragDates,  setDragDates]  = useState<{ start: string; end: string } | null>(null)
  const [detail,     setDetail]     = useState<{ entry: SeerEntry; x: number; y: number } | null>(null)

  const chartRef = useRef<HTMLDivElement>(null)
  const dragRef  = useRef<{ startX: number; endX: number } | null>(null)
  const [dragVis, setDragVis] = useState<{ startX: number; endX: number } | null>(null)

  // ── Date range ──────────────────────────────────────────────────────────────
  const today = new Date()

  const rangeStart = useMemo(() => {
    if (entries.length === 0) return startOfWeek(today, { weekStartsOn: 1 })
    const min = entries.reduce((a, e) => a < e.start_date ? a : e.start_date, entries[0].start_date)
    return addDays(new Date(min), -7)
  }, [entries])

  const rangeEnd = useMemo(() => {
    if (entries.length === 0) return addDays(today, 45)
    const max = entries.reduce((a, e) => a > e.end_date ? a : e.end_date, entries[0].end_date)
    return addDays(new Date(max), 14)
  }, [entries])

  const days   = eachDayOfInterval({ start: rangeStart, end: rangeEnd })
  const totalW = days.length * DAY_W

  const months = useMemo(() => {
    const groups: { label: string; count: number }[] = []
    let cur = ''
    let count = 0
    days.forEach(d => {
      const m = format(d, 'MMM yyyy')
      if (m !== cur) { if (cur) groups.push({ label: cur, count }); cur = m; count = 1 }
      else count++
    })
    if (cur) groups.push({ label: cur, count })
    return groups
  }, [days])

  const getX = (date: string) => differenceInDays(new Date(date), rangeStart) * DAY_W
  const getW = (s: string, e: string) => Math.max(4, (differenceInDays(new Date(e), new Date(s)) + 1) * DAY_W)
  const todayX = getX(format(today, 'yyyy-MM-dd'))

  // ── Grouped rows ────────────────────────────────────────────────────────────
  const rows = useMemo<GanttRow[]>(() => {
    const projectMap = new Map<string, { project: Project | null; entries: SeerEntry[] }>()
    entries.forEach(e => {
      const key = e.project_id ?? '__none__'
      if (!projectMap.has(key)) {
        projectMap.set(key, { project: projects.find(p => p.id === e.project_id) ?? null, entries: [] })
      }
      projectMap.get(key)!.entries.push(e)
    })
    // Sort entries within groups by start_date
    projectMap.forEach(g => g.entries.sort((a, b) => a.start_date.localeCompare(b.start_date)))

    // Sort groups: named projects (alphabetical) then no-project
    const sorted = [...projectMap.entries()].sort(([kA, a], [kB, b]) => {
      if (kA === '__none__') return 1
      if (kB === '__none__') return -1
      return (a.project?.name ?? '').localeCompare(b.project?.name ?? '')
    })

    const result: GanttRow[] = []
    sorted.forEach(([, g]) => {
      result.push({ kind: 'group', project: g.project, count: g.entries.length })
      g.entries.forEach(e => result.push({ kind: 'entry', entry: e, project: g.project }))
    })
    return result
  }, [entries, projects])

  // Precompute row Y offsets
  const rowLayout = useMemo(() => {
    const items: { y: number; h: number }[] = []
    let y = 0
    for (const row of rows) {
      const h = row.kind === 'group' ? GROUP_H : ENTRY_H
      items.push({ y, h })
      y += h
    }
    return { items, totalH: y }
  }, [rows])

  // ── Drag-to-create ───────────────────────────────────────────────────────────
  const getChartX = (clientX: number): number => {
    if (!chartRef.current) return 0
    const rect = chartRef.current.getBoundingClientRect()
    return clientX - rect.left + chartRef.current.scrollLeft
  }

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragRef.current) return
      const x = getChartX(e.clientX)
      dragRef.current.endX = x
      setDragVis({ ...dragRef.current })
    }
    const up = () => {
      if (dragRef.current) {
        const { startX, endX } = dragRef.current
        const lo = Math.min(startX, endX)
        const hi = Math.max(startX, endX)
        if (hi - lo > DAY_W / 2) {
          const s = format(addDays(rangeStart, Math.max(0, Math.floor(lo / DAY_W))), 'yyyy-MM-dd')
          const e = format(addDays(rangeStart, Math.max(0, Math.floor(hi / DAY_W))), 'yyyy-MM-dd')
          setDragDates({ start: s, end: e })
          setShowForm(true)
        }
        dragRef.current = null
        setDragVis(null)
      }
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [rangeStart])

  const handleRowMouseDown = (e: React.MouseEvent) => {
    if (detail) { setDetail(null); return }
    e.preventDefault()
    const x = getChartX(e.clientX)
    dragRef.current = { startX: x, endX: x }
    setDragVis({ startX: x, endX: x })
  }

  // ── Bar color ────────────────────────────────────────────────────────────────
  const barColor = (row: GanttRow & { kind: 'entry' }) =>
    row.project?.color ?? row.entry.color ?? '#6366f1'

  // ── Open form ────────────────────────────────────────────────────────────────
  const openNew = () => { setDragDates(null); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditing(null); setDragDates(null) }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Seer</span>
          <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 10 }}>Timeline / Gantt</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{entries.length} items</span>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={openNew} style={{ padding: '7px 14px', borderRadius: 6, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={13} /> Add Item
          </button>
        </div>
      </div>

      {/* Gantt area */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <div style={{ display: 'flex', minWidth: LABEL_W + totalW }}>

          {/* ── Left label column ── */}
          <div style={{ width: LABEL_W, minWidth: LABEL_W, position: 'sticky', left: 0, zIndex: 10, background: 'var(--surface)', borderRight: '1px solid var(--border)', flexShrink: 0 }}>
            {/* Header spacer */}
            <div style={{ height: HEADER_H, borderBottom: '1px solid var(--border)' }} />

            {rows.map((row, i) => {
              if (row.kind === 'group') {
                const color = row.project?.color ?? '#6b7280'
                return (
                  <div key={`g-${i}`} style={{
                    height: GROUP_H,
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '0 14px',
                    borderBottom: '1px solid var(--border)',
                    borderLeft: `3px solid ${color}`,
                    background: `${color}12`,
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color }}>{row.project?.name ?? 'No Project'}</span>
                    <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 'auto' }}>{row.count}</span>
                  </div>
                )
              }

              const isHov = detail?.entry.id === row.entry.id
              return (
                <div key={row.entry.id} style={{
                  height: ENTRY_H, display: 'flex', alignItems: 'center',
                  padding: '0 14px 0 24px', gap: 8,
                  borderBottom: '1px solid var(--border)',
                  background: isHov ? 'var(--hover)' : 'var(--surface)',
                  transition: 'background 0.1s',
                }}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {row.entry.task_name}
                    </div>
                    {row.entry.description && (
                      <div style={{ fontSize: 10, color: 'var(--muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {row.entry.description}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Right chart column ── */}
          <div ref={chartRef} style={{ flex: 1, position: 'relative' }}>
            {/* Date header — sticky top */}
            <div style={{ height: HEADER_H, position: 'sticky', top: 0, zIndex: 5, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              {/* Month row */}
              <div style={{ height: 28, display: 'flex', borderBottom: '1px solid var(--border)' }}>
                {months.map((m, i) => (
                  <div key={i} style={{ width: m.count * DAY_W, minWidth: m.count * DAY_W, padding: '0 8px', display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text)', borderRight: '1px solid var(--border)' }}>
                    {m.label}
                  </div>
                ))}
              </div>
              {/* Day row */}
              <div style={{ height: 32, display: 'flex', alignItems: 'center' }}>
                {days.map((d, i) => {
                  const isT = isToday(d); const isWknd = d.getDay() === 0 || d.getDay() === 6
                  return (
                    <div key={i} style={{ width: DAY_W, minWidth: DAY_W, textAlign: 'center', fontSize: 10, color: isT ? 'var(--accent)' : isWknd ? '#555' : 'var(--muted)', fontWeight: isT ? 700 : 400, borderRight: '1px solid var(--border)' }}>
                      {format(d, 'd')}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Background rows */}
            <div style={{ position: 'relative' }}>
              {rows.map((row, i) => {
                const h = rowLayout.items[i].h
                if (row.kind === 'group') {
                  const color = row.project?.color ?? '#6b7280'
                  return (
                    <div key={`g-${i}`} style={{ height: h, borderBottom: '1px solid var(--border)', background: `${color}08` }} />
                  )
                }
                return (
                  <div
                    key={row.entry.id}
                    style={{ height: h, borderBottom: '1px solid var(--border)', position: 'relative', cursor: 'crosshair' }}
                    onMouseDown={handleRowMouseDown}
                  >
                    {days.map((d, di) => (d.getDay() === 0 || d.getDay() === 6)
                      ? <div key={di} style={{ position: 'absolute', left: di * DAY_W, top: 0, width: DAY_W, height: '100%', background: 'rgba(128,128,128,0.06)', pointerEvents: 'none' }} />
                      : null
                    )}
                  </div>
                )
              })}
            </div>

            {/* Bars */}
            {rows.map((row, i) => {
              if (row.kind !== 'entry') return null
              const color   = barColor(row)
              const barTop  = HEADER_H + rowLayout.items[i].y
              const isSelected = detail?.entry.id === row.entry.id

              return (
                <div
                  key={row.entry.id}
                  className="gantt-bar"
                  style={{
                    left: getX(row.entry.start_date),
                    width: getW(row.entry.start_date, row.entry.end_date),
                    top: barTop + (ENTRY_H - 28) / 2,
                    background: color,
                    opacity: isSelected ? 1 : 0.8,
                    outline: isSelected ? `2px solid ${color}` : 'none',
                    outlineOffset: 1,
                    zIndex: 3,
                  }}
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => {
                    e.stopPropagation()
                    setDetail(prev =>
                      prev?.entry.id === row.entry.id ? null : { entry: row.entry, x: e.clientX, y: e.clientY }
                    )
                  }}
                  title={`${row.entry.task_name} (${row.entry.start_date} – ${row.entry.end_date})`}
                >
                  <div style={{ padding: '0 8px', height: '100%', display: 'flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {row.entry.task_name}
                  </div>
                </div>
              )
            })}

            {/* Today line */}
            <div style={{ position: 'absolute', top: HEADER_H, bottom: 0, left: todayX + DAY_W / 2, width: 2, background: 'var(--accent)', opacity: 0.5, pointerEvents: 'none', zIndex: 4 }} />

            {/* Drag selection */}
            {dragVis && (
              <div style={{
                position: 'absolute', top: HEADER_H, bottom: 0, pointerEvents: 'none', zIndex: 6,
                left: Math.min(dragVis.startX, dragVis.endX),
                width: Math.abs(dragVis.endX - dragVis.startX) + DAY_W,
                background: 'rgba(99,102,241,0.15)',
                borderLeft: '2px solid rgba(99,102,241,0.6)',
                borderRight: '2px solid rgba(99,102,241,0.6)',
              }} />
            )}
          </div>
        </div>
      </div>

      {/* Detail popover */}
      {detail && (() => {
        const px = Math.min(detail.x + 12, window.innerWidth  - 280)
        const py = Math.min(detail.y - 8,  window.innerHeight - 180)
        const proj = projects.find(p => p.id === detail.entry.project_id)
        return (
          <div
            style={{ position: 'fixed', left: px, top: py, width: 264, zIndex: 200, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}
            onMouseDown={e => e.stopPropagation()}
          >
            {proj && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <div style={{ width: 3, height: 14, borderRadius: 2, background: proj.color }} />
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: proj.color }}>{proj.name}</span>
              </div>
            )}
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{detail.entry.task_name}</div>
            {detail.entry.description && (
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5, lineHeight: 1.5 }}>{detail.entry.description}</div>
            )}
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
              {detail.entry.start_date} → {detail.entry.end_date}
              <span style={{ marginLeft: 6 }}>({differenceInDays(new Date(detail.entry.end_date), new Date(detail.entry.start_date)) + 1}d)</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => { setEditing(detail.entry); setDetail(null); setShowForm(true) }} style={smBtn}>
                <Pencil size={11} /> Edit
              </button>
              <button onClick={() => { if (confirm(`Delete "${detail.entry.task_name}"?`)) { onDelete(detail.entry.id); setDetail(null) } }} style={{ ...smBtn, color: '#ef4444', borderColor: '#ef444433' }}>
                <Trash2 size={11} /> Delete
              </button>
              <button onClick={() => setDetail(null)} style={smBtn}>✕</button>
            </div>
          </div>
        )
      })()}

      {/* Backdrop to close detail */}
      {detail && <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setDetail(null)} />}

      {/* Form */}
      {showForm && (
        <SeerForm
          entry={editing}
          projects={projects}
          prefillDates={dragDates ?? undefined}
          onSave={editing ? (data) => onEdit(editing.id, data) : onAdd}
          onClose={closeForm}
        />
      )}
    </div>
  )
}

const smBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  background: 'none', border: '1px solid var(--border)',
  borderRadius: 5, padding: '4px 8px',
  color: 'var(--muted)', fontSize: 11, cursor: 'pointer',
}
