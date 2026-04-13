import { LayoutDashboard, List, FolderOpen, BarChart2 } from 'lucide-react'
import type { ViewType } from '../types'

interface Props {
  view: ViewType
  onView: (v: ViewType) => void
  onSeer: () => void
  isSeer: boolean
}

const VIEWS: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'board',   label: 'Board',   icon: <LayoutDashboard size={16} /> },
  { id: 'list',    label: 'List',    icon: <List size={16} /> },
  { id: 'project', label: 'Project', icon: <FolderOpen size={16} /> },
]

export function Sidebar({ view, onView, onSeer, isSeer }: Props) {
  return (
    <aside style={{
      width: 200, minWidth: 200,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: '16px 0',
      gap: 4,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 16px 16px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'var(--accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: '#fff',
          }}>H</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Hermit</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: -2 }}>RoetixDev</div>
          </div>
        </div>
      </div>

      {/* Task views */}
      <div style={{ padding: '0 8px' }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', padding: '4px 8px 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Tasks
        </div>
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => onView(v.id)} style={{
            width: '100%', textAlign: 'left', padding: '7px 10px',
            borderRadius: 6, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            background: !isSeer && view === v.id ? 'rgba(99,102,241,0.12)' : 'transparent',
            color: !isSeer && view === v.id ? 'var(--accent)' : 'var(--muted)',
            fontSize: 13, fontWeight: !isSeer && view === v.id ? 600 : 400,
            transition: 'all 0.1s',
          }}>
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      {/* Seer */}
      <div style={{ padding: '8px 8px 0', borderTop: '1px solid var(--border)', marginTop: 8 }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', padding: '4px 8px 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Planning
        </div>
        <button onClick={onSeer} style={{
          width: '100%', textAlign: 'left', padding: '7px 10px',
          borderRadius: 6, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          background: isSeer ? 'rgba(99,102,241,0.12)' : 'transparent',
          color: isSeer ? 'var(--accent)' : 'var(--muted)',
          fontSize: 13, fontWeight: isSeer ? 600 : 400,
          transition: 'all 0.1s',
        }}>
          <BarChart2 size={16} /> Seer
        </button>
      </div>

      {/* Bottom */}
      <div style={{ marginTop: 'auto', padding: '8px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', padding: '4px 10px' }}>
          Hyke · v1.0
        </div>
      </div>
    </aside>
  )
}
