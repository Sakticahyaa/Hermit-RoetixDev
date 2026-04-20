import { AlertCircle } from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { ListView } from '../components/views/ListView'
import { useRoetixDevCtx } from '../context/RoetixDevContext'

export function ListPage() {
  const {
    tasks, tasksLoading, tasksError, filters,
    projects, members,
    reload, editTask, archiveTask, removeTask, updateFilter, clearFilters,
    openNewTask,
  } = useRoetixDevCtx()

  return (
    <>
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
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tasksError && (
          <div style={{ margin: 16, padding: '10px 14px', background: '#ef444415', border: '1px solid #ef444433', borderRadius: 6, fontSize: 12, color: '#ef4444', display: 'flex', gap: 6 }}>
            <AlertCircle size={14} /> {tasksError}
          </div>
        )}
        {tasksLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)', fontSize: 13 }}>
            Loading tasks…
          </div>
        ) : (
          <ListView
            tasks={tasks}
            projects={projects}
            members={members}
            onEdit={editTask}
            onArchive={archiveTask}
            onDelete={removeTask}
          />
        )}
      </div>
    </>
  )
}
