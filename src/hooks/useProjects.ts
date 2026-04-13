import { useState, useEffect, createContext, useContext } from 'react'
import {
  fetchProjects, fetchAllProjects,
  createProject, updateProject, archiveProject, unarchiveProject, deleteProject,
} from '../lib/supabase'
import type { Project, ProjectInsert, ProjectUpdate } from '../types'

/** Active projects only — used everywhere except ProjectManager */
export function useProjects(tenantId: string | undefined) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    fetchProjects(tenantId)
      .then(setProjects)
      .finally(() => setLoading(false))
  }, [tenantId])

  const addProject = async (p: Omit<ProjectInsert, 'tenant_id' | 'archived'>) => {
    if (!tenantId) return
    const created = await createProject({ ...p, tenant_id: tenantId, archived: false })
    setProjects(prev => [...prev, created])
  }

  const editProject = async (id: string, p: ProjectUpdate) => {
    const updated = await updateProject(id, p)
    // If it got archived, remove from active list
    if (updated.archived) {
      setProjects(prev => prev.filter(x => x.id !== id))
    } else {
      setProjects(prev => prev.map(x => x.id === id ? updated : x))
    }
  }

  // Called when ProjectManager archives a project — sync active list
  const removeFromActive = (id: string) => {
    setProjects(prev => prev.filter(x => x.id !== id))
  }

  // Called when ProjectManager unarchives — add back to active list
  const addToActive = (project: Project) => {
    setProjects(prev => [...prev, project].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ))
  }

  const getColor = (projectId: string | null): string => {
    if (!projectId) return '#6b7280'
    return projects.find(p => p.id === projectId)?.color ?? '#6b7280'
  }

  return { projects, loading, addProject, editProject, removeFromActive, addToActive, getColor }
}

/** All projects including archived — used inside ProjectManager */
export function useAllProjects(tenantId: string | undefined) {
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const reload = () => {
    if (!tenantId) return
    setLoading(true)
    fetchAllProjects(tenantId)
      .then(setAllProjects)
      .finally(() => setLoading(false))
  }

  useEffect(() => { reload() }, [tenantId])

  const addProject = async (name: string, color: string): Promise<Project> => {
    if (!tenantId) throw new Error('No tenant')
    const created = await createProject({ name, color, tenant_id: tenantId, archived: false })
    setAllProjects(prev => [...prev, created])
    return created
  }

  const editProject = async (id: string, p: ProjectUpdate): Promise<Project> => {
    const updated = await updateProject(id, p)
    setAllProjects(prev => prev.map(x => x.id === id ? updated : x))
    return updated
  }

  const archive = async (id: string): Promise<Project> => {
    const updated = await archiveProject(id)
    setAllProjects(prev => prev.map(x => x.id === id ? updated : x))
    return updated
  }

  const unarchive = async (id: string): Promise<Project> => {
    const updated = await unarchiveProject(id)
    setAllProjects(prev => prev.map(x => x.id === id ? updated : x))
    return updated
  }

  const remove = async (id: string) => {
    await deleteProject(id)
    setAllProjects(prev => prev.filter(x => x.id !== id))
  }

  return { allProjects, loading, addProject, editProject, archive, unarchive, remove }
}

// Context — active projects only
interface ProjectsCtx {
  projects: Project[]
  getColor: (id: string | null) => string
}
export const ProjectsContext = createContext<ProjectsCtx>({ projects: [], getColor: () => '#6b7280' })
export const useProjectsCtx = () => useContext(ProjectsContext)
