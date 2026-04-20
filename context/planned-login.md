# Planned Feature: Per-Member Login

Status: **Parked** — not yet implemented.

## Goal

Add a login gate to Hermit so each team member has their own account. 6 accounts, one per member.

## Chosen Approach: Supabase Auth (email + password)

Supabase has built-in auth. Each member gets an email+password account. Email confirmation disabled for internal use.

## DB Changes Required

```sql
-- Link each team_members row to a Supabase auth user
ALTER TABLE team_members ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Create 6 auth users via Supabase dashboard or Management API
-- Then UPDATE team_members SET user_id = '<auth_user_id>' WHERE name = 'Sakti'; etc.
```

## New Files

| File | Purpose |
|------|---------|
| `src/hooks/useAuth.ts` | Wraps `supabase.auth` — exposes `user`, `signIn`, `signOut`, `loading` |
| `src/pages/LoginPage.tsx` | Email + password form, centered, app-themed |

## Changed Files

| File | Change |
|------|--------|
| `src/App.tsx` | Auth guard — redirect to `/login` if no session |
| `src/pages/RoetixDev.tsx` | Resolve `currentMember` from `user_id` match in `team_members` |
| `src/context/RoetixDevContext.tsx` | Expose `currentMember: Member` |
| `src/components/Sidebar.tsx` | Show current member name + avatar at bottom; logout button |

## Nice-to-have After Login

- "My Tasks" quick filter in sidebar — filters tasks where logged-in member is in `assignees`
- Possibly tag who made a status change (currently hardcoded to `'PM'`)

## Pending Decisions

1. What email per member? (real emails, or internal like `sakti@roetixdev.internal`)
2. Shared starting password or individual?
3. Should the bot/API still work with the anon key? (Yes — RLS stays off, anon key still valid for bot)
