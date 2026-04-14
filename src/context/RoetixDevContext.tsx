import { createContext, useContext } from 'react'
import type {
  Tenant, Project, Member, Task,
  TaskFilters, TaskUpdate, TaskInsert,
  SeerEntry, SeerInsert, SeerUpdate,
  TaskStatus, ProjectUpdate,
} from '../types'

interface AllProjectsHook {
  allProjects: Project[]
  loading: boolean
  addProject: (name: string, color: string) => Promise<Project>
  editProject: (id: string, p: ProjectUpdate) => Promise<Project>
  archive: (id: string) => Promise<Project>
  unarchive: (id: string) => Promise<Project>
  remove: (id: string) => Promise<void>
}

export interface RoetixDevCtx {
  tenant: Tenant
  projects: Project[]
  members: Member[]
  getColor: (projectId: string | null) => string
  // Tasks
  tasks: Task[]
  tasksLoading: boolean
  tasksError: string | null
  filters: TaskFilters
  reload: () => void
  addTask: (data: Partial<TaskInsert>) => Promise<void>
  editTask: (id: string, updates: TaskUpdate, note?: string, by?: string) => Promise<void>
  removeTask: (id: string) => Promise<void>
  updateFilter: <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => void
  clearFilters: () => void
  // Seer
  seerEntries: SeerEntry[]
  addSeerEntry: (data: Omit<SeerInsert, 'tenant_id'>) => Promise<void>
  editSeerEntry: (id: string, updates: SeerUpdate) => Promise<void>
  removeSeerEntry: (id: string) => Promise<void>
  // All projects (for ProjectManager modal)
  allProjectsHook: AllProjectsHook
  // UI actions exposed to child pages
  openNewTask: (status?: TaskStatus) => void
  openProjects: () => void
}

export const RoetixDevContext = createContext<RoetixDevCtx | null>(null)

export function useRoetixDevCtx(): RoetixDevCtx {
  const ctx = useContext(RoetixDevContext)
  if (!ctx) throw new Error('useRoetixDevCtx must be used within RoetixDev layout')
  return ctx
}
