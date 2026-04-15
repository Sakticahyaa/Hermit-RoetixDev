import { useState } from 'react'
import { Search, Plus, RefreshCw, SlidersHorizontal, ChevronDown } from 'lucide-react'
import type { Project, Member, TaskFilters, TaskStatus } from '../types'
import { ALL_STATUSES as STATUSES } from '../types'
import { useIsMobile } from '../hooks/useIsMobile'

interface Props {
  filters: TaskFilters
  projects: Project[]
  members: Member[]
  onFilter: <K extends keyof TaskFilters>(k: K, v: TaskFilters[K]) => void
  onClear: () => void
  onNew: () => void
  onReload: () => void
  taskCount: number
}

export function TopBar({ filters, projects, members, onFilter, onClear, onNew, onReload, taskCount }: Props) {
  const hasActive = !!(filters.project_id || filters.assignee_id || filters.status || filters.priority || filters.search)
  const isMobile = useIsMobile()
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
    }}>
      {/* Primary row — always visible */}
      <div style={{
        padding: '8px 14px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            value={filters.search}
            onChange={e => onFilter('search', e.target.value)}
            placeholder="Search tasks…"
            style={{
              width: '100%', background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '6px 10px 6px 28px', color: 'var(--text)',
              fontSize: 12, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {isMobile ? (
          /* Mobile: filter toggle + new task */
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => setFiltersOpen(f => !f)}
              style={{
                ...btnStyle,
                color: hasActive ? 'var(--accent)' : 'var(--muted)',
                borderColor: hasActive ? 'var(--accent)' : 'var(--border)',
              }}
            >
              <SlidersHorizontal size={13} />
              <ChevronDown size={11} style={{ transform: filtersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>
            <button onClick={onNew} style={{ ...btnStyle, background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff', fontWeight: 600 }}>
              <Plus size={14} /> New
            </button>
          </div>
        ) : (
          /* Desktop: all filters inline */
          <>
            <select value={filters.project_id ?? ''} onChange={e => onFilter('project_id', e.target.value || null)} style={selectStyle}>
              <option value="">All projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={filters.assignee_id ?? ''} onChange={e => onFilter('assignee_id', e.target.value || null)} style={selectStyle}>
              <option value="">All members</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select value={filters.status ?? ''} onChange={e => onFilter('status', (e.target.value as TaskStatus) || null)} style={selectStyle}>
              <option value="">All statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters.priority ?? ''} onChange={e => onFilter('priority', e.target.value ? Number(e.target.value) : null)} style={selectStyle}>
              <option value="">All priority</option>
              {[1,2,3,4,5].map(p => <option key={p} value={p}>P{p}</option>)}
            </select>
            {hasActive && (
              <button onClick={onClear} style={{ ...btnStyle, color: '#f59e0b', borderColor: '#f59e0b33' }}>
                <SlidersHorizontal size={12} /> Clear
              </button>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{taskCount} tasks</span>
              <button onClick={onReload} style={{ ...btnStyle, padding: '6px 8px' }} title="Reload">
                <RefreshCw size={13} />
              </button>
              <button onClick={onNew} style={{ ...btnStyle, background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff', gap: 6, fontWeight: 600 }}>
                <Plus size={14} /> New Task
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile filter drawer */}
      {isMobile && filtersOpen && (
        <div style={{ padding: '8px 14px 12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <select value={filters.project_id ?? ''} onChange={e => onFilter('project_id', e.target.value || null)} style={{ ...selectStyle, width: '100%' }}>
            <option value="">All projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={filters.assignee_id ?? ''} onChange={e => onFilter('assignee_id', e.target.value || null)} style={{ ...selectStyle, width: '100%' }}>
            <option value="">All members</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={filters.status ?? ''} onChange={e => onFilter('status', (e.target.value as TaskStatus) || null)} style={{ ...selectStyle, flex: 1 }}>
              <option value="">All statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters.priority ?? ''} onChange={e => onFilter('priority', e.target.value ? Number(e.target.value) : null)} style={{ ...selectStyle, flex: 1 }}>
              <option value="">All priority</option>
              {[1,2,3,4,5].map(p => <option key={p} value={p}>P{p}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{taskCount} tasks</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {hasActive && (
                <button onClick={onClear} style={{ ...btnStyle, color: '#f59e0b', borderColor: '#f59e0b33' }}>
                  <SlidersHorizontal size={12} /> Clear
                </button>
              )}
              <button onClick={onReload} style={{ ...btnStyle, padding: '6px 8px' }} title="Reload">
                <RefreshCw size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  background: 'var(--card)', border: '1px solid var(--border)',
  borderRadius: 6, padding: '6px 8px', color: 'var(--text)',
  fontSize: 12, outline: 'none', cursor: 'pointer',
}

const btnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  background: 'var(--card)', border: '1px solid var(--border)',
  borderRadius: 6, padding: '6px 10px', color: 'var(--muted)',
  fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
  transition: 'all 0.1s', flexShrink: 0,
}
