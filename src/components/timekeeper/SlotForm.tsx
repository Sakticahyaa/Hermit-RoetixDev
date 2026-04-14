import { useState } from 'react'
import { format, set as setDate, addHours } from 'date-fns'
import { X } from 'lucide-react'
import type { Member, TimekeeperSlot, TimekeeperSlotInsert } from '../../types'

interface Props {
  members: Member[]
  weekDays: Date[]
  draft: { dayIndex: number; startHour: number; endHour: number } | null
  editing: TimekeeperSlot | null
  onSave: (data: Omit<TimekeeperSlotInsert, 'tenant_id'>) => Promise<void>
  onClose: () => void
}

function toLocalInput(iso: string): string {
  // Convert ISO to "YYYY-MM-DDTHH:MM" for datetime-local input
  const d = new Date(iso)
  return format(d, "yyyy-MM-dd'T'HH:mm")
}

export function SlotForm({ members, weekDays, draft, editing, onSave, onClose }: Props) {
  const defaultMemberId = members[0]?.id ?? ''

  const getInit = () => {
    if (editing) {
      return {
        memberId:        editing.member_id,
        title:           editing.title,
        level:           editing.level as 1 | 2,
        startTime:       toLocalInput(editing.start_time),
        endTime:         toLocalInput(editing.end_time),
        isRecurring:     editing.is_recurring,
        recurrenceType:  (editing.recurrence_type ?? 'weekly') as 'daily' | 'weekly',
        recurrenceUntil: editing.recurrence_until ?? '',
        notes:           editing.notes ?? '',
      }
    }
    if (draft) {
      const day   = weekDays[draft.dayIndex]
      const start = setDate(day, { hours: draft.startHour, minutes: 0, seconds: 0, milliseconds: 0 })
      const end   = setDate(day, { hours: draft.endHour,   minutes: 0, seconds: 0, milliseconds: 0 })
      return {
        memberId:        defaultMemberId,
        title:           '',
        level:           1 as 1 | 2,
        startTime:       format(start, "yyyy-MM-dd'T'HH:mm"),
        endTime:         format(end,   "yyyy-MM-dd'T'HH:mm"),
        isRecurring:     false,
        recurrenceType:  'weekly' as 'daily' | 'weekly',
        recurrenceUntil: '',
        notes:           '',
      }
    }
    const now = new Date()
    return {
      memberId:        defaultMemberId,
      title:           '',
      level:           1 as 1 | 2,
      startTime:       format(now,                "yyyy-MM-dd'T'HH:mm"),
      endTime:         format(addHours(now, 1),   "yyyy-MM-dd'T'HH:mm"),
      isRecurring:     false,
      recurrenceType:  'weekly' as 'daily' | 'weekly',
      recurrenceUntil: '',
      notes:           '',
    }
  }

  const init = getInit()
  const [memberId,        setMemberId]        = useState(init.memberId)
  const [title,           setTitle]           = useState(init.title)
  const [level,           setLevel]           = useState<1 | 2>(init.level)
  const [startTime,       setStartTime]       = useState(init.startTime)
  const [endTime,         setEndTime]         = useState(init.endTime)
  const [isRecurring,     setIsRecurring]     = useState(init.isRecurring)
  const [recurrenceType,  setRecurrenceType]  = useState<'daily' | 'weekly'>(init.recurrenceType)
  const [recurrenceUntil, setRecurrenceUntil] = useState(init.recurrenceUntil)
  const [notes,           setNotes]           = useState(init.notes)
  const [saving,          setSaving]          = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !memberId || !startTime || !endTime) return
    setSaving(true)
    try {
      await onSave({
        member_id:        memberId,
        title:            title.trim(),
        level,
        start_time:       new Date(startTime).toISOString(),
        end_time:         new Date(endTime).toISOString(),
        is_recurring:     isRecurring,
        recurrence_type:  isRecurring ? recurrenceType : null,
        recurrence_until: isRecurring && recurrenceUntil ? recurrenceUntil : null,
        notes:            notes.trim() || null,
      })
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '6px 9px',
    background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 5, color: 'var(--text)', fontSize: 13,
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4,
  }

  const selectedMember = members.find(m => m.id === memberId)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50,
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 10,
        border: '1px solid var(--border)',
        width: 440, maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
            {editing ? 'Edit Busy Slot' : 'Add Busy Slot'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Member */}
          <div>
            <label style={labelStyle}>Team Member</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {members.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMemberId(m.id)}
                  style={{
                    padding: '4px 12px', borderRadius: 20,
                    border: `1px solid ${memberId === m.id ? m.avatar_color : 'var(--border)'}`,
                    background: memberId === m.id ? m.avatar_color + '22' : 'transparent',
                    color: memberId === m.id ? m.avatar_color : 'var(--muted)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={labelStyle}>Reason / Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Sprint review, Client call, OOO"
              required
              style={inputStyle}
            />
          </div>

          {/* Level */}
          <div>
            <label style={labelStyle}>Busy Level</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {([1, 2] as const).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  style={{
                    flex: 1, padding: '7px 0', borderRadius: 6,
                    border: `1px solid ${level === l ? (selectedMember?.avatar_color ?? 'var(--accent)') : 'var(--border)'}`,
                    background: level === l ? (selectedMember?.avatar_color ?? 'var(--accent)') + '22' : 'transparent',
                    color: level === l ? (selectedMember?.avatar_color ?? 'var(--accent)') : 'var(--muted)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  }}
                >
                  <span>L{l}</span>
                  <span style={{ fontSize: 10, fontWeight: 400 }}>
                    {l === 1 ? 'Hard unavailable' : 'Reachable'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Times */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Start</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>End</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Recurring */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text)' }}>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
                style={{ accentColor: 'var(--accent)', width: 14, height: 14 }}
              />
              Recurring slot
            </label>

            {isRecurring && (
              <div style={{ marginTop: 10, display: 'flex', gap: 10, paddingLeft: 22 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Repeat</label>
                  <select
                    value={recurrenceType}
                    onChange={e => setRecurrenceType(e.target.value as 'daily' | 'weekly')}
                    style={{ ...inputStyle }}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Until</label>
                  <input
                    type="date"
                    value={recurrenceUntil}
                    onChange={e => setRecurrenceUntil(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Any additional context…"
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              padding: '7px 16px', borderRadius: 6,
              border: '1px solid var(--border)', background: 'none',
              color: 'var(--muted)', fontSize: 13, cursor: 'pointer',
            }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim() || !memberId}
              style={{
                padding: '7px 16px', borderRadius: 6,
                background: 'var(--accent)', border: 'none',
                color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Saving…' : editing ? 'Update' : 'Save Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
