// ─── Tenant (multi-version Hermit support) ────────────────────────────────────
export interface Tenant {
  id: string
  slug: string
  name: string
  created_at: string
}

// ─── Project ──────────────────────────────────────────────────────────────────
export interface Project {
  id: string
  tenant_id: string
  name: string
  color: string
  archived: boolean
  created_at: string
}
export type ProjectInsert = Omit<Project, 'id' | 'created_at'>
export type ProjectUpdate = Partial<Pick<Project, 'name' | 'color' | 'archived'>>

// ─── Team Member ──────────────────────────────────────────────────────────────
export interface Member {
  id: string
  tenant_id: string
  name: string
  avatar_color: string
  created_at: string
}

// ─── Task Status ──────────────────────────────────────────────────────────────
export type TaskStatus =
  | 'Unassigned'
  | 'Assigned'
  | 'Ongoing'
  | 'Developed'
  | 'Failed'
  | 'Revision'
  | 'Passed'
  | 'Done'

export const ALL_STATUSES: TaskStatus[] = [
  'Unassigned', 'Assigned', 'Ongoing', 'Developed',
  'Failed', 'Revision', 'Passed', 'Done',
]

export const STATUS_COLORS: Record<TaskStatus, string> = {
  Unassigned: '#6b7280',
  Assigned:   '#3b82f6',
  Ongoing:    '#f59e0b',
  Developed:  '#8b5cf6',
  Failed:     '#ef4444',
  Revision:   '#f97316',
  Passed:     '#10b981',
  Done:       '#22c55e',
}

export const STATUS_BG: Record<TaskStatus, string> = {
  Unassigned: 'rgba(107,114,128,0.15)',
  Assigned:   'rgba(59,130,246,0.15)',
  Ongoing:    'rgba(245,158,11,0.15)',
  Developed:  'rgba(139,92,246,0.15)',
  Failed:     'rgba(239,68,68,0.15)',
  Revision:   'rgba(249,115,22,0.15)',
  Passed:     'rgba(16,185,129,0.15)',
  Done:       'rgba(34,197,94,0.15)',
}

// ─── Task ─────────────────────────────────────────────────────────────────────
export interface Task {
  id: string
  tenant_id: string
  project_id: string | null
  assigned_to: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: 1 | 2 | 3 | 4 | 5
  deadline: string | null
  estimated_hours: number | null
  order_index: number
  archived: boolean
  created_at: string
  updated_at: string
  // joined
  project?: Project
  assignee?: Member
}

export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at' | 'project' | 'assignee'>
export type TaskUpdate = Partial<Omit<TaskInsert, 'tenant_id'>>

// ─── Task Status Log ──────────────────────────────────────────────────────────
export interface TaskLog {
  id: string
  task_id: string
  tenant_id: string
  from_status: TaskStatus | null
  status: TaskStatus
  notes: string | null
  changed_by: string
  changed_at: string
}

export type TaskLogInsert = Omit<TaskLog, 'id' | 'changed_at'>

// ─── Seer (Gantt) ─────────────────────────────────────────────────────────────
export interface SeerEntry {
  id: string
  tenant_id: string
  project_id: string | null
  task_name: string
  description: string | null
  start_date: string
  end_date: string
  color: string
  order_index: number
  created_at: string
  updated_at: string
  // joined
  project?: Project
}

export type SeerInsert = Omit<SeerEntry, 'id' | 'created_at' | 'updated_at' | 'project'>
export type SeerUpdate = Partial<Omit<SeerInsert, 'tenant_id'>>

// ─── Filters ──────────────────────────────────────────────────────────────────
export interface TaskFilters {
  project_id: string | null
  assignee_id: string | null
  status: TaskStatus | null
  priority: number | null
  search: string
}

export type ViewType = 'board' | 'list' | 'project'

// ─── Timekeeper ───────────────────────────────────────────────────────────────
export interface TimekeeperSlot {
  id: string
  tenant_id: string
  member_id: string
  title: string
  level: 1 | 2
  start_time: string        // ISO 8601 timestamptz
  end_time: string          // ISO 8601 timestamptz
  is_recurring: boolean
  recurrence_type: 'daily' | 'weekly' | null
  recurrence_until: string | null   // 'YYYY-MM-DD'
  notes: string | null
  created_at: string
  // joined
  member?: Member
}

export type TimekeeperSlotInsert = Omit<TimekeeperSlot, 'id' | 'created_at' | 'member'>
export type TimekeeperSlotUpdate = Partial<Omit<TimekeeperSlotInsert, 'tenant_id'>>
