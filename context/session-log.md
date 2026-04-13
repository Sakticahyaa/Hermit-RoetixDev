# Session Log — Initial Build (2026-04-13)

## What was built
Full Hermit RoetixDev app from scratch in one session.

## Decisions made
1. **Supabase**: Free tier maxed at 2 active projects. Used existing "Sentry" project
   (xbzjykaayibfzzljfxeo) in Hyke org. Database tables were already pre-created.
   Added missing columns: from_status, color (seer_entries), order_index (seer_entries),
   avatar_color (team_members).

2. **No separate Seer page route**: Seer is accessible via sidebar button, state managed
   in RoetixDev.tsx (isSeer boolean). The /RoetixDev route serves both.

3. **No DnD yet**: @dnd-kit is installed but drag-and-drop reordering not implemented.
   The `reorder()` function exists in useTasks.ts and `reorderTasks()` in supabase.ts.

4. **TaskForm status note**: When editing a task and changing its status, the form
   shows a "Status Change Note" field that gets logged to task_status_history.

5. **ProjectsContext**: Passed via React Context to avoid prop drilling for project
   colors in deeply nested components.

## GitHub
- Repo: https://github.com/Sakticahyaa/Hermit-RoetixDev
- Branch: main
- Token stored in Windows credential manager (git credential-manager)

## Deployment
Not yet deployed. Recommended: Vercel with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
as environment variables. The .env file is gitignored.

## Known TODOs / Next steps
- [ ] Add drag-and-drop reordering in BoardView/ListView
- [ ] Add vercel.json for deployment
- [ ] Deploy to Vercel
- [ ] Test bot API integration
- [ ] Add loading skeletons
- [ ] Add real-time subscriptions (Supabase realtime)
- [ ] Mobile responsive improvements
- [ ] Keyboard shortcuts

## Member IDs for bot reference
- Sakti:   98516d9f-3205-41ac-a527-2f39e6f50177
- Yitzhak: 0b4203db-02cc-4a04-af0e-0373745a7efc
- Bian:    69be5e17-dfbc-4c6c-846e-decd785b1ae2
- Grandiv: 7497430e-719b-4b28-b19f-c0632d686da5
- Bob:     820e92e7-a7fa-4954-bd33-d1a860917514
- Dzaki:   27e5d826-1f8c-4748-9467-643377fab449
