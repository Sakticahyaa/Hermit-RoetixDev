# Hermit RoetixDev — Bot API Reference

All operations go through the Supabase REST API. No auth beyond the anon key required (RLS is disabled).

## Constants

```
BASE_URL   = https://jdnpgtmouhqymvawdnxp.supabase.co/rest/v1
ANON_KEY   = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbnBndG1vdWhxeW12YXdkbnhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjc4NTMsImV4cCI6MjA5MTY0Mzg1M30.vw51X3_dlp9cPbPpu7IaMNp3-lJQxZ5DIr6qGnrXIBQ
TENANT_ID  = 6f695f55-a257-4bf1-b999-645618d8711c
```

## Auth headers (every request)

```
Authorization: Bearer <ANON_KEY>
apikey: <ANON_KEY>
Content-Type: application/json
```

## Member IDs

| Name    | ID                                   |
|---------|--------------------------------------|
| Sakti   | 98516d9f-3205-41ac-a527-2f39e6f50177 |
| Bob     | 820e92e7-a7fa-4954-bd33-d1a860917514 |
| Dzaki   | 27e5d826-1f8c-4748-9467-643377fab449 |
| Yitzhak | 0b4203db-02cc-4a04-af0e-0373745a7efc |
| Bian    | 69be5e17-dfbc-4c6c-846e-decd785b1ae2 |
| Grandiv | 7497430e-719b-4b28-b19f-c0632d686da5 |

---

## Tasks

### List all tasks
```
GET /tasks?tenant_id=eq.<TENANT_ID>&select=*,project:projects(*),assignee:team_members(*)
```

### List by status
```
GET /tasks?tenant_id=eq.<TENANT_ID>&status=eq.Ongoing&select=*
```

### Create task
```
POST /tasks
{
  "tenant_id": "<TENANT_ID>",
  "title": "Task title",
  "status": "Unassigned",
  "priority": 3,                        // 1 (low) – 5 (critical)
  "project_id": "<project_id>",         // optional
  "assigned_to": "<member_id>",         // optional
  "description": "...",                 // optional
  "deadline": "2026-05-01",             // optional, date string
  "estimated_hours": 4                  // optional
}
```
After creating, POST the initial log entry (see Status Log below).

### Update task fields (non-status)
```
PATCH /tasks?id=eq.<task_id>
Prefer: return=representation
{
  "assigned_to": "<member_id>",
  "priority": 4,
  "deadline": "2026-05-10",
  "updated_at": "<ISO timestamp>"
}
```

### Update task status ⚠️ TWO STEPS REQUIRED

**Step 1 — update the task:**
```
PATCH /tasks?id=eq.<task_id>
Prefer: return=representation
{
  "status": "Ongoing",
  "updated_at": "2026-04-14T10:00:00Z"
}
```

**Step 2 — log the status change (mandatory):**
```
POST /task_status_history
{
  "task_id": "<task_id>",
  "tenant_id": "<TENANT_ID>",
  "from_status": "Assigned",
  "status": "Ongoing",
  "notes": "Starting development",      // optional
  "changed_by": "bot"
}
```
Skipping step 2 means the flowchart in the UI will be incomplete.

### Valid status transitions
```
Unassigned → Assigned → Ongoing → Developed → Passed → Done
                                 └→ Failed → Revision → Developed (retry)
```

### Delete task
```
DELETE /tasks?id=eq.<task_id>
```

---

## Projects

### List active projects
```
GET /projects?tenant_id=eq.<TENANT_ID>&archived=eq.false&select=*
```

### Create project
```
POST /projects
{
  "tenant_id": "<TENANT_ID>",
  "name": "ProjectName",
  "color": "#3b82f6",
  "archived": false
}
```

### Archive project
```
PATCH /projects?id=eq.<project_id>
{ "archived": true }
```

### Restore project
```
PATCH /projects?id=eq.<project_id>
{ "archived": false }
```

---

## Seer (Gantt Chart)

### List entries
```
GET /seer_entries?tenant_id=eq.<TENANT_ID>&select=*,project:projects(*)&order=start_date.asc
```

### Create entry
```
POST /seer_entries
{
  "tenant_id": "<TENANT_ID>",
  "task_name": "Design phase",
  "start_date": "2026-04-15",
  "end_date": "2026-04-25",
  "color": "#8b5cf6",
  "project_id": "<project_id>",         // optional
  "description": "...",                 // optional
  "order_index": 0
}
```

### Update entry
```
PATCH /seer_entries?id=eq.<entry_id>
Prefer: return=representation
{
  "end_date": "2026-04-30",
  "updated_at": "<ISO timestamp>"
}
```

### Delete entry
```
DELETE /seer_entries?id=eq.<entry_id>
```

---

## Timekeeper

### List all slots for a member this week
```
GET /timekeeper_slots?tenant_id=eq.<TENANT_ID>&member_id=eq.<member_id>&select=*,member:team_members(*)
```

### Create busy slot
```
POST /timekeeper_slots
{
  "tenant_id": "<TENANT_ID>",
  "member_id": "<member_id>",
  "title": "Sprint review",
  "level": 1,                           // 1 = hard unavailable, 2 = reachable
  "start_time": "2026-04-15T09:00:00Z",
  "end_time": "2026-04-15T11:00:00Z",
  "is_recurring": false,
  "recurrence_type": null,
  "recurrence_until": null,
  "notes": null
}
```

### Create recurring slot
```
POST /timekeeper_slots
{
  "tenant_id": "<TENANT_ID>",
  "member_id": "<member_id>",
  "title": "Daily standup",
  "level": 1,
  "start_time": "2026-04-14T09:00:00Z",  // anchor date = first occurrence
  "end_time": "2026-04-14T09:30:00Z",
  "is_recurring": true,
  "recurrence_type": "daily",             // "daily" | "weekly"
  "recurrence_until": "2026-06-30",       // date string, null = forever
  "notes": null
}
```

### Update slot
```
PATCH /timekeeper_slots?id=eq.<slot_id>
Prefer: return=representation
{
  "title": "Updated reason",
  "level": 2
}
```

### Delete slot
```
DELETE /timekeeper_slots?id=eq.<slot_id>
```

---

## Notes

- All timestamps are UTC ISO 8601 (`2026-04-14T09:00:00Z`)
- `Prefer: return=representation` makes the response return the updated row — include it when you need the result
- Recurring slots are stored as a single row; the frontend expands them visually. The bot only manages the source record
- `order_index` on tasks and seer_entries controls display order; safe to leave at `0` for bot-created items
