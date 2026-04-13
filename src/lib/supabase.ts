import { createClient } from '@supabase/supabase-js'
import type {
  Task, TaskInsert, TaskUpdate, TaskFilters,
  Project, ProjectInsert, ProjectUpdate,
  Member,
  TaskLog, TaskLogInsert,
  SeerEntry, SeerInsert, SeerUpdate,
  Tenant,
} from '../types'

// ─── Client ───────────────────────────────────────────────────────────────────
const url  = import.meta.env.VITE_SUPABASE_URL  as string
const akey = import.meta.env.VITE_SUPABASE_ANON_KEY as string
export const supabase = createClient(url, akey, {
  auth: { persistSession: false },
})

// ─── Tenant ───────────────────────────────────────────────────────────────────
export async function fetchTenant(slug: string): Promise<Tenant> {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

// ─── Projects ─────────────────────────────────────────────────────────────────
/** Fetch active (non-archived) projects only */
export async function fetchProjects(tenantId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('archived', false)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

/** Fetch all projects including archived — used by ProjectManager */
export async function fetchAllProjects(tenantId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('archived', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createProject(p: ProjectInsert): Promise<Project> {
  const { data, error } = await supabase.from('projects').insert({ ...p, archived: false }).select().single()
  if (error) throw error
  return data
}

export async function updateProject(id: string, p: ProjectUpdate): Promise<Project> {
  const { data, error } = await supabase.from('projects').update(p).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function archiveProject(id: string): Promise<Project> {
  const { data, error } = await supabase
    .from('projects').update({ archived: true }).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function unarchiveProject(id: string): Promise<Project> {
  const { data, error } = await supabase
    .from('projects').update({ archived: false }).eq('id', id).select().single()
  if (error) throw error
  return data
}

/** Hard delete — only used if PM explicitly wants to permanently remove */
export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

// ─── Members ──────────────────────────────────────────────────────────────────
export async function fetchMembers(tenantId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name')
  if (error) throw error
  return data ?? []
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
export async function fetchTasks(tenantId: string, filters: TaskFilters): Promise<Task[]> {
  let q = supabase
    .from('tasks')
    .select('*, project:projects(*), assignee:team_members(*)')
    .eq('tenant_id', tenantId)

  if (filters.project_id)  q = q.eq('project_id', filters.project_id)
  if (filters.assignee_id) q = q.eq('assigned_to', filters.assignee_id)
  if (filters.status)      q = q.eq('status', filters.status)
  if (filters.priority)    q = q.eq('priority', filters.priority)
  if (filters.search)      q = q.ilike('title', `%${filters.search}%`)

  q = q.order('order_index').order('created_at', { ascending: false })

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Task[]
}

export async function createTask(t: Partial<TaskInsert> & { tenant_id: string; title: string }): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ status: 'Unassigned', priority: 3, order_index: 0, ...t })
    .select('*, project:projects(*), assignee:team_members(*)')
    .single()
  if (error) throw error
  return data as Task
}

export async function updateTask(id: string, updates: TaskUpdate): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, project:projects(*), assignee:team_members(*)')
    .single()
  if (error) throw error
  return data as Task
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function reorderTasks(updates: { id: string; order_index: number }[]): Promise<void> {
  await Promise.all(updates.map(u =>
    supabase.from('tasks').update({ order_index: u.order_index }).eq('id', u.id)
  ))
}

// ─── Task Logs ────────────────────────────────────────────────────────────────
export async function fetchTaskLogs(taskId: string): Promise<TaskLog[]> {
  const { data, error } = await supabase
    .from('task_status_history')
    .select('*')
    .eq('task_id', taskId)
    .order('changed_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as TaskLog[]
}

export async function createTaskLog(log: TaskLogInsert): Promise<TaskLog> {
  const { data, error } = await supabase
    .from('task_status_history')
    .insert(log)
    .select()
    .single()
  if (error) throw error
  return data as TaskLog
}

// ─── Seer Entries ─────────────────────────────────────────────────────────────
export async function fetchSeerEntries(tenantId: string): Promise<SeerEntry[]> {
  const { data, error } = await supabase
    .from('seer_entries')
    .select('*, project:projects(*)')
    .eq('tenant_id', tenantId)
    .order('start_date')
    .order('order_index')
  if (error) throw error
  return (data ?? []) as SeerEntry[]
}

export async function createSeerEntry(e: SeerInsert): Promise<SeerEntry> {
  const { data, error } = await supabase
    .from('seer_entries')
    .insert(e)
    .select('*, project:projects(*)')
    .single()
  if (error) throw error
  return data as SeerEntry
}

export async function updateSeerEntry(id: string, updates: SeerUpdate): Promise<SeerEntry> {
  const { data, error } = await supabase
    .from('seer_entries')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, project:projects(*)')
    .single()
  if (error) throw error
  return data as SeerEntry
}

export async function deleteSeerEntry(id: string): Promise<void> {
  const { error } = await supabase.from('seer_entries').delete().eq('id', id)
  if (error) throw error
}
