# Hermit RoetixDev — Architecture & File Map

## Tech Stack
- **Framework**: React 19 + TypeScript
- **Build**: Vite 6
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v3 + CSS variables
- **Routing**: react-router-dom v7
- **Icons**: lucide-react
- **Date utils**: date-fns
- **DnD**: @dnd-kit (available, not yet implemented)

## File Structure
```
src/
├── types/index.ts          — All TypeScript interfaces and constants
│                             Exports: Tenant, Project, Member, Task, TaskLog,
│                             SeerEntry, TaskStatus, ALL_STATUSES, STATUS_COLORS, etc.
├── lib/supabase.ts         — Supabase client + ALL database operations
│                             fetchTenant, fetchProjects, fetchTasks, createTaskLog, etc.
├── hooks/
│   ├── useTenant.ts        — Load tenant by VITE_TENANT_SLUG
│   ├── useProjects.ts      — CRUD for projects + ProjectsContext
│   ├── useMembers.ts       — Load team members
│   ├── useTasks.ts         — CRUD for tasks, auto-logs status changes
│   ├── useTaskLogs.ts      — Load status history for a single task
│   └── useSeerEntries.ts   — CRUD for Gantt entries
├── components/
│   ├── ui/
│   │   ├── StatusBadge.tsx  — Colored status pill with bg
│   │   ├── PriorityDot.tsx  — Colored dot + optional label
│   │   └── Avatar.tsx       — Initial-based avatar circle
│   ├── views/
│   │   ├── BoardView.tsx    — Kanban (8 status columns)
│   │   ├── ListView.tsx     — Table view of all tasks
│   │   └── ProjectView.tsx  — Tasks grouped by project
│   ├── seer/
│   │   ├── GanttChart.tsx   — Horizontal timeline gantt
│   │   └── SeerForm.tsx     — Add/edit seer entry modal
│   ├── Sidebar.tsx          — Left nav (Board/List/Project/Seer)
│   ├── TopBar.tsx           — Filters bar + search + new task button
│   ├── TaskCard.tsx         — Single task card (used in Board + Project)
│   ├── TaskForm.tsx         — Create/edit task modal with status log note
│   ├── TaskLogModal.tsx     — Flowchart/history of status changes
│   └── ProjectManager.tsx   — CRUD modal for projects
├── pages/
│   └── RoetixDev.tsx       — Main page, composes all hooks + views
├── App.tsx                  — Router: /RoetixDev → RoetixDev, * → redirect
├── main.tsx                 — React root mount
└── index.css               — CSS variables + global styles + animations

context/                    — Second brain files (this folder)
public/                     — Static assets
```

## State Architecture
```
RoetixDev.tsx (page)
├── useTenant()              — tenant (loaded once)
├── useProjects(tenant.id)   — projects list + CRUD
├── useMembers(tenant.id)    — members list (read-only)
├── useTasks(tenant.id)      — tasks + filters + CRUD (auto-logs status changes)
└── useSeerEntries(tenant.id) — gantt entries + CRUD

ProjectsContext (context)   — passes projects + getColor() down to cards
```

## Status Change Flow
1. User opens TaskForm and changes status
2. TaskForm captures `logNote` if status changed
3. On save: `editTask(id, updates, logNote)` is called
4. `useTasks.editTask()` calls `updateTask()` + `createTaskLog()` automatically
5. TaskLogModal reads `task_status_history` to show flowchart

## Seer (Gantt) Architecture
- Completely independent data from tasks
- `seer_entries` table has its own project_id FK
- GanttChart computes visible date range from entry dates
- Today line shown in indigo
- Weekends are shaded
- Sticky label column + scrollable chart area

## Environment Variables
```
VITE_SUPABASE_URL    = https://xbzjykaayibfzzljfxeo.supabase.co
VITE_SUPABASE_ANON_KEY = eyJ...
VITE_TENANT_SLUG    = roetixdev
```
