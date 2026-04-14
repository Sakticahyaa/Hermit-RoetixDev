import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { startOfWeek, addWeeks, addDays, format } from 'date-fns'
import { WeekGrid } from '../components/timekeeper/WeekGrid'
import { SlotForm } from '../components/timekeeper/SlotForm'
import { useTimekeeperSlots } from '../hooks/useTimekeeperSlots'
import { useRoetixDevCtx } from '../context/RoetixDevContext'
import type { TimekeeperSlot, TimekeeperSlotInsert } from '../types'

export function TimekeeperPage() {
  const { tenant, members } = useRoetixDevCtx()
  const { slots, addSlot, editSlot, removeSlot } = useTimekeeperSlots(tenant.id)

  const [weekOffset,      setWeekOffset]      = useState(0)
  const [visibleMembers,  setVisibleMembers]  = useState<Set<string>>(new Set())
  const [editingSlot,     setEditingSlot]     = useState<TimekeeperSlot | null>(null)
  const [draft,           setDraft]           = useState<{ dayIndex: number; startHour: number; endHour: number } | null>(null)

  // Populate visibleMembers once members load (they arrive async from context)
  useEffect(() => {
    if (members.length === 0) return
    setVisibleMembers(prev => prev.size === 0 ? new Set(members.map(m => m.id)) : prev)
  }, [members])

  const weekStart = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 1 })
    return addWeeks(base, weekOffset)
  }, [weekOffset])

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  const weekLabel = `${format(weekDays[0], 'MMM d')} – ${format(weekDays[6], 'MMM d, yyyy')}`

  const toggleMember = (id: string) => {
    setVisibleMembers(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        if (next.size > 1) next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleDragComplete = (dayIndex: number, startHour: number, endHour: number) => {
    setDraft({ dayIndex, startHour, endHour })
  }

  const handleSave = async (data: Omit<TimekeeperSlotInsert, 'tenant_id'>) => {
    if (editingSlot) {
      await editSlot(editingSlot.id, data)
    } else {
      await addSlot(data)
    }
    setEditingSlot(null)
    setDraft(null)
  }

  const handleClose = () => {
    setEditingSlot(null)
    setDraft(null)
  }

  const showForm = !!draft || !!editingSlot

  const btnBase: React.CSSProperties = {
    background: 'none', border: '1px solid var(--border)',
    borderRadius: 5, cursor: 'pointer', color: 'var(--muted)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header bar */}
      <div style={{
        padding: '10px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={15} color="var(--accent)" />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Timekeeper</span>
        </div>

        {/* Week nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => setWeekOffset(w => w - 1)} style={{ ...btnBase, padding: '3px 6px' }}>
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', minWidth: 150, textAlign: 'center' }}>
            {weekLabel}
          </span>
          <button onClick={() => setWeekOffset(w => w + 1)} style={{ ...btnBase, padding: '3px 6px' }}>
            <ChevronRight size={14} />
          </button>
          <button onClick={() => setWeekOffset(0)} style={{ ...btnBase, padding: '3px 8px', fontSize: 11 }}>
            Today
          </button>
        </div>

        {/* Member chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
          {members.map(m => (
            <button
              key={m.id}
              onClick={() => toggleMember(m.id)}
              style={{
                padding: '3px 10px', borderRadius: 20,
                border: `1px solid ${visibleMembers.has(m.id) ? m.avatar_color : 'var(--border)'}`,
                background: visibleMembers.has(m.id) ? m.avatar_color + '22' : 'transparent',
                color: visibleMembers.has(m.id) ? m.avatar_color : 'var(--muted)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.1s',
              }}
            >
              {m.name}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--accent)', borderRadius: 2, opacity: 0.8 }} />
            L1 — Hard unavailable
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}>
            <span style={{
              display: 'inline-block', width: 12, height: 12, borderRadius: 2,
              background: 'repeating-linear-gradient(45deg, var(--accent) 0px, var(--accent) 3px, rgba(99,102,241,0.2) 3px, rgba(99,102,241,0.2) 7px)',
            }} />
            L2 — Reachable
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <WeekGrid
          weekDays={weekDays}
          slots={slots}
          members={members}
          visibleMemberIds={visibleMembers}
          onDragComplete={handleDragComplete}
          onSlotClick={slot => { setEditingSlot(slot); setDraft(null) }}
          onSlotDelete={removeSlot}
        />
      </div>

      {showForm && (
        <SlotForm
          members={members}
          weekDays={weekDays}
          draft={draft}
          editing={editingSlot}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
