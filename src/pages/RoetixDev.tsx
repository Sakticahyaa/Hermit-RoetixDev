import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AlertCircle, Menu } from 'lucide-react'
import { Sidebar } from '../components/Sidebar'
import { HermitCrabIcon } from '../components/ui/HermitCrabIcon'
import { useIsMobile } from '../hooks/useIsMobile'
import { TaskForm } from '../components/TaskForm'
import { ProjectManager } from '../components/ProjectManager'
import { useTenant } from '../hooks/useTenant'
import { useProjects, useAllProjects, ProjectsContext } from '../hooks/useProjects'
import { useMembers } from '../hooks/useMembers'
import { useTasks } from '../hooks/useTasks'
import { useSeerEntries } from '../hooks/useSeerEntries'
import { RoetixDevContext } from '../context/RoetixDevContext'
import type { TaskStatus, Project } from '../types'

export function RoetixDev() {
  const { tenant, loading: tenantLoading } = useTenant()

  const { projects, removeFromActive, addToActive, getColor } = useProjects(tenant?.id)
  const allProjectsHook = useAllProjects(tenant?.id)
  const { members } = useMembers(tenant?.id)
  const { entries, addEntry, editEntry, removeEntry } = useSeerEntries(tenant?.id)
  const {
    tasks, loading, error, filters,
    reload, addTask, editTask, removeTask,
    updateFilter, clearFilters,
  } = useTasks(tenant?.id)

  const [showNewTask, setShowNewTask]   = useState(false)
  const [newInitStatus, setNewInit]     = useState<TaskStatus>('Unassigned')
  const [showProjects, setShowProjects] = useState(false)
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const isMobile = useIsMobile()

  const openNewTask = (status: TaskStatus = 'Unassigned') => {
    setNewInit(status)
    setShowNewTask(true)
  }

  const handleActiveListChange = (project: Project, action: 'archive' | 'unarchive') => {
    if (action === 'archive') removeFromActive(project.id)
    else addToActive(project)
  }

  if (tenantLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--muted)', fontSize: 14 }}>
        Loading Hermit…
      </div>
    )
  }

  if (!tenant) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12 }}>
        <AlertCircle size={32} color="#ef4444" />
        <div style={{ color: '#ef4444', fontSize: 14 }}>Could not load RoetixDev workspace.</div>
      </div>
    )
  }

  const ctx = {
    tenant,
    projects,
    members,
    getColor,
    tasks,
    tasksLoading: loading,
    tasksError: error,
    filters,
    reload,
    addTask,
    editTask,
    removeTask,
    updateFilter,
    clearFilters,
    seerEntries: entries,
    addSeerEntry: addEntry,
    editSeerEntry: editEntry,
    removeSeerEntry: removeEntry,
    allProjectsHook,
    openNewTask,
    openProjects: () => setShowProjects(true),
  }

  return (
    <RoetixDevContext.Provider value={ctx}>
      <ProjectsContext.Provider value={{ projects, getColor }}>
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          {/* Mobile top bar */}
          {isMobile && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30,
              height: 48, background: 'var(--surface)', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
            }}>
              <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', display: 'flex', padding: 4 }}>
                <Menu size={20} />
              </button>
              <HermitCrabIcon size={20} color="var(--accent)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Hermit</span>
            </div>
          )}

          {/* Sidebar */}
          <Sidebar
            onManageProjects={() => setShowProjects(true)}
            mobileOpen={sidebarOpen}
            onMobileClose={() => setSidebarOpen(false)}
          />

          {/* Mobile sidebar backdrop */}
          {isMobile && sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 39 }}
            />
          )}

          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
            marginTop: isMobile ? 48 : 0,
          }}>
            <Outlet />
          </div>
        </div>

        {showNewTask && (
          <TaskForm
            projects={projects}
            members={members}
            onSave={(data) => addTask({ ...data, status: newInitStatus })}
            onClose={() => setShowNewTask(false)}
          />
        )}

        {showProjects && (
          <ProjectManager
            allProjects={allProjectsHook.allProjects}
            onAdd={allProjectsHook.addProject}
            onEdit={(id, name, color) => allProjectsHook.editProject(id, { name, color })}
            onArchive={allProjectsHook.archive}
            onUnarchive={allProjectsHook.unarchive}
            onDelete={allProjectsHook.remove}
            onClose={() => setShowProjects(false)}
            onActiveListChange={handleActiveListChange}
          />
        )}
      </ProjectsContext.Provider>
    </RoetixDevContext.Provider>
  )
}
