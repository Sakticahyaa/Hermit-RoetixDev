import { NavLink } from 'react-router-dom'
import { LayoutDashboard, List, FolderOpen, BarChart2, Clock, Settings2, Sun, Moon, X, Archive, RefreshCw } from 'lucide-react'
import type { CSSProperties } from 'react'
import { HermitCrabIcon } from './ui/HermitCrabIcon'
import { Avatar } from './ui/Avatar'
import { useTheme } from '../hooks/useTheme'
import { useIsMobile } from '../hooks/useIsMobile'
import { useRoetixDevCtx } from '../context/RoetixDevContext'

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
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ onManageProjects, mobileOpen = false, onMobileClose }: Props) {
  const { theme, toggle } = useTheme()
  const isMobile = useIsMobile()
  const { currentMember, clearMember } = useRoetixDevCtx()

  const sidebarStyle: CSSProperties = isMobile
    ? {
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40,
        width: 220, minWidth: 220,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '16px 0', gap: 4,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
        boxShadow: mobileOpen ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
      }
    : {
        width: 200, minWidth: 200,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '16px 0', gap: 4,
      }

  const handleNavClick = () => {
    if (isMobile && onMobileClose) onMobileClose()
  }

  return (
    <aside style={sidebarStyle}>
      {/* Logo */}
      <div style={{ padding: '0 16px 16px', borderBottom: '1px solid var(--border)', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
        {isMobile && (
          <button onClick={onMobileClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 4 }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Tasks section */}
      <div style={{ padding: '0 8px' }} onClick={handleNavClick}>
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
        <NavLink to="/RoetixDev/archived" style={({ isActive }) => navStyle(isActive)}>
          <Archive size={16} /> Archived
        </NavLink>
        <button onClick={() => { onManageProjects(); handleNavClick() }} style={{
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
      <div style={{ padding: '8px 8px 0', borderTop: '1px solid var(--border)', marginTop: 8 }} onClick={handleNavClick}>
        <div style={{ fontSize: 10, color: 'var(--muted)', padding: '4px 8px 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Planning
        </div>
        <NavLink to="/RoetixDev/seer" style={({ isActive }) => navStyle(isActive)}>
          <BarChart2 size={16} /> Seer
        </NavLink>
      </div>

      {/* Team section */}
      <div style={{ padding: '8px 8px 0', borderTop: '1px solid var(--border)', marginTop: 8 }} onClick={handleNavClick}>
        <div style={{ fontSize: 10, color: 'var(--muted)', padding: '4px 8px 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Team
        </div>
        <NavLink to="/RoetixDev/timekeeper" style={({ isActive }) => navStyle(isActive)}>
          <Clock size={16} /> Timekeeper
        </NavLink>
      </div>

      {/* Bottom */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)' }}>
        {/* Current member */}
        {currentMember && (
          <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar name={currentMember.name} color={currentMember.avatar_color} size={26} />
            <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentMember.name}
            </span>
            <button
              onClick={clearMember}
              title="Switch user"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 2, borderRadius: 4 }}
            >
              <RefreshCw size={12} />
            </button>
          </div>
        )}
        <div style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
      </div>
    </aside>
  )
}
