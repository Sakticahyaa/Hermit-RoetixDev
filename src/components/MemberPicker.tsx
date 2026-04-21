import { HermitCrabIcon } from './ui/HermitCrabIcon'
import { Avatar } from './ui/Avatar'
import type { Member } from '../types'

interface Props {
  members: Member[]
  onPick: (member: Member) => void
}

export function MemberPicker({ members, onPick }: Props) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 32,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HermitCrabIcon size={30} color="#fff" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Who are you?</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Pick your name to continue</div>
        </div>
      </div>

      {/* Member grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 420, padding: '0 20px' }}>
        {members.map(m => (
          <button
            key={m.id}
            onClick={() => onPick(m)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: '16px 20px', borderRadius: 10, cursor: 'pointer',
              background: 'var(--card)', border: '1px solid var(--border)',
              transition: 'all 0.15s', minWidth: 100,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.borderColor = m.avatar_color
              el.style.background = `${m.avatar_color}15`
              el.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.borderColor = 'var(--border)'
              el.style.background = 'var(--card)'
              el.style.transform = 'none'
            }}
          >
            <Avatar name={m.name} color={m.avatar_color} size={40} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{m.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
