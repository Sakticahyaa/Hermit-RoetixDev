import { useState, useEffect, useMemo, useRef } from 'react'
import { format, isSameDay, startOfDay, getDay } from 'date-fns'
import type { Member, TimekeeperSlot } from '../../types'

const HOURS_START  = 0
const HOURS_END    = 24
const ROW_HEIGHT   = 48   // px per hour
const TIME_COL_W   = 52   // px for time labels
const HEADER_H     = 44   // px for day headers
const DRAG_STRIP   = 14   // px reserved on right of each day for drag-to-create

const HOURS = Array.from({ length: HOURS_END - HOURS_START }, (_, i) => HOURS_START + i)

function formatHour(h: number): string {
  return `${String(h % 24).padStart(2, '0')}:00`
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface SlotInstance {
  slot: TimekeeperSlot
  member: Member | undefined
  dayIndex: number
  startHour: number
  endHour: number
}

interface LayoutCell {
  colIndex: number
  colCount: number
}

// ─── Expand recurring slots into instances for the visible week ───────────────
function expandSlots(
  slots: TimekeeperSlot[],
  weekDays: Date[],
  memberMap: Map<string, Member>,
): SlotInstance[] {
  const result: SlotInstance[] = []

  for (const slot of slots) {
    const slotStart = new Date(slot.start_time)
    const slotEnd   = new Date(slot.end_time)
    const sH = slotStart.getHours() + slotStart.getMinutes() / 60
    const eH = slotEnd.getHours()   + slotEnd.getMinutes()   / 60
    const visStart = Math.max(sH, HOURS_START)
    const visEnd   = Math.min(eH, HOURS_END)
    if (visStart >= visEnd) continue

    const member = slot.member ?? memberMap.get(slot.member_id)

    if (!slot.is_recurring) {
      const dayIndex = weekDays.findIndex(d => isSameDay(d, slotStart))
      if (dayIndex !== -1) result.push({ slot, member, dayIndex, startHour: visStart, endHour: visEnd })
    } else {
      const until = slot.recurrence_until
        ? new Date(slot.recurrence_until + 'T23:59:59')
        : new Date('2099-12-31')
      const originDay = startOfDay(slotStart)

      if (slot.recurrence_type === 'daily') {
        weekDays.forEach((day, i) => {
          if (day >= originDay && day <= until)
            result.push({ slot, member, dayIndex: i, startHour: visStart, endHour: visEnd })
        })
      } else if (slot.recurrence_type === 'weekly') {
        const targetWd = getDay(slotStart)
        weekDays.forEach((day, i) => {
          if (getDay(day) === targetWd && day >= originDay && day <= until)
            result.push({ slot, member, dayIndex: i, startHour: visStart, endHour: visEnd })
        })
      }
    }
  }
  return result
}

// ─── Compute GCal-style overlap layout per day ────────────────────────────────
// Returns a map from instance index → { colIndex, colCount }
function computeLayout(instances: SlotInstance[]): Map<number, LayoutCell> {
  const result = new Map<number, LayoutCell>()

  // Group instance indices by day
  const byDay = new Map<number, number[]>()
  instances.forEach((inst, i) => {
    const arr = byDay.get(inst.dayIndex) ?? []
    arr.push(i)
    byDay.set(inst.dayIndex, arr)
  })

  byDay.forEach(indices => {
    const sorted = indices
      .map(i => ({ i, s: instances[i].startHour, e: instances[i].endHour }))
      .sort((a, b) => a.s - b.s || a.e - b.e)

    // Greedy column assignment
    const colEnds: number[] = []
    const assigned: number[] = []

    for (const { s, e } of sorted) {
      let col = colEnds.findIndex(end => end <= s)
      if (col === -1) { col = colEnds.length; colEnds.push(0) }
      colEnds[col] = e
      assigned.push(col)
    }

    const totalCols = colEnds.length

    // Find per-slot colCount using its overlap group
    // A slot's colCount = max column used among all slots it overlaps with (+ 1)
    sorted.forEach(({ i: idx, s, e }, pos) => {
      let maxCol = assigned[pos]
      sorted.forEach(({ i: idx2, s: s2, e: e2 }, pos2) => {
        if (pos2 === pos) return
        const overlaps = s < e2 && s2 < e
        if (overlaps) maxCol = Math.max(maxCol, assigned[pos2])
      })
      result.set(idx, { colIndex: assigned[pos], colCount: maxCol + 1 })
    })

    // Slots that don't overlap with anything get colCount = 1
    sorted.forEach(({ i: idx }, pos) => {
      if (!result.has(idx)) result.set(idx, { colIndex: 0, colCount: 1 })
    })

    void totalCols // suppress unused warning
  })

  return result
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  weekDays: Date[]
  slots: TimekeeperSlot[]
  members: Member[]
  visibleMemberIds: Set<string>
  onDragComplete: (dayIndex: number, startHour: number, endHour: number) => void
  onSlotClick: (slot: TimekeeperSlot) => void
  onSlotDelete: (id: string) => Promise<void>
}

// ─── Component ────────────────────────────────────────────────────────────────
export function WeekGrid({
  weekDays, slots, members, visibleMemberIds,
  onDragComplete, onSlotClick, onSlotDelete,
}: Props) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [gridWidth, setGridWidth] = useState(0)

  // Track container width for fluid column sizing
  useEffect(() => {
    if (!gridRef.current) return
    const obs = new ResizeObserver(([entry]) => setGridWidth(entry.contentRect.width))
    obs.observe(gridRef.current)
    return () => obs.disconnect()
  }, [])

  const dayColW = gridWidth > 0 ? gridWidth / 7 : 120

  const [dragStart,   setDragStart]   = useState<{ day: number; hour: number } | null>(null)
  const [dragCurrent, setDragCurrent] = useState<{ day: number; hour: number } | null>(null)
  const [hoveredKey,  setHoveredKey]  = useState<string | null>(null)

  const memberMap = useMemo(() => new Map(members.map(m => [m.id, m])), [members])

  const slotInstances = useMemo(() =>
    expandSlots(slots, weekDays, memberMap)
      .filter(inst => visibleMemberIds.has(inst.slot.member_id)),
    [slots, weekDays, memberMap, visibleMemberIds],
  )

  const layout = useMemo(() => computeLayout(slotInstances), [slotInstances])

  // Mouse-up finalises drag
  useEffect(() => {
    const up = () => {
      if (dragStart && dragCurrent && dragStart.day === dragCurrent.day) {
        const startHour = Math.min(dragStart.hour, dragCurrent.hour)
        const endHour   = Math.max(dragStart.hour, dragCurrent.hour) + 1
        onDragComplete(dragStart.day, startHour, endHour)
      }
      setDragStart(null)
      setDragCurrent(null)
    }
    window.addEventListener('mouseup', up)
    return () => window.removeEventListener('mouseup', up)
  }, [dragStart, dragCurrent, onDragComplete])

  const isDragSelected = (dayIndex: number, hour: number) => {
    if (!dragStart || !dragCurrent || dragStart.day !== dayIndex) return false
    const lo = Math.min(dragStart.hour, dragCurrent.hour)
    const hi = Math.max(dragStart.hour, dragCurrent.hour)
    return hour >= lo && hour <= hi
  }

  const today = new Date()

  return (
    <div style={{ display: 'flex', userSelect: 'none', width: '100%' }}>
      {/* Time labels */}
      <div style={{ width: TIME_COL_W, flexShrink: 0, paddingTop: HEADER_H }}>
        {HOURS.map(h => (
          <div key={h} style={{
            height: ROW_HEIGHT,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
            paddingRight: 8, paddingTop: 3,
            fontSize: 11, color: 'var(--muted)',
          }}>
            {formatHour(h)}
          </div>
        ))}
      </div>

      {/* Grid area — fills remaining width */}
      <div ref={gridRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>

        {/* Day headers (sticky) */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          position: 'sticky', top: 0, zIndex: 10,
          background: 'var(--bg)', borderBottom: '2px solid var(--border)',
          height: HEADER_H,
        }}>
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, today)
            return (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                borderRight: i < 6 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {format(day, 'EEE')}
                </div>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', marginTop: 1,
                  background: isToday ? 'var(--accent)' : 'transparent',
                  color: isToday ? '#fff' : 'var(--text)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: isToday ? 700 : 400,
                }}>
                  {format(day, 'd')}
                </div>
              </div>
            )
          })}
        </div>

        {/* Background hour cells — full width per day, handles drag */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {HOURS.map(hour =>
            weekDays.map((_, dayIndex) => {
              const isWeekend  = dayIndex >= 5
              const isSelected = isDragSelected(dayIndex, hour)
              return (
                <div
                  key={`${hour}-${dayIndex}`}
                  style={{
                    height: ROW_HEIGHT,
                    borderRight: dayIndex < 6 ? '1px solid var(--border)' : 'none',
                    borderBottom: '1px solid var(--border)',
                    background: isSelected
                      ? 'rgba(99,102,241,0.18)'
                      : isWeekend ? 'rgba(0,0,0,0.025)' : 'transparent',
                    cursor: 'crosshair',
                    transition: 'background 0.04s',
                  }}
                  onMouseDown={e => {
                    e.preventDefault()
                    setDragStart({ day: dayIndex, hour })
                    setDragCurrent({ day: dayIndex, hour })
                  }}
                  onMouseEnter={() => {
                    if (dragStart?.day === dayIndex) setDragCurrent({ day: dayIndex, hour })
                  }}
                />
              )
            })
          )}
        </div>

        {/* Slot blocks — overlap-aware, leave DRAG_STRIP on right of each day */}
        {gridWidth > 0 && slotInstances.map((inst, idx) => {
          const cell    = layout.get(idx) ?? { colIndex: 0, colCount: 1 }
          const color   = inst.member?.avatar_color ?? '#6366f1'
          const isL2    = inst.slot.level === 2
          const key     = `${inst.slot.id}-${idx}`

          const usable  = dayColW - DRAG_STRIP
          const subW    = usable / cell.colCount
          const top     = HEADER_H + (inst.startHour - HOURS_START) * ROW_HEIGHT
          const height  = Math.max((inst.endHour - inst.startHour) * ROW_HEIGHT - 3, 20)
          const left    = inst.dayIndex * dayColW + cell.colIndex * subW + 2
          const width   = subW - 4

          return (
            <div
              key={key}
              style={{
                position: 'absolute',
                top, left, width, height,
                borderRadius: 4,
                background: isL2
                  ? `repeating-linear-gradient(45deg, ${color}bb, ${color}bb 4px, ${color}33 4px, ${color}33 10px)`
                  : `${color}cc`,
                border: `1px solid ${color}`,
                padding: '3px 6px',
                overflow: 'hidden',
                cursor: 'pointer',
                zIndex: 5,
                display: 'flex', flexDirection: 'column', gap: 1,
                opacity: hoveredKey === key ? 0.85 : 1,
                transition: 'opacity 0.1s',
                boxSizing: 'border-box',
              }}
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
              onClick={e => { e.stopPropagation(); onSlotClick(inst.slot) }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: '#fff', lineHeight: '1.3', textShadow: '0 1px 2px rgba(0,0,0,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {inst.slot.title}
              </div>
              {height > 32 && (
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                  {inst.member?.name ?? '—'} · L{inst.slot.level}
                </div>
              )}
              {hoveredKey === key && (
                <button
                  onClick={e => { e.stopPropagation(); onSlotDelete(inst.slot.id) }}
                  style={{
                    position: 'absolute', top: 2, right: 2,
                    background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: 3,
                    color: '#fff', fontSize: 10, cursor: 'pointer', padding: '0 3px',
                    lineHeight: '14px',
                  }}
                >
                  ×
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
