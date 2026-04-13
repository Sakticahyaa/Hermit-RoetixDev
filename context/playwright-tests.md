# Hermit RoetixDev — MCP Playwright Test Cases

**File**: `C:\VANGUARD\Hyke\Hermit\hermit-roetixdev\context\playwright-tests.md`  
**Base URL**: http://localhost:5173  
**App route**: /RoetixDev  
**Run these tests in order.** Each test assumes the previous passed unless noted as independent.  
**Database**: Hermit Supabase project — `jdnpgtmouhqymvawdnxp.supabase.co` (dedicated, separate from Sentry)

---

## TC-01 · Routing & Initial Load

**What it verifies**: App loads, redirects work, default view renders.

### Steps
1. Navigate to `http://localhost:5173`
2. **Expect**: URL changes to `http://localhost:5173/RoetixDev` (auto-redirect)
3. **Expect**: Page title is "Hermit · RoetixDev"
4. **Expect**: Sidebar is visible on the left with logo "H" and label "Hermit / RoetixDev"
5. **Expect**: Sidebar contains navigation items: Board, List, Project (under "Tasks") and Seer (under "Planning")
6. **Expect**: Board view is the default — 8 kanban columns are visible
7. **Expect**: TopBar is visible with search input, project/member/status/priority dropdowns, and "New Task" button
8. Navigate to `http://localhost:5173/anything-random`
9. **Expect**: Redirects back to `/RoetixDev`

### Pass Criteria
- No "Loading Hermit…" spinner stuck indefinitely
- No error alert/banner with red background
- 8 status columns rendered: Unassigned, Assigned, Ongoing, Developed, Failed, Revision, Passed, Done

---

## TC-02 · Board View — Column Structure

**What it verifies**: All 8 status columns render with correct colors and labels.

### Steps
1. Navigate to `http://localhost:5173/RoetixDev`
2. **Expect**: Board view is visible (default)
3. Verify each of the following columns exists with matching dot color:
   - **Unassigned** — gray dot (#6b7280)
   - **Assigned** — blue dot (#3b82f6)
   - **Ongoing** — amber dot (#f59e0b)
   - **Developed** — violet dot (#8b5cf6)
   - **Failed** — red dot (#ef4444)
   - **Revision** — orange dot (#f97316)
   - **Passed** — emerald dot (#10b981)
   - **Done** — green dot (#22c55e)
4. **Expect**: Each column header shows a task count badge
5. **Expect**: Each column header has a "+" button to add a task directly in that status
6. **Expect**: Columns with no tasks show a dashed "No tasks" empty state

### Pass Criteria
All 8 columns present, colored correctly, count badges visible.

---

## TC-03 · Create New Task (Basic)

**What it verifies**: Task creation via "New Task" button works end-to-end.

### Steps
1. Click "New Task" button in the TopBar
2. **Expect**: Modal opens titled "New Task"
3. **Expect**: Modal contains fields: Title, Notes/Description, Status dropdown, Priority dropdown, Project dropdown, Assignee dropdown, Deadline date picker, Est. Hours input
4. **Expect**: Status dropdown defaults to "Unassigned"
5. **Expect**: Priority dropdown defaults to "P3 — Medium"
6. Click "Create Task" without filling any field
7. **Expect**: Error message appears: "Title is required"
8. Type `Fix login redirect bug` in the Title field
9. Type `The redirect loops when session expires` in the Notes/Description field
10. Set Status to **Assigned**
11. Set Priority to **P2 — High**
12. Set Assignee to **Sakti**
13. Set Deadline to today's date + 3 days
14. Set Est. Hours to `4`
15. Click "Create Task"
16. **Expect**: Modal closes
17. **Expect**: New task card appears in the **Assigned** column on the Board
18. **Expect**: Task card shows: title "Fix login redirect bug", blue "Assigned" badge, P2 priority dot, "Sakti" avatar, deadline indicator, "4h" estimated hours

### Pass Criteria
Task created and visible in Assigned column with all metadata displayed correctly.

---

## TC-04 · Create Task from Column "+" Button

**What it verifies**: Column-specific new task button pre-sets status.

### Steps
1. In the Board view, find the **Ongoing** column header
2. Click the "+" button in the Ongoing column header
3. **Expect**: New Task modal opens with Status pre-set to **Ongoing**
4. Type `Build dashboard widget` in the Title field
5. Set Assignee to **Bob**
6. Click "Create Task"
7. **Expect**: Task appears in the **Ongoing** column (not Unassigned)

### Pass Criteria
Task created directly in Ongoing column via "+" shortcut.

---

## TC-05 · Edit Task & Status Change with Log Note

**What it verifies**: Editing a task, changing status, and that the change gets logged.

### Steps
1. Find the task `Fix login redirect bug` created in TC-03 (in Assigned column)
2. Hover over the task card
3. **Expect**: Edit (pencil), History (clock), and Delete (trash) action buttons appear
4. Click the Edit (pencil) icon
5. **Expect**: "Edit Task" modal opens, pre-filled with all existing values
6. Change Status from **Assigned** to **Ongoing**
7. **Expect**: A "Status Change Note" section appears at the bottom of the form, showing "Assigned → Ongoing"
8. Type `Developer picked up the task` in the Status Change Note field
9. Click "Save Changes"
10. **Expect**: Modal closes
11. **Expect**: Task moves from Assigned column to **Ongoing** column
12. **Expect**: Task card now shows "Ongoing" badge in amber

### Pass Criteria
Task moved to Ongoing column, status badge updated.

---

## TC-06 · Task Log / Status Flowchart

**What it verifies**: Status history is logged and the flowchart modal displays correctly.

### Steps
1. Find the task `Fix login redirect bug` (now in Ongoing column)
2. Hover over the task card
3. Click the History (clock/history) icon
4. **Expect**: "Status History" modal opens
5. **Expect**: Modal header shows "Status History" and the task title "Fix login redirect bug"
6. **Expect**: "Current Status" section shows **Ongoing** badge
7. **Expect**: Timeline/flowchart shows at least 2 log entries:
   - Entry 1: Initial creation → **Unassigned** (or **Assigned** depending on creation status), no from_status
   - Entry 2: **Assigned → Ongoing** with note "Developer picked up the task"
8. **Expect**: Each entry shows: status badges (from → to), timestamp, "by PM" attribution
9. **Expect**: Entry 2 shows the note text "Developer picked up the task"
10. Close the modal by clicking the X button
11. **Expect**: Modal closes, Board view returns

### Pass Criteria
At least 2 log entries visible, status transition arrows correct, note text preserved.

---

## TC-07 · Full Status Workflow Simulation

**What it verifies**: Task can cycle through all 8 statuses with logs.

### Steps
1. Create a new task: Title = `API integration`, Status = **Assigned**, Assignee = **Dzaki**
2. Edit task → change to **Ongoing**, note: `Starting dev`
3. **Expect**: Task in Ongoing column
4. Edit task → change to **Developed**, note: `Dev complete, ready for QA`
5. **Expect**: Task in Developed column
6. Edit task → change to **Failed**, note: `Tests failed — null pointer on edge case`
7. **Expect**: Task in Failed column, badge is red
8. Edit task → change to **Revision**, note: `Fixing the null pointer issue`
9. **Expect**: Task in Revision column, badge is orange
10. Edit task → change to **Ongoing**, note: `Back in dev after revision`
11. Edit task → change to **Developed**, note: `Fixed and re-submitted`
12. Edit task → change to **Passed**, note: `QA approved`
13. **Expect**: Task in Passed column, badge is emerald
14. Edit task → change to **Done**, note: `Shipped to production`
15. **Expect**: Task in Done column, badge is green
16. Open Task Log for this task
17. **Expect**: 8+ log entries visible in chronological order showing the full journey

### Pass Criteria
Task traverses all 8 statuses. Each transition logged. Flowchart shows complete history.

---

## TC-08 · List View

**What it verifies**: List/table view renders all tasks with correct columns.

### Steps
1. In the Sidebar, click **List**
2. **Expect**: View switches from Board to a table layout
3. **Expect**: Table has columns: Priority, Title, Status, Project, Assignee, Deadline, Hours, Actions
4. **Expect**: All created tasks appear as table rows
5. Hover over a row
6. **Expect**: Row highlights with slightly lighter background
7. **Expect**: Action buttons (History, Edit, Delete) appear on hover
8. Click the Edit icon on any row
9. **Expect**: Edit Task modal opens
10. Close modal
11. Click the History icon on any row
12. **Expect**: Status History modal opens

### Pass Criteria
Table renders, hover state works, modals open from rows.

---

## TC-09 · Project Management — Add, Edit, Archive, Restore

**What it verifies**: Projects represent real app projects (e.g. Roetix, Batin). Archive preserves history; delete is permanent.

### Steps
1. Click "Manage Projects" button (top-right of sub-header)
2. **Expect**: Projects modal opens titled "Projects"
3. **Expect**: Shows "Active" section and an "Add Project" section at the bottom
4. In the "Add Project" section, type `Roetix` in the input
5. Select the **indigo** color swatch
6. Click "Add" (or press Enter)
7. **Expect**: "Roetix" appears in Active list with an indigo left border and glowing dot
8. Add `Batin` with **blue** color
9. Add `Hyke Core` with **emerald** color
10. **Expect**: 3 active projects listed, count shows "3 active"
11. Click the Edit (pencil) icon on `Roetix`
12. **Expect**: Inline edit mode — name input and color swatches appear in the row
13. Change name to `Roetix v2`
14. Change color to **violet**
15. Press Enter or click "Save"
16. **Expect**: Project updates to "Roetix v2" with violet border
17. Click the Archive (box) icon on `Hyke Core`
18. **Expect**: Confirm dialog: `Archive "Hyke Core"? It will be hidden from active views but tasks remain linked.`
19. Confirm
20. **Expect**: "Hyke Core" disappears from Active list
21. **Expect**: Count changes to "2 active, 1 archived"
22. **Expect**: An "Archived (1) ▼" toggle appears below Active section
23. Click the "Archived (1)" toggle to expand
24. **Expect**: "Hyke Core" appears with strikethrough text and an "archived" badge
25. Click the Restore (ArchiveRestore) icon on "Hyke Core"
26. **Expect**: "Hyke Core" moves back to Active list
27. **Expect**: Count back to "3 active"
28. Archive `Hyke Core` again
29. Expand archived section, click Delete (trash) on it
30. **Expect**: Confirm: `Permanently delete "Hyke Core"? Tasks linked to it will be unlinked. This cannot be undone.`
31. Confirm
32. **Expect**: Removed entirely, count shows "2 active"
33. Close the modal
34. **Expect**: TopBar project dropdown only shows `Roetix v2` and `Batin` (not archived/deleted)
35. Open "New Task" — **Expect**: Project dropdown also only shows active projects

### Pass Criteria
Archive hides from active views. Restore brings it back. Delete is permanent with warning. Dropdowns always reflect active-only list.

---

## TC-10 · Project View

**What it verifies**: Project view groups tasks by project correctly.

### Steps
1. From TC-08 tasks, edit at least 2 and assign them to `Roetix v2` (created in TC-09)
2. In the Sidebar, click **Project**
3. **Expect**: View shows tasks grouped by project with a colored section header per project
4. **Expect**: Section header shows project color dot, project name, and task count badge
5. **Expect**: Tasks with no project appear under a "No Project" section at the bottom
6. **Expect**: Each task renders as a TaskCard (same style as Board view)
7. **Expect**: Grid layout — multiple cards per row on wide screens

### Pass Criteria
Tasks grouped correctly by project. Colored section headers match project colors. Unlinked tasks appear under "No Project".

---

## TC-11 · Filtering Tasks

**What it verifies**: All filter controls narrow down the task list correctly.

### Steps
1. Ensure at least 3 tasks exist with different projects, assignees, and statuses
2. Navigate to **Board** view
3. In the TopBar, select **Roetix v2** from the project dropdown
4. **Expect**: Only tasks assigned to "Roetix v2" project appear across all columns
5. **Expect**: Task count in top-right shows reduced number
6. Select a member from the Assignee dropdown (e.g., **Sakti**)
7. **Expect**: Tasks filtered to only Sakti's tasks in Roetix v2
8. Select **Ongoing** from the Status dropdown
9. **Expect**: Only Ongoing tasks for Sakti in Roetix v2 shown
10. Clear filters by clicking "Clear" button (appears when any filter active)
11. **Expect**: All tasks return, "Clear" button disappears
12. Type `login` in the search box
13. **Expect**: Only tasks with "login" in the title are shown
14. Clear the search
15. **Expect**: All tasks return

### Pass Criteria
Each filter narrows results. Combined filters work. Clear resets all filters.

---

## TC-12 · Seer (Gantt Chart) — Load & Navigation

**What it verifies**: Seer page loads with correct layout.

### Steps
1. In the Sidebar, click **Seer** (under Planning)
2. **Expect**: View switches to Seer — the top filter bar and Board view disappear
3. **Expect**: Seer header shows "Seer" title and "Timeline / Gantt" subtitle
4. **Expect**: An "Add Item" button is visible in the top-right
5. **Expect**: If no entries, the chart area is empty but the date header is visible
6. **Expect**: Date header shows month names and day numbers
7. **Expect**: A vertical indigo "today" line is visible in the chart
8. **Expect**: Left column is sticky (fixed while scrolling horizontally)

### Pass Criteria
Seer loads without errors, date header renders, today line visible.

---

## TC-13 · Seer — Add Timeline Item

**What it verifies**: Adding a Gantt entry and seeing it rendered as a bar.

### Steps
1. In Seer view, click "Add Item"
2. **Expect**: Modal opens titled "New Timeline Item"
3. **Expect**: Fields: Task Name, Description, Project dropdown, Start Date, End Date, Color swatches
4. Leave Task Name empty and click "Add to Timeline"
5. **Expect**: Error: "Name is required"
6. Type `Design Sprint v1` in Task Name
7. Type `Initial design work` in Description
8. Select **Roetix v2** project (created in TC-10)
9. Set Start Date to today
10. Set End Date to today + 7 days
11. Set End Date earlier than Start Date
12. Click "Add to Timeline"
13. **Expect**: Error: "End date must be after start date"
14. Fix End Date to today + 7 days
15. Select the **blue** color swatch
16. Click "Add to Timeline"
17. **Expect**: Modal closes
18. **Expect**: A blue horizontal bar labeled "Design Sprint v1" appears in the Gantt chart
19. **Expect**: The bar's left edge aligns with today's date
20. **Expect**: The bar's width spans 8 days (today → today+7)
21. Add a second item: `Backend API` with a 14-day span starting tomorrow, green color
22. **Expect**: Two bars visible, stacked in separate rows

### Pass Criteria
Bars render at correct positions with correct widths. Colors match selection.

---

## TC-14 · Seer — Edit & Delete Item

**What it verifies**: Gantt item can be edited and deleted.

### Steps
1. In Seer, hover over the `Design Sprint v1` row (left label column)
2. **Expect**: Edit (pencil) and Delete (trash) icons appear
3. Click Edit
4. **Expect**: Modal opens pre-filled with "Design Sprint v1" data
5. Change Task Name to `Design Sprint v2`
6. Change color to **violet**
7. Click "Save Changes"
8. **Expect**: Bar updates to violet color
9. **Expect**: Label in left column updates to "Design Sprint v2"
10. Hover over the `Backend API` row
11. Click Delete
12. **Expect**: Confirm dialog: `Delete "Backend API"?`
13. Confirm
14. **Expect**: Backend API row removed from chart

### Pass Criteria
Edit updates bar in place. Delete removes row and bar immediately.

---

## TC-15 · Delete Task

**What it verifies**: Task deletion works with confirmation.

### Steps
1. Go to **Board** view
2. Hover over any task card
3. Click the Delete (trash) icon
4. **Expect**: Browser confirm dialog: `Delete "<task title>"?`
5. Click Cancel
6. **Expect**: Task NOT deleted, still visible
7. Hover again, click Delete
8. Click OK/Confirm
9. **Expect**: Task disappears from the board
10. **Expect**: Column count decrements by 1

### Pass Criteria
Cancel does nothing. Confirm removes task immediately without page reload.

---

## TC-16 · Sidebar Navigation State

**What it verifies**: Active nav item highlights correctly.

### Steps
1. Click **Board** in sidebar
2. **Expect**: Board button has indigo background and indigo text
3. **Expect**: Other sidebar items are gray/muted
4. Click **List**
5. **Expect**: List button becomes active (indigo), Board returns to muted
6. Click **Project**
7. **Expect**: Project button becomes active
8. Click **Seer**
9. **Expect**: Seer button becomes active
10. **Expect**: Task view items (Board/List/Project) are all muted (since Seer is a different section)
11. Click **Board** again
12. **Expect**: Seer becomes muted, Board becomes active

### Pass Criteria
Only one nav item is active at a time. Active = indigo highlight.

---

## TC-17 · Data Persistence (Reload Test)

**What it verifies**: All data persists across page reloads (Supabase is source of truth).

### Steps
1. Note the titles of the first 3 tasks visible on the Board
2. Note any existing projects
3. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
4. **Expect**: App reloads, shows "Loading Hermit…" briefly
5. **Expect**: After load, same tasks are visible in the same columns
6. **Expect**: Same projects appear in the "Manage Projects" modal
7. Navigate to Seer
8. **Expect**: Gantt entries are still present

### Pass Criteria
All data survives a hard reload. No data loss. Loading state shown and resolves.

---

## TC-18 · Task Form — All Fields Populate on Edit

**What it verifies**: Edit modal pre-fills every field correctly.

### Steps
1. Find task `Fix login redirect bug` (created in TC-03 with all fields filled)
2. Click Edit on it
3. **Expect**: Title field shows `Fix login redirect bug`
4. **Expect**: Notes field shows `The redirect loops when session expires`
5. **Expect**: Status shows **Ongoing** (from TC-05)
6. **Expect**: Priority shows **P2**
7. **Expect**: Assignee shows **Sakti**
8. **Expect**: Deadline is pre-filled with the date set in TC-03
9. **Expect**: Est. Hours shows `4`
10. Close modal without saving

### Pass Criteria
Every field pre-populated correctly from the database.

---

## TC-19 · Responsive TopBar — Filter Persistence

**What it verifies**: Filters persist when switching views.

### Steps
1. In TopBar, select **Sakti** from the Assignee dropdown
2. **Expect**: Tasks filtered to Sakti only in Board view
3. Switch to **List** view via Sidebar
4. **Expect**: List view still shows only Sakti's tasks (filter persisted)
5. Switch to **Project** view
6. **Expect**: Project view still shows only Sakti's tasks
7. Click "Clear" to remove filters
8. **Expect**: All tasks return across all views

### Pass Criteria
Filters survive view switching. Clear works from any view.

---

## TC-20 · Error Handling — Network Resilience

**What it verifies**: App handles errors gracefully.

### Steps
1. Open DevTools → Network tab
2. Go Offline (DevTools → Offline mode or throttle to no connection)
3. Try to create a new task
4. **Expect**: Error message appears (red banner or inline error) — does NOT crash/blank screen
5. Go back Online
6. Reload the page
7. **Expect**: App loads normally, existing data restored

### Pass Criteria
No white screen of death. Error displayed. Recovery possible after going online.

---

## Test Execution Checklist

| TC | Test | Result | Notes |
|---|---|---|---|
| TC-01 | Routing & Initial Load | ⬜ | |
| TC-02 | Board Column Structure | ⬜ | |
| TC-03 | Create Task (Basic) | ⬜ | |
| TC-04 | Create from Column "+" | ⬜ | |
| TC-05 | Edit Task & Status Change | ⬜ | |
| TC-06 | Task Log Flowchart | ⬜ | |
| TC-07 | Full Status Workflow | ⬜ | |
| TC-08 | List View | ⬜ | |
| TC-09 | Project Management | ⬜ | |
| TC-10 | Project View | ⬜ | |
| TC-11 | Filtering Tasks | ⬜ | |
| TC-12 | Seer Load & Nav | ⬜ | |
| TC-13 | Seer Add Item | ⬜ | |
| TC-14 | Seer Edit & Delete | ⬜ | |
| TC-15 | Delete Task | ⬜ | |
| TC-16 | Sidebar Nav State | ⬜ | |
| TC-17 | Data Persistence | ⬜ | |
| TC-18 | Edit Modal Pre-fill | ⬜ | |
| TC-19 | Filter Persistence | ⬜ | |
| TC-20 | Error Handling | ⬜ | |

---

## Notes for MCP Playwright Execution

- To run: open a new session and say **"Run playwright tests from `C:\VANGUARD\Hyke\Hermit\hermit-roetixdev\context\playwright-tests.md` starting at TC-01"**
- Run in order — dependency chain: TC-03 → TC-05 → TC-06 → TC-07 (task data), TC-09 → TC-10 → TC-11 (project data), TC-09 → TC-13 (seer project)
- Replace ⬜ with ✅ (pass), ❌ (fail), or ⚠️ (partial) after each test
- Capture a screenshot on any failure before moving on
- Tests hit the **live Hermit Supabase database** — they create real records. Run on a clean DB or clean up after
- Dev server must be running: `npm run dev` in `C:\VANGUARD\Hyke\Hermit\hermit-roetixdev`
