import { Search, Plus, RefreshCw, SlidersHorizontal } from 'lucide-react'
import type { Project, Member, TaskFilters, TaskStatus } from '../types'
import { ALL_STATUSES as STATUSES } from '../types'

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

  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      padding: '10px 20px',
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--surface)',
      flexWrap: 'wrap',
    }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: '0 0 220px' }}>
        <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
        <input
          value={filters.search}
          onChange={e => onFilter('search', e.target.value)}
          placeholder="Search tasks…"
          style={{
            width: '100%', background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '6px 10px 6px 28px', color: 'var(--text)',
            fontSize: 12, outline: 'none',
          }}
        />
      </div>

      {/* Project filter */}
      <select
        value={filters.project_id ?? ''}
        onChange={e => onFilter('project_id', e.target.value || null)}
        style={selectStyle}
      >
        <option value="">All projects</option>
        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      {/* Assignee filter */}
      <select
        value={filters.assignee_id ?? ''}
        onChange={e => onFilter('assignee_id', e.target.value || null)}
        style={selectStyle}
      >
        <option value="">All members</option>
        {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>

      {/* Status filter */}
      <select
        value={filters.status ?? ''}
        onChange={e => onFilter('status', (e.target.value as TaskStatus) || null)}
        style={selectStyle}
      >
        <option value="">All statuses</option>
        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      {/* Priority filter */}
      <select
        value={filters.priority ?? ''}
        onChange={e => onFilter('priority', e.target.value ? Number(e.target.value) : null)}
        style={selectStyle}
      >
        <option value="">All priority</option>
        {[1,2,3,4,5].map(p => <option key={p} value={p}>P{p}</option>)}
      </select>

      {hasActive && (
        <button onClick={onClear} style={{
          ...btnStyle, color: '#f59e0b', borderColor: '#f59e0b33',
        }}>
          <SlidersHorizontal size={12} /> Clear
        </button>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{taskCount} tasks</span>
        <button onClick={onReload} style={{ ...btnStyle, padding: '6px 8px' }} title="Reload">
          <RefreshCw size={13} />
        </button>
        <button onClick={onNew} style={{
          ...btnStyle,
          background: 'var(--accent)', borderColor: 'var(--accent)',
          color: '#fff', gap: 6, fontWeight: 600,
        }}>
          <Plus size={14} /> New Task
        </button>
      </div>
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
  transition: 'all 0.1s',
}
