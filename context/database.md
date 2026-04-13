# Hermit RoetixDev — Database Reference

## Supabase Project
- **Project name**: Hermit (dedicated — separate from Sentry)
- **Project ref**: jdnpgtmouhqymvawdnxp
- **URL**: https://jdnpgtmouhqymvawdnxp.supabase.co
- **Anon key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbnBndG1vdWhxeW12YXdkbnhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjc4NTMsImV4cCI6MjA5MTY0Mzg1M30.vw51X3_dlp9cPbPpu7IaMNp3-lJQxZ5DIr6qGnrXIBQ
- **Tenant slug**: roetixdev
- **Tenant ID**: 6f695f55-a257-4bf1-b999-645618d8711c
- **Region**: ap-northeast-1

## Tables

### tenants
Multi-version support — each Hermit instance is a tenant.
```
id (uuid PK), slug (text unique), name (text), created_at
```
RoetixDev: slug="roetixdev", name="RoetixDev"

### projects
Real app projects (Roetix, Batin, etc.) — not tech layers.
```
id (uuid PK), tenant_id (FK), name (text), color (text), archived (boolean DEFAULT false), created_at
```

### team_members
```
id (uuid PK), tenant_id (FK), name (text), avatar_color (text), created_at
```
Members: Sakti (#ef4444), Bob (#3b82f6), Dzaki (#10b981), Yitzhak (#f59e0b), Bian (#8b5cf6), Grandiv (#ec4899)

### tasks
```
id, tenant_id, project_id, assigned_to, title, description,
status CHECK (Unassigned|Assigned|Ongoing|Developed|Failed|Revision|Passed|Done),
priority (1-5), deadline, estimated_hours, order_index, created_at, updated_at
```

### task_status_history
Log of all status changes — drives the flowchart view.
```
id, task_id, tenant_id, from_status, status, notes, changed_by (default 'PM'), changed_at
```

### seer_entries
Gantt chart data — independent from tasks.
```
id, tenant_id, project_id, task_name, description, start_date, end_date, color, order_index, created_at, updated_at
```

## RLS
Disabled — open access via anon key.

## Bot API Reference

### Update task status
```
PATCH https://jdnpgtmouhqymvawdnxp.supabase.co/rest/v1/tasks?id=eq.<task_id>
Authorization: Bearer <anon_key>
apikey: <anon_key>
Content-Type: application/json
Prefer: return=representation

{"status": "Ongoing", "updated_at": "2026-04-13T00:00:00Z"}
```

### Log the status change (REQUIRED after status update)
```
POST https://jdnpgtmouhqymvawdnxp.supabase.co/rest/v1/task_status_history
Authorization: Bearer <anon_key>
apikey: <anon_key>
Content-Type: application/json

{
  "task_id": "<task_id>",
  "tenant_id": "6f695f55-a257-4bf1-b999-645618d8711c",
  "from_status": "Assigned",
  "status": "Ongoing",
  "notes": "Starting development",
  "changed_by": "bot"
}
```

### Create task
```
POST https://jdnpgtmouhqymvawdnxp.supabase.co/rest/v1/tasks
Authorization: Bearer <anon_key>
apikey: <anon_key>
Content-Type: application/json

{
  "tenant_id": "6f695f55-a257-4bf1-b999-645618d8711c",
  "title": "Task title",
  "status": "Unassigned",
  "priority": 3
}
```

### List tasks
```
GET https://jdnpgtmouhqymvawdnxp.supabase.co/rest/v1/tasks?tenant_id=eq.6f695f55-a257-4bf1-b999-645618d8711c&select=*,project:projects(*),assignee:team_members(*)
Authorization: Bearer <anon_key>
apikey: <anon_key>
```
