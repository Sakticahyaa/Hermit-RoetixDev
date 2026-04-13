import { useState, useEffect, createContext, useContext } from 'react'
import { fetchProjects, createProject, updateProject, deleteProject } from '../lib/supabase'
import type { Project, ProjectInsert, ProjectUpdate } from '../types'

export function useProjects(tenantId: string | undefined) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    fetchProjects(tenantId)
      .then(setProjects)
      .finally(() => setLoading(false))
  }, [tenantId])

  const addProject = async (p: Omit<ProjectInsert, 'tenant_id'>) => {
    if (!tenantId) return
    const created = await createProject({ ...p, tenant_id: tenantId })
    setProjects(prev => [...prev, created])
  }

  const editProject = async (id: string, p: ProjectUpdate) => {
    const updated = await updateProject(id, p)
    setProjects(prev => prev.map(x => x.id === id ? updated : x))
  }

  const removeProject = async (id: string) => {
    await deleteProject(id)
    setProjects(prev => prev.filter(x => x.id !== id))
  }

  const getColor = (projectId: string | null): string => {
    if (!projectId) return '#6b7280'
    return projects.find(p => p.id === projectId)?.color ?? '#6b7280'
  }

  return { projects, loading, addProject, editProject, removeProject, getColor }
}

// Context
interface ProjectsCtx {
  projects: Project[]
  getColor: (id: string | null) => string
}
export const ProjectsContext = createContext<ProjectsCtx>({ projects: [], getColor: () => '#6b7280' })
export const useProjectsCtx = () => useContext(ProjectsContext)
