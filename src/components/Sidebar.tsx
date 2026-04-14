import { NavLink } from 'react-router-dom'
import { LayoutDashboard, List, FolderOpen, BarChart2, Clock, Settings2, Sun, Moon } from 'lucide-react'
import type { CSSProperties } from 'react'
import { HermitCrabIcon } from './ui/HermitCrabIcon'
import { useTheme } from '../hooks/useTheme'

const navStyle = (isActive: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '7px 10px',
  borderRadius: 6,
  textDecoration: 'none',
  fontSize: 13,
  fontWeight: isActive ? 600 : 400,
  color: isActive ? 'var(--accent)' : 'var(--muted)',
  background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
  transition: 'all 0.1s',
  cursor: 'pointer',
})

interface Props {
  onManageProjects: () => void
}

export function Sidebar({ onManageProjects }: Props) {
  const { theme, toggle } = useTheme()

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
          }}>
            <HermitCrabIcon size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Hermit</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: -2 }}>RoetixDev</div>
          </div>
        </div>
      </div>

      {/* Tasks section */}
      <div style={{ padding: '0 8px' }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', padding: '4px 8px 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Tasks
        </div>
        <NavLink to="/RoetixDev/board" style={({ isActive }) => navStyle(isActive)}>
          <LayoutDashboard size={16} /> Board
        </NavLink>
        <NavLink to="/RoetixDev/list" style={({ isActive }) => navStyle(isActive)}>
          <List size={16} /> List
        </NavLink>
        <NavLink to="/RoetixDev/project" style={({ isActive }) => navStyle(isActive)}>
          <FolderOpen size={16} /> Project
        </NavLink>
        <button onClick={onManageProjects} style={{
          width: '100%', textAlign: 'left', padding: '5px 10px',
          borderRadius: 6, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'transparent', color: 'var(--muted)',
          fontSize: 11, marginTop: 4,
        }}>
          <Settings2 size={13} /> Manage Projects
        </button>
      </div>

      {/* Planning section */}
      <div style={{ padding: '8px 8px 0', borderTop: '1px solid var(--border)', marginTop: 8 }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', padding: '4px 8px 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Planning
        </div>
        <NavLink to="/RoetixDev/seer" style={({ isActive }) => navStyle(isActive)}>
          <BarChart2 size={16} /> Seer
        </NavLink>
      </div>

      {/* Team section */}
      <div style={{ padding: '8px 8px 0', borderTop: '1px solid var(--border)', marginTop: 8 }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', padding: '4px 8px 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Team
        </div>
        <NavLink to="/RoetixDev/timekeeper" style={({ isActive }) => navStyle(isActive)}>
          <Clock size={16} /> Timekeeper
        </NavLink>
      </div>

      {/* Bottom */}
      <div style={{ marginTop: 'auto', padding: '8px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', padding: '4px 10px' }}>
          Hyke · v1.0
        </div>
        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 6, padding: '4px 6px', cursor: 'pointer',
            color: 'var(--muted)', display: 'flex', alignItems: 'center',
            transition: 'all 0.1s',
          }}
        >
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      </div>
    </aside>
  )
}
