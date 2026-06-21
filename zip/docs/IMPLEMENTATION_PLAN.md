# CoupleSync Implementation Plan

## Current State

The app in this folder is a working Vite + React + Tailwind prototype with Supabase-ready wiring. It already has the three-panel layout, calendar views, local mock fallback, Supabase client setup, Auth screens, workspace setup, event/todo/habit/inbox persistence paths, and realtime subscriptions.

The app has not yet been verified against a real Supabase project because `.env.local` is still missing. External Google/Apple calendar sync and Vercel deployment are still later milestones.

2026-06-21 update: Supabase is now configured locally. `npm run doctor` and `npm run verify:supabase` pass against the configured project. The user reports GitHub OAuth login, role display, invite code, drag-to-calendar todos, and database persistence are working in the local UI. The remaining live-app verification gap is two authenticated browser sessions for Realtime behavior.

## Working Rules

- Keep minimal diffs: preserve the generated UI and avoid broad refactors.
- Do not delete files, code, comments, tests, scripts, config, or docs unless a separate reference check is performed and the user confirms the deletion.
- Build backend features in layers so the UI keeps running even before Supabase is configured.
- Keep Vite React for now; migrating to Next.js is not necessary for the MVP.

## Milestone 1: Supabase Foundation

Deliverables:
- `supabase/migrations/...initial_schema.sql`
- Public tables for profiles, couples, couple members, layers, events, habit definitions, habit logs, todos, inbox messages, and calendar connections.
- Row Level Security policies so only couple members can see and mutate couple-scoped data.
- Default seed trigger for system layers and starter habits when a couple workspace is created.
- Realtime publication entries for the core app tables.
- Supabase browser client initialized from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- `npm run setup:supabase` helper for writing the Supabase Project URL and anon public key into `.env.local`.
- `npm run verify:supabase` helper for checking the live Supabase REST endpoint and expected table endpoints after the migration runs.
- `npm run sql:supabase` helper for generating `supabase/setup.sql` from ordered migrations for Supabase SQL Editor copy/paste.
- `npm run oauth:github` helper for printing exact GitHub OAuth App and Supabase Auth URL fields from the Supabase Project URL.
- `npm run vercel:settings` helper for printing Vercel project settings, required env vars, and Supabase Auth redirect reminders.
- Demo/mock mode remains available when these env vars are missing.
- External-calendar readiness migration for imported-event deduplication, connection sync status, and realtime calendar connection updates.
- Google-calendar OAuth readiness migration for safe connection and imported-event upserts.

User-owned setup needed:
- Create a Supabase project.
- Run the migration SQL files in filename order in Supabase SQL Editor or via Supabase CLI.
- Or run `npm run sql:supabase` and paste the generated `supabase/setup.sql` into Supabase SQL Editor.
- Copy the project URL and anon key into `.env.local`, or run `npm run setup:supabase` and paste them when prompted.
- Run `npm run verify:supabase` after `.env.local` and the SQL migration are in place.
- Detailed setup guide: `docs/SUPABASE_SETUP.md`.

## Milestone 2: Auth & Couple Workspace

Deliverables:
- GitHub sign-in button using Supabase Auth.
- Profile initialization from the authenticated Supabase user.
- Create or join couple workspace screen.
- Invite code support for the second partner.

User-owned setup needed:
- Configure GitHub as a Supabase Auth provider. This requires a GitHub OAuth App client ID and secret.
- Run `npm run oauth:github` after the Supabase URL is known to avoid mistyping the callback URL.
- Add the local and deployed callback URLs in Supabase Auth settings.
- Detailed setup guide: `docs/SUPABASE_SETUP.md`.

## Milestone 3: Persistent Core Data

Deliverables:
- Replace local-only mock state with Supabase-backed loading for events, layers, habit logs, todos, and inbox messages.
- Persist todo completion and scheduling.
- Persist message-to-event conversion.
- Persist new todos.
- Preserve local mock fallback in demo mode.

## Milestone 4: Realtime Sync

Deliverables:
- Subscribe to Postgres changes for events, todos, habit logs, inbox messages, and layers.
- Refresh or patch local state when the other partner changes data.
- Keep optimistic UI updates for the person making the change.

## Milestone 5: Product Completeness

Deliverables:
- Replace `prompt`/`alert` flows with proper dialogs.
- Add habit customization UI.
- Add threaded inbox replies.
- Add custom layer creation.
- Add drag-and-drop scheduling using a dedicated drag-and-drop library.
- Improve mobile layout only where the current generated UI breaks.

Current local status:
- Proper dialogs/forms have replaced the core browser `prompt` flows.
- Threaded inbox replies exist and persist through Supabase when configured.
- Custom layer creation exists and persists through Supabase when configured.
- Supabase layer reloads preserve existing visibility choices while activating newly created default-visible layers.
- Month/day/week drag-to-calendar scheduling exists using native browser drag/drop. A dedicated library can still be introduced later if touch/mobile drag support or richer drag previews become necessary.
- Habit definition customization exists in the sidebar and persists through Supabase when configured. Month-view day-level habit logging also exists and writes to Supabase `habit_logs` when configured.
- Habit logging is idempotent: already-logged habits are disabled in the selector, and Supabase writes ignore duplicate unique-key conflicts.
- Habit logs use the current user's couple role as the log owner, so shared habits still record who completed them.
- Frontend habit log records are typed as concrete partner roles only; legacy `both` logs from Supabase are coerced on load.
- Month-view habit dots include accessible labels and partner-colored borders so a dot can communicate both the habit type and who completed it.
- Left-sidebar My Tasks exists as a personal, role-filtered todo list. It reuses the `todos` table with `assignee_role` set to the current user's side.
- Right-sidebar To-Do Box now shows both flexible and scheduled tasks, so calendar checkbox completion stays visible in the shared list.
- Scheduled todos can be moved back to the flexible list by clearing their scheduled date, without deleting the task.
- Scheduled todos render in month, day, and week calendar views with the same completion toggle behavior.
- Direct manual event creation exists from the calendar header and persists through Supabase when configured.
- Event creation is layer-aware: events can be assigned to schedule/custom layers and render according to layer visibility and color.
- Existing calendar events can now be clicked from month/day/week views and edited in the same event dialog. Updates persist through Supabase or demo state.
- All-day events are supported in the event type, create/edit dialog, Supabase load/insert/update paths, and day/week rendering.
- Message-to-event scheduling also preserves owner and layer selections.
- Message-to-event conversion now reports an error if the event is created but the source inbox message cannot be marked as converted.
- Workspace status is visible in the sidebar. When Supabase is configured and a workspace exists, the invite code can be copied from the app.
- `npm run doctor` checks that the expected Supabase code, SQL, docs, package scripts, setup/SQL/OAuth/verifier helpers, and local env vars are present.
- Demo/mock mode now opens on today's date, and sample events, todos, habits, and message timestamps are generated in the current month.
- Runtime store errors are visible in the main app through a dismissible `Sync issue` banner.
- Top-nav Search opens a global search panel for events, todos, and inbox messages, with result actions that jump to the relevant calendar date or side-panel tab.
- Top-nav Notifications opens a Today summary panel for calendar items, scheduled/open todos, habit logs, and backend mode.
- Left-sidebar Google Calendar status controls now show connection/sync state from `calendar_connections`.
- Browser smoke verification has confirmed the local demo app renders, the To-Do Box can add a task, and that task can be scheduled to today's calendar cell.
- The app shell now uses the `CoupleSync` page title and a local SVG favicon, so smoke runs are not polluted by favicon 404 errors.

## Milestone 6: Deployment

Deliverables:
- Vercel deployment using the Vite build output.
- Production env vars in Vercel.
- Supabase Auth redirect URLs updated for the Vercel domain.

Current local status:
- `vercel.json` is present with an SPA rewrite to `index.html`.
- `docs/VERCEL_DEPLOYMENT.md` records the Vercel root directory, build command, output directory, environment variables, and Supabase Auth URL updates.
- `npm run vercel:settings` prints the project settings and post-deploy Supabase Auth URL reminders.
- `npm run doctor` checks that the Vercel deployment guide, config, and helper exist.

User-owned setup needed:
- Log in to Vercel and connect the repository.
- Add environment variables in Vercel Project Settings.

## Milestone 7: External Calendar Sync

Google Calendar:
- Configure Google Cloud Calendar API.
- Create OAuth credentials.
- Store tokens server-side or through Supabase Edge Functions, not in browser state.

Apple/iCloud Calendar:
- Treat as a separate later integration.
- Apple calendar access is usually CalDAV/app-specific-password based and should be handled server-side.

Current local status:
- `events.source`, `events.external_id`, and `calendar_connections` already exist in the Supabase migration.
- Imported Google/Apple events have a unique index on `couple_id + source + external_id`, and calendar connections can record sync status/error fields.
- The project includes Vercel API functions for read-only Google OAuth connect, callback token exchange, encrypted token storage, and manual import sync.
- `googleapis` is installed for the Vercel Node.js function path.
- `npm run calendar:doctor` checks Google Calendar API files, dependency, and required server env vars.
- `docs/CALENDAR_SYNC.md` records the Google setup steps, Apple/iCloud constraints, token-storage rule, and recommended implementation order.
- The next verification step should wait until Supabase live setup, Vercel deployment, and Google OAuth credentials exist, because imported external events need real users, couple roles, RLS, and provider tokens.

## Immediate Next Step

Use `docs/SUPABASE_SETUP.md` to create the real Supabase project, run `npm run sql:supabase`, paste `supabase/setup.sql` into Supabase SQL Editor, and enable GitHub login. Run `npm run setup:supabase` after copying the Supabase Project URL and anon public key, then run `npm run oauth:github` to print the exact GitHub/Supabase OAuth fields, and run `npm run verify:supabase` after the SQL has run. After live checks pass, the next engineering step is Auth/RLS/Realtime verification with two browser sessions. Google Calendar verification comes after Vercel server env vars and Google OAuth credentials are configured.

Run `npm run doctor` before and after the setup. Right now it is expected to warn that `.env.local`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` are missing.

2026-06-21 update: the Supabase setup part above is complete locally. The next concrete step is two-session Realtime verification, then Vercel deployment with browser env vars, then Google Calendar server env and OAuth verification.
