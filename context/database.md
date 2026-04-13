# Hermit RoetixDev — Database Reference

## Supabase Project
- **Organization**: Hyke (bcyxvvgjazdusnpwivvo)
- **Project**: Sentry (shared — free tier limit prevents separate project)
- **Project ref**: xbzjykaayibfzzljfxeo
- **URL**: https://xbzjykaayibfzzljfxeo.supabase.co
- **Anon key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhiemp5a2FheWliZnp6bGpmeGVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MTA0NDcsImV4cCI6MjA5MTI4NjQ0N30.1lQgrCwPY4AE8frkXrjxpDFJBDfvK2uu-EVNgHjOlWg
- **Tenant slug**: roetixdev
- **Tenant ID**: 2db20811-c48c-41fe-a5b1-5b5288ac8a0d

## Tables

### tenants
Multi-version support — each Hermit instance is a tenant.
```
id (uuid PK), slug (text unique), name (text), created_at
```
RoetixDev tenant: slug="roetixdev", name="RoetixDev"

### projects
Renamed from "branches" in Sentry.
```
id (uuid PK), tenant_id (FK tenants), name (text), color (text), created_at
```

### team_members
```
id (uuid PK), tenant_id (FK tenants), name (text), avatar_color (text), created_at
```
RoetixDev members: Sakti, Bob, Dzaki, Yitzhak, Bian, Grandiv

### tasks
```
id (uuid PK)
tenant_id (FK tenants CASCADE)
project_id (FK projects SET NULL)
assigned_to (FK team_members SET NULL)
title (text NOT NULL)
description (text)
status (text DEFAULT 'Unassigned')
  CHECK: Unassigned|Assigned|Ongoing|Developed|Failed|Revision|Passed|Done
priority (int 1-5, DEFAULT 3)
deadline (date)
estimated_hours (numeric)
order_index (int DEFAULT 0)
created_at, updated_at
```

### task_status_history
Log of all status changes per task — drives the flowchart view.
```
id (uuid PK)
task_id (FK tasks CASCADE)
tenant_id (FK tenants)
from_status (text, nullable — null on creation)
status (text NOT NULL — the NEW status)
notes (text, optional context)
changed_by (text DEFAULT 'PM' — can be 'bot' for API changes)
changed_at (timestamptz DEFAULT now())
```

### seer_entries
Independent data for the Gantt/Seer page. NOT linked to tasks table.
```
id (uuid PK)
tenant_id (FK tenants)
project_id (FK projects SET NULL)
task_name (text NOT NULL)
description (text)
start_date (date NOT NULL)
end_date (date NOT NULL)
color (text DEFAULT '#6366f1')
order_index (int DEFAULT 0)
created_at, updated_at
```

## RLS
No RLS enabled — app is not authenticated. All reads/writes use anon key.

## Bot API Reference
The Supabase REST API is used by the bot.

### Update task status
```
PATCH https://xbzjykaayibfzzljfxeo.supabase.co/rest/v1/tasks?id=eq.<task_id>
Authorization: Bearer <anon_key>
apikey: <anon_key>
Content-Type: application/json
Prefer: return=representation

{"status": "Ongoing", "updated_at": "2026-04-13T00:00:00Z"}
```

### Log the status change (REQUIRED after updating status)
```
POST https://xbzjykaayibfzzljfxeo.supabase.co/rest/v1/task_status_history
Authorization: Bearer <anon_key>
apikey: <anon_key>
Content-Type: application/json

{
  "task_id": "<task_id>",
  "tenant_id": "2db20811-c48c-41fe-a5b1-5b5288ac8a0d",
  "from_status": "Assigned",
  "status": "Ongoing",
  "notes": "Starting development",
  "changed_by": "bot"
}
```

### Create task via bot
```
POST https://xbzjykaayibfzzljfxeo.supabase.co/rest/v1/tasks
Authorization: Bearer <anon_key>
apikey: <anon_key>
Content-Type: application/json

{
  "tenant_id": "2db20811-c48c-41fe-a5b1-5b5288ac8a0d",
  "title": "Task title",
  "status": "Unassigned",
  "priority": 3
}
```

### List tasks
```
GET https://xbzjykaayibfzzljfxeo.supabase.co/rest/v1/tasks?tenant_id=eq.2db20811-c48c-41fe-a5b1-5b5288ac8a0d&select=*,project:projects(*)
Authorization: Bearer <anon_key>
apikey: <anon_key>
```
