import { useState } from 'react'
import { FolderOpen, AlertCircle } from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { Sidebar } from '../components/Sidebar'
import { BoardView } from '../components/views/BoardView'
import { ListView } from '../components/views/ListView'
import { ProjectView } from '../components/views/ProjectView'
import { TaskForm } from '../components/TaskForm'
import { ProjectManager } from '../components/ProjectManager'
import { GanttChart } from '../components/seer/GanttChart'
import { useTenant } from '../hooks/useTenant'
import { useProjects, useAllProjects, ProjectsContext } from '../hooks/useProjects'
import { useMembers } from '../hooks/useMembers'
import { useTasks } from '../hooks/useTasks'
import { useSeerEntries } from '../hooks/useSeerEntries'
import type { ViewType, TaskStatus, Project } from '../types'

export function RoetixDev() {
  const { tenant, loading: tenantLoading } = useTenant()

  // Active projects — used everywhere in the app
  const { projects, removeFromActive, addToActive, getColor } = useProjects(tenant?.id)
  // All projects (active + archived) — only loaded inside ProjectManager
  const allProjectsHook = useAllProjects(tenant?.id)

  const { members } = useMembers(tenant?.id)
  const { entries, addEntry, editEntry, removeEntry } = useSeerEntries(tenant?.id)
  const {
    tasks, loading, error, filters,
    reload, addTask, editTask, removeTask,
    updateFilter, clearFilters,
  } = useTasks(tenant?.id)

  const [view, setView]               = useState<ViewType>('board')
  const [isSeer, setIsSeer]           = useState(false)
  const [showNewTask, setShowNewTask] = useState(false)
  const [newInitStatus, setNewInit]   = useState<TaskStatus>('Unassigned')
  const [showProjects, setShowProj]   = useState(false)

  const openNewTask = (status: TaskStatus = 'Unassigned') => {
    setNewInit(status)
    setShowNewTask(true)
  }

  // Sync active projects list when ProjectManager archives/unarchives
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

  return (
    <ProjectsContext.Provider value={{ projects, getColor }}>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar
          view={view}
          onView={v => { setView(v); setIsSeer(false) }}
          onSeer={() => setIsSeer(true)}
          isSeer={isSeer}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!isSeer && (
            <>
              <div style={{
                padding: '8px 20px', borderBottom: '1px solid var(--border)',
                background: 'var(--bg)', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                  RoetixDev · Task Manager
                </span>
                <button onClick={() => setShowProj(true)} style={{
                  marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
                  background: 'none', border: '1px solid var(--border)',
                  borderRadius: 5, padding: '4px 10px', color: 'var(--muted)',
                  fontSize: 11, cursor: 'pointer',
                }}>
                  <FolderOpen size={11} /> Manage Projects
                </button>
              </div>

              <TopBar
                filters={filters}
                projects={projects}
                members={members}
                onFilter={updateFilter}
                onClear={clearFilters}
                onNew={() => openNewTask()}
                onReload={reload}
                taskCount={tasks.length}
              />
            </>
          )}

          <div style={{ flex: 1, overflow: 'auto' }}>
            {error && (
              <div style={{ margin: 16, padding: '10px 14px', background: '#ef444415', border: '1px solid #ef444433', borderRadius: 6, fontSize: 12, color: '#ef4444', display: 'flex', gap: 6 }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {isSeer ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <GanttChart
                  entries={entries}
                  projects={projects}
                  onAdd={addEntry}
                  onEdit={editEntry}
                  onDelete={removeEntry}
                />
              </div>
            ) : loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)', fontSize: 13 }}>
                Loading tasks…
              </div>
            ) : view === 'board' ? (
              <BoardView
                tasks={tasks}
                projects={projects}
                members={members}
                onEdit={editTask}
                onDelete={removeTask}
                onNewInStatus={openNewTask}
              />
            ) : view === 'list' ? (
              <ListView
                tasks={tasks}
                projects={projects}
                members={members}
                onEdit={editTask}
                onDelete={removeTask}
              />
            ) : (
              <ProjectView
                tasks={tasks}
                projects={projects}
                members={members}
                onEdit={editTask}
                onDelete={removeTask}
              />
            )}
          </div>
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
          onClose={() => setShowProj(false)}
          onActiveListChange={handleActiveListChange}
        />
      )}
    </ProjectsContext.Provider>
  )
}
