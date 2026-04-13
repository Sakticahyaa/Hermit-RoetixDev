import { TaskCard } from '../TaskCard'
import type { Task, Project, Member, TaskInsert } from '../../types'

interface Props {
  tasks: Task[]
  projects: Project[]
  members: Member[]
  onEdit: (id: string, data: Partial<TaskInsert>, note?: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ProjectView({ tasks, projects, members, onEdit, onDelete }: Props) {
  // Group tasks by project
  const byProject: Record<string, Task[]> = {}
  const unlinked: Task[] = []

  for (const task of tasks) {
    if (task.project_id) {
      byProject[task.project_id] = byProject[task.project_id] ?? []
      byProject[task.project_id].push(task)
    } else {
      unlinked.push(task)
    }
  }

  const groups: { project: Project | null; tasks: Task[] }[] = [
    ...projects
      .filter(p => byProject[p.id]?.length > 0)
      .map(p => ({ project: p, tasks: byProject[p.id] })),
    ...(unlinked.length > 0 ? [{ project: null, tasks: unlinked }] : []),
  ]

  if (groups.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)', fontSize: 13 }}>
        No tasks found.
      </div>
    )
  }

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {groups.map(({ project, tasks: groupTasks }) => {
        const color = project?.color ?? '#6b7280'
        return (
          <div key={project?.id ?? 'unlinked'}>
            {/* Section header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 12, paddingBottom: 10,
              borderBottom: `2px solid ${color}44`,
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}88` }} />
              <span style={{ fontSize: 14, fontWeight: 700, color }}>{project?.name ?? 'No Project'}</span>
              <span style={{
                fontSize: 11, background: `${color}22`, color,
                borderRadius: 10, padding: '1px 8px', fontWeight: 600,
              }}>{groupTasks.length}</span>
            </div>

            {/* Task grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 8,
            }}>
              {groupTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  projects={projects}
                  members={members}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
