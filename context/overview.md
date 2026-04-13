# Hermit RoetixDev — Project Overview

## What is Hermit?
Hermit is a task/project management web app built with Vite + React + TypeScript + Supabase + Tailwind CSS.
It is the RoetixDev team's internal tool, inspired by Sentry (Sakticahyaa/Sentry on GitHub).

## Key differences from Sentry
| Feature | Sentry | Hermit |
|---|---|---|
| Branches | Branch (generic) | Project (renamed) |
| Status | Not Yet / Ongoing / Done | 8-state workflow (see below) |
| Auth | Login required | No login — direct /RoetixDev route |
| Team members | None | 6 fixed members |
| Task history | None | Full flowchart/log with notes |
| Gantt chart | No | Seer page |
| Multi-version | No | Yes (tenants table) |

## URL Routing
- `/RoetixDev` — Main task manager
- Everything else redirects to `/RoetixDev`
- Seer is accessed via sidebar button (not a separate route)

## Task Status Workflow
```
Unassigned → Assigned → Ongoing → Developed → Passed → Done
                                      ↓           ↑
                                    Failed → Revision → (Ongoing again)
```
8 statuses: Unassigned, Assigned, Ongoing, Developed, Failed, Revision, Passed, Done
All status changes are done MANUALLY by the PM, or via the bot API.

## Team Members (RoetixDev)
Sakti, Bob, Dzaki, Yitzhak, Bian, Grandiv

## GitHub Repo
- Source: https://github.com/Sakticahyaa/Hermit-RoetixDev
- No Claude as contributor

## Deployment
- Planned: Vercel (similar to Sentry at sentry-hyke.vercel.app)
- Target URL: hermit-roetixdev.vercel.app (or similar)
