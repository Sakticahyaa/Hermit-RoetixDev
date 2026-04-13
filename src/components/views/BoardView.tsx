import { TaskCard } from '../TaskCard'
import { ALL_STATUSES, STATUS_COLORS, STATUS_BG } from '../../types'
import type { Task, Project, Member, TaskInsert, TaskStatus } from '../../types'

interface Props {
  tasks: Task[]
  projects: Project[]
  members: Member[]
  onEdit: (id: string, data: Partial<TaskInsert>, note?: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onNewInStatus: (status: TaskStatus) => void
}

export function BoardView({ tasks, projects, members, onEdit, onDelete, onNewInStatus }: Props) {
  return (
    <div style={{
      display: 'flex', gap: 12, overflowX: 'auto',
      padding: '20px', height: '100%', alignItems: 'flex-start',
    }}>
      {ALL_STATUSES.map(status => {
        const col = tasks.filter(t => t.status === status)
        const color = STATUS_COLORS[status]
        const bg    = STATUS_BG[status]

        return (
          <div key={status} style={{
            minWidth: 260, width: 260, flexShrink: 0,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {/* Column header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: 8,
              background: bg, border: `1px solid ${color}33`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 12, fontWeight: 600, color }}>{status}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  background: `${color}22`, color,
                  borderRadius: 10, padding: '1px 7px',
                }}>
                  {col.length}
                </span>
                <button
                  onClick={() => onNewInStatus(status)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color, fontSize: 16, lineHeight: 1, padding: '0 2px',
                    borderRadius: 4,
                  }}
                  title={`New ${status} task`}
                >+</button>
              </div>
            </div>

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {col.length === 0 ? (
                <div style={{
                  fontSize: 11, color: 'var(--muted)',
                  textAlign: 'center', padding: '16px 8px',
                  border: '1px dashed var(--border)', borderRadius: 8,
                }}>
                  No tasks
                </div>
              ) : (
                col.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    projects={projects}
                    members={members}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
