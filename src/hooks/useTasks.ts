import { useState, useEffect, useCallback } from 'react'
import {
  fetchTasks, createTask, updateTask, deleteTask, reorderTasks,
  createTaskLog, archiveTask,
} from '../lib/supabase'
import type { Task, TaskInsert, TaskUpdate, TaskFilters, TaskStatus } from '../types'

const defaultFilters: TaskFilters = {
  project_id: null,
  assignee_id: null,
  status: null,
  priority: null,
  search: '',
}

export function useTasks(tenantId: string | undefined, initialFilters?: Partial<TaskFilters>) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TaskFilters>({ ...defaultFilters, ...initialFilters })

  const load = useCallback(async () => {
    if (!tenantId) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTasks(tenantId, filters)
      setTasks(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [tenantId, filters])

  useEffect(() => { load() }, [load])

  const addTask = async (t: Partial<TaskInsert>): Promise<void> => {
    if (!tenantId) return
    const created = await createTask({ ...t, tenant_id: tenantId, title: t.title ?? 'Untitled' })
    // Log initial status
    await createTaskLog({
      task_id: created.id,
      tenant_id: tenantId,
      from_status: null,
      status: created.status,
      notes: null,
      changed_by: 'PM',
    })
    setTasks(prev => [created, ...prev])
  }

  const editTask = async (id: string, updates: TaskUpdate, logNote?: string, changedBy = 'PM'): Promise<void> => {
    const original = tasks.find(t => t.id === id)
    const updated = await updateTask(id, updates)
    // Log status change if status changed
    if (updates.status && original && updates.status !== original.status && tenantId) {
      await createTaskLog({
        task_id: id,
        tenant_id: tenantId,
        from_status: original.status,
        status: updates.status,
        notes: logNote ?? null,
        changed_by: changedBy,
      })
    }
    setTasks(prev => prev.map(t => t.id === id ? updated : t))
  }

  const archTask = async (id: string) => {
    await archiveTask(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const removeTask = async (id: string) => {
    await deleteTask(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const reorder = async (updates: { id: string; order_index: number }[]) => {
    setTasks(prev => {
      const map = new Map(updates.map(u => [u.id, u.order_index]))
      return prev.map(t => map.has(t.id) ? { ...t, order_index: map.get(t.id)! } : t)
    })
    await reorderTasks(updates)
  }

  const updateFilter = <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => setFilters(defaultFilters)

  const getByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status)

  return {
    tasks, loading, error, filters,
    reload: load,
    addTask, editTask, archiveTask: archTask, removeTask, reorder,
    updateFilter, clearFilters,
    getByStatus, setTasks,
  }
}
