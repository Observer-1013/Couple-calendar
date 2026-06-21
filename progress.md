# Progress Log

## Session: 2026-06-21

### Phase 5: Implementation Documentation
- **Status:** complete
- **Started:** 2026-06-21
- Actions taken:
  - Re-read planning files after the user approved implementation.
  - Updated the durable task plan from read-only roadmap mode to full-stack build mode.
  - Created the app documentation and Supabase migration directories.
  - Added `zip/docs/IMPLEMENTATION_PLAN.md` with milestones and user-owned setup boundaries.
- Files created/modified:
  - `task_plan.md` updated
  - `progress.md` updated
  - `zip/docs/IMPLEMENTATION_PLAN.md` created
  - `zip/docs/` created
  - `zip/supabase/migrations/` created

### Phase 6: Supabase Foundation
- **Status:** complete
- **Started:** 2026-06-21
- Actions taken:
  - Added the initial Supabase migration with business tables, indexes, RLS policies, updated-at triggers, default couple seeding, create/join RPCs, grants, and realtime publication setup.
  - Installed `@supabase/supabase-js`.
  - Added Supabase env var placeholders to `.env.example`.
  - Added the Supabase browser client with demo-mode detection.
- Files created/modified:
  - `zip/supabase/migrations/20260621023000_initial_schema.sql` created
  - `zip/package.json` updated
  - `zip/package-lock.json` updated
  - `zip/.env.example` updated
  - `zip/src/lib/supabase.ts` created

### Phase 7: Auth & Couple Workspace
- **Status:** in_progress
- **Started:** 2026-06-21
- Actions taken:
  - Added Supabase session hook.
  - Added GitHub OAuth login screen.
  - Added create/join couple workspace screen.
  - Added Supabase-aware data store with mock fallback, profile initialization, workspace loading, core table loading, mutations for todos/events/messages, and realtime subscriptions.
  - Wired `App.tsx` to the new Auth/store flow.
  - Updated TopNav for sign out, RightPanel todo checkboxes for real toggling, and Calendar habit dots for database colors.
  - Started the local Vite dev server on `http://localhost:3000/`.
  - Confirmed the local HTTP entrypoint returns `200 OK`.
  - Confirmed `.env.local` is missing, so the app currently runs in demo/mock mode.
  - Replaced core browser prompt flows with in-app forms/dialogs for name editing, todo creation, and message-to-event scheduling.
  - Added inbox message composer and threaded reply UI.
  - Added custom layer creation UI with color picker.
  - Removed remaining `prompt`/`alert` matches from `zip/src`.
  - Confirmed the local HTTP entrypoint still returns `200 OK`.
  - Added native month-view drag-to-calendar scheduling for right-panel todos and inbox messages.
  - Confirmed drag/drop references are localized to `App.tsx`, `Calendar.tsx`, `RightPanel.tsx`, and `calendarDrag.ts`.
  - Added habit definitions to the store, including Supabase loading and creation.
  - Added a sidebar habit list and habit creation form with color picker.
  - Added month-view habit logging through a day-cell habit selector.
  - Added a unique migration index to prevent duplicate habit logs for the same couple, habit, date, and owner role.
  - Added a left-sidebar My Tasks section for role-specific personal tasks.
  - Wired personal task add/toggle through the existing Supabase/mock todo persistence functions.
  - Added direct shared event creation from the calendar header.
  - Added a New Event dialog and wired it to local demo state or Supabase `events`.
  - Added owner and layer selection to the New Event dialog.
  - Updated calendar event filtering/rendering to use selected layer visibility and colors when available.
  - Added `zip/docs/SUPABASE_SETUP.md` with Supabase and GitHub OAuth setup steps.
  - Added a sidebar workspace status card showing demo/Supabase status, workspace name, current role, and invite code when available.
  - Added event editing for existing calendar events in month/day/week views.
  - Added a Supabase/mock update path for event title, date, time, owner, and layer.
  - Updated event layer select values so Supabase database layer ids can be displayed and saved correctly.
  - Wired message-to-event scheduling to persist the dialog's owner and layer choices.
  - Added `npm run doctor` and `npm run doctor:strict`.
  - Added `zip/scripts/check-setup.mjs` to check required files, package scripts, Supabase dependency, and `.env.local` values.
  - Updated Supabase/setup documentation to include the doctor command.
  - Added Vercel SPA rewrite config.
  - Added Vercel deployment guide with root directory, build/output settings, env vars, and Supabase Auth URL steps.
  - Extended the setup doctor to check Vercel readiness files.
  - Replaced the fixed October 2023 initial calendar date with today's local date.
  - Updated demo/mock data to generate events, todos, habits, and message timestamps inside the current month.
  - Confirmed no `2023` date references remain under `zip/src`.
  - Added `zip/docs/CALENDAR_SYNC.md` for Google Calendar setup, Apple/iCloud constraints, token storage, and sync implementation order.
  - Added the calendar sync guide to `npm run doctor`.
  - Extended drag-to-calendar scheduling to day/week views by making header date blocks and time columns droppable.
  - Reused the existing todo/message drag payload and Supabase/mock persistence paths for all calendar views.
  - Restarted the local Vite dev server on `http://localhost:3000/` after it was no longer running.
  - Added all-day event support across event types, mock data, Supabase load/insert/update paths, and the event dialog.
  - Updated day/week event filtering so all-day events render in the header area instead of the timed grid.
  - Made habit logging idempotent in demo mode and Supabase mode.
  - Disabled already-logged habits in the date-cell habit selector and labeled them as `Logged`.
  - Updated the right To-Do Box to show both flexible and scheduled todos.
  - Added scheduled date labels while preserving checkbox completion sync for scheduled todos.
  - Added `unassignTodoFromDate` to clear a todo's scheduled date in demo state or Supabase.
  - Added a right-panel action to move scheduled todos back to the flexible list without deleting them.
  - Added `clearError` to the store.
  - Added a dismissible main-app `Sync issue` banner for runtime store errors.
  - Fixed Supabase layer reload merging so newly created default-visible layers become active without reactivating old hidden layers.
  - Added error handling for the second write in message-to-event conversion when marking an inbox message as converted.
  - Added scheduled todo rendering to day/week calendar header date areas.
  - Extracted a shared calendar todo checkbox renderer used by month/day/week views.
  - Changed habit logging to write the current user's couple role into `habit_logs.owner_role`.
  - Passed the current user role into the calendar habit logging UI so duplicate/Logged state matches the write path.
  - Tightened frontend `HabitRecord.user` to concrete user roles and removed `both` from demo habit logs.
  - Added a Supabase load fallback for legacy `both` habit logs.
- Files created/modified:
  - `zip/src/lib/useSupabaseSession.ts` created
  - `zip/src/lib/useCoupleSyncStore.ts` created
  - `zip/src/lib/calendarDrag.ts` created
  - `zip/src/components/AuthScreen.tsx` created
  - `zip/src/components/CoupleSetup.tsx` created
  - `zip/src/App.tsx` updated
  - `zip/src/components/TopNav.tsx` updated
  - `zip/src/components/RightPanel.tsx` updated
  - `zip/src/components/Calendar.tsx` updated
  - `zip/src/components/Sidebar.tsx` updated
  - `zip/src/types.ts` updated
  - `zip/src/vite-env.d.ts` created
  - `zip/scripts/check-setup.mjs` created
  - `zip/package.json` updated
  - `zip/docs/SUPABASE_SETUP.md` updated
  - `zip/docs/IMPLEMENTATION_PLAN.md` updated
  - `zip/docs/VERCEL_DEPLOYMENT.md` created
  - `zip/vercel.json` created
  - `zip/docs/CALENDAR_SYNC.md` created

### Phase 1: Requirements & Code Discovery
- **Status:** in_progress
- **Started:** 2026-06-21
- Actions taken:
  - Read the planning-with-files skill instructions.
  - Checked for existing planning files; none were present.
  - Located the generated app directory at `zip/`.
  - Created planning files for this roadmap task.
  - Read the app config, package metadata, README, environment example, TypeScript config, global CSS, app entrypoint, mock data, types, and all React components.
  - Installed npm dependencies inside `zip/`.
  - Ran TypeScript and production build checks.
  - Checked current official docs for Supabase Auth/RLS/Realtime, Vercel Vite deployment, Google Calendar OAuth setup, and Apple app-specific passwords.
  - Checked repository status; the directory is not a git repository, so exact diff metadata is unavailable.
- Files created/modified:
  - `task_plan.md` created
  - `findings.md` created
  - `progress.md` created
  - `zip/node_modules/` created by `npm install` and ignored by `.gitignore`
  - `zip/dist/` created by `npm run build` and ignored by `.gitignore`
  - `zip/package-lock.json` timestamp updated by `npm install`

### Phase 41: Search & Notifications Panels
- **Status:** complete
- **Started:** 2026-06-21
- Actions taken:
  - Wired the top-nav Search button to an in-app global search panel.
  - Added global search results for events, todos, and inbox messages using the existing store data.
  - Wired event results to set the calendar date and open the event editor.
  - Wired todo and message results to switch the right panel to the relevant tab.
  - Wired the top-nav Notifications button to a Today summary panel.
  - Added Today counts for events, scheduled todos, open todos, habit logs, and backend mode.
  - Verified search and notifications in a browser with Playwright.
- Files modified:
  - `zip/src/App.tsx` updated
  - `zip/src/components/TopNav.tsx` updated

### Phase 42: Google Calendar Server-Side Skeleton
- **Status:** complete
- **Started:** 2026-06-21
- Actions taken:
  - Installed `googleapis`.
  - Added Vercel API functions for Google Calendar connect, OAuth callback, and manual read-only sync.
  - Added signed OAuth state handling and encrypted token storage for provider tokens.
  - Added a Supabase migration for calendar connection and imported-event upsert keys.
  - Loaded `calendar_connections` into the frontend store and subscribed to realtime changes.
  - Added left-sidebar Google Calendar connection/sync status controls.
  - Added `npm run calendar:doctor`.
  - Updated Supabase, Vercel, calendar sync, README, and implementation docs.
  - Regenerated `supabase/setup.sql` from three migration files.
- Files created/modified:
  - `zip/api/_googleCalendarShared.js` created
  - `zip/api/calendar/google/connect.js` created
  - `zip/api/calendar/google/callback.js` created
  - `zip/api/calendar/google/sync.js` created
  - `zip/scripts/check-calendar-api.mjs` created
  - `zip/supabase/migrations/20260621113000_google_calendar_oauth_readiness.sql` created
  - `zip/supabase/setup.sql` regenerated
  - `zip/src/types.ts` updated
  - `zip/src/lib/useCoupleSyncStore.ts` updated
  - `zip/src/components/Sidebar.tsx` updated
  - `zip/src/App.tsx` updated
  - `zip/package.json` updated
  - `zip/package-lock.json` updated
  - `zip/.env.example` updated
  - `zip/docs/CALENDAR_SYNC.md` updated
  - `zip/docs/SUPABASE_SETUP.md` updated
  - `zip/docs/VERCEL_DEPLOYMENT.md` updated
  - `zip/docs/IMPLEMENTATION_PLAN.md` updated
  - `zip/README.md` updated

### Phase 43: Live Supabase Verification Cleanup
- **Status:** in_progress
- **Started:** 2026-06-21
- Actions taken:
  - Confirmed `.env.local` exists and `npm run doctor` passes with Supabase env configured.
  - Confirmed live Supabase table endpoints are reachable with the anon key.
  - Updated `npm run verify:supabase` so a protected REST metadata root does not fail otherwise healthy table checks.
  - Added TypeScript excludes for generated build/output folders so `npm run lint` does not scan Vite artifacts.
  - Re-ran setup, live Supabase, type check, and production build verification.
- Files modified:
  - `zip/scripts/check-supabase-live.mjs` updated
  - `zip/tsconfig.json` updated
  - `task_plan.md` updated
  - `findings.md` updated
  - `progress.md` updated
  - `zip/docs/IMPLEMENTATION_PLAN.md` updated

## Test Results
| Test | Input | Expected | Actual | Status |
|------|-------|----------|--------|--------|
| Type check | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build | `npm run build` in `zip/` | Vite build succeeds | Passed, generated `dist/` | OK |
| Type check after Supabase work | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after Supabase work | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| Local dev server | `npm run dev` in `zip/` | Vite serves app | Running on `http://localhost:3000/` | OK |
| HTTP entrypoint | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Browser prompt/alert search | `rg -n "prompt\\(|alert\\(" zip/src` | No matches | No matches | OK |
| Type check after interaction polish | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after interaction polish | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| HTTP entrypoint after interaction polish | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Type check after drag/drop | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after drag/drop | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| HTTP entrypoint after drag/drop | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Type check after habit customization | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after habit customization | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| HTTP entrypoint after habit customization | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Type check after habit logging | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after habit logging | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| HTTP entrypoint after habit logging | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Type check after My Tasks | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after My Tasks | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| HTTP entrypoint after My Tasks | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Type check after direct events | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after direct events | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| HTTP entrypoint after direct events | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Type check after layer-aware events | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after layer-aware events | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| HTTP entrypoint after layer-aware events | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Type check after workspace invite UI | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after workspace invite UI | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| HTTP entrypoint after workspace invite UI | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Env status after workspace invite UI | `test -f zip/.env.local` | Identify backend status | `.env.local missing` | Pending external setup |
| Type check after event editing | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after event editing | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| HTTP entrypoint after event editing | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Setup doctor | `npm run doctor` in `zip/` | Report local setup status | Passed with 3 expected warnings for missing `.env.local` and Supabase env vars | OK |
| Type check after setup doctor | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after setup doctor | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| Vercel config JSON | `node -e "JSON.parse(...)"` in `zip/` | `vercel.json` parses | Passed | OK |
| Setup doctor after Vercel docs | `npm run doctor` in `zip/` | Vercel docs/config included and env gaps reported | Passed with 3 expected warnings | OK |
| Type check after Vercel readiness | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after Vercel readiness | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| Source stale-date search | `rg -n "2023-10\|new Date\\('2023\|2023" zip/src` | No hard-coded 2023 demo date remains | No matches | OK |
| Type check after live-date demo | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after live-date demo | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| Setup doctor after live-date demo | `npm run doctor` in `zip/` | Setup status still reported correctly | Passed with 3 expected warnings | OK |
| HTTP entrypoint after live-date demo | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Setup doctor after calendar sync guide | `npm run doctor` in `zip/` | Calendar sync docs included and env gaps reported | Passed with 3 expected warnings | OK |
| Type check after calendar sync guide | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after calendar sync guide | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| Type check after day/week drag scheduling | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after day/week drag scheduling | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| Setup doctor after day/week drag scheduling | `npm run doctor` in `zip/` | Setup status still reported correctly | Passed with 3 expected warnings | OK |
| HTTP entrypoint before dev restart | `curl -I http://localhost:3000/` | Identify server status | Connection failed because dev server was stopped | Expected transient |
| Local dev server restart | `npm run dev` in `zip/` | Vite serves app | Running on `http://localhost:3000/` | OK |
| HTTP entrypoint after dev restart | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| All-day support search | `rg -n "allDay|all_day|All-day" zip/src zip/supabase/...` | Confirm frontend and DB mappings exist | Matches found in types, mock data, store, calendar, dialog, and migration | OK |
| Type check after all-day events | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after all-day events | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| Setup doctor after all-day events | `npm run doctor` in `zip/` | Setup status still reported correctly | Passed with 3 expected warnings | OK |
| HTTP entrypoint after all-day events | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Habit idempotency search | `rg -n "isHabitLogged|ignoreDuplicates|onConflict|Logged" zip/src` | Confirm duplicate guard and UI label exist | Matches found in store and calendar selector | OK |
| Type check after habit idempotency | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after habit idempotency | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| Setup doctor after habit idempotency | `npm run doctor` in `zip/` | Setup status still reported correctly | Passed with 3 expected warnings | OK |
| HTTP entrypoint after habit idempotency | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Right todo sections search | `rg -n "Flexible|Scheduled|flexibleTodos|scheduledTodos|formatTodoDate" zip/src/components/RightPanel.tsx` | Confirm flexible/scheduled sections exist | Matches found | OK |
| Type check after scheduled todo sidebar sync | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after scheduled todo sidebar sync | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| Setup doctor after scheduled todo sidebar sync | `npm run doctor` in `zip/` | Setup status still reported correctly | Passed with 3 expected warnings | OK |
| HTTP entrypoint after scheduled todo sidebar sync | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Todo unschedule search | `rg -n "unassignTodoFromDate|Undo2|Move back|scheduled_date: null" zip/src` | Confirm store update and UI action exist | Matches found | OK |
| Type check after todo unscheduling | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after todo unscheduling | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| Setup doctor after todo unscheduling | `npm run doctor` in `zip/` | Setup status still reported correctly | Passed with 3 expected warnings | OK |
| HTTP entrypoint after todo unscheduling | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Runtime error banner search | `rg -n "clearError|Sync issue|Dismiss" zip/src` | Confirm store clear method and banner exist | Matches found | OK |
| Type check after runtime error banner | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after runtime error banner | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| Setup doctor after runtime error banner | `npm run doctor` in `zip/` | Setup status still reported correctly | Passed with 3 expected warnings | OK |
| HTTP entrypoint after runtime error banner | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Layer visibility merge search | `rg -n "layerIdsRef|isVisibleByDefault|previousLayerIds|validPrevious" zip/src ...` | Confirm merge state and mapping exist | Matches found | OK |
| Type check after layer visibility merge | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after layer visibility merge | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| Setup doctor after layer visibility merge | `npm run doctor` in `zip/` | Setup status still reported correctly | Passed with 3 expected warnings | OK |
| HTTP entrypoint after layer visibility merge | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Conversion error handling search | `rg -n "messageUpdateError|converted_event_id" zip/src/lib/useCoupleSyncStore.ts` | Confirm conversion update errors are checked | Matches found | OK |
| Type check after conversion error handling | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after conversion error handling | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| Setup doctor after conversion error handling | `npm run doctor` in `zip/` | Setup status still reported correctly | Passed with 3 expected warnings | OK |
| HTTP entrypoint after conversion error handling | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Day/week scheduled todo search | `rg -n "renderTodoButton|dayTodos = getTodosForDate|dayTodos.map" zip/src/components/Calendar.tsx` | Confirm shared renderer and day/week usage exist | Matches found | OK |
| Type check after day/week scheduled todos | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after day/week scheduled todos | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| Setup doctor after day/week scheduled todos | `npm run doctor` in `zip/` | Setup status still reported correctly | Passed with 3 expected warnings | OK |
| HTTP entrypoint after day/week scheduled todos | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Habit logger role search | `rg -n "loggerRole|currentUserRole|owner_role: loggerRole|log.user === currentUserRole" zip/src` | Confirm current-role habit ownership path exists | Matches found | OK |
| Type check after habit logger role | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after habit logger role | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| Setup doctor after habit logger role | `npm run doctor` in `zip/` | Setup status still reported correctly | Passed with 3 expected warnings | OK |
| HTTP entrypoint after habit logger role | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Habit log type tightening search | `rg -n "HabitRecord|user: User|ownerRole|user: 'both'" zip/src` | Confirm habit logs are role-only and remaining `both` is event data | Matches reviewed | OK |
| Type check after habit log type tightening | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after habit log type tightening | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| Setup doctor after habit log type tightening | `npm run doctor` in `zip/` | Setup status still reported correctly | Passed with 3 expected warnings | OK |
| HTTP entrypoint after habit log type tightening | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Habit dot actor label search | `rg -n "getHabitLabel|aria-label|dot.user ===" zip/src/components/Calendar.tsx` | Confirm habit dot label and actor border logic exists | Matches found | OK |
| Type check after habit dot actor labels | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after habit dot actor labels | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| Setup doctor after habit dot actor labels | `npm run doctor` in `zip/` | Setup status still reported correctly | Passed with 3 expected warnings | OK |
| HTTP entrypoint after habit dot actor labels | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Supabase setup helper help | `npm run setup:supabase -- --help` in `zip/` | Prints usage without writing `.env.local` | Passed | OK |
| Env file unchanged by helper help | `test -f .env.local` in `zip/` | Confirm no fake env file was created | `.env.local` absent | OK |
| Type check after Supabase setup helper | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after Supabase setup helper | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| Setup doctor after Supabase setup helper | `npm run doctor` in `zip/` | Helper script is checked and env gaps remain visible | Passed with 3 expected warnings | OK |
| HTTP entrypoint after Supabase setup helper | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Live Supabase verifier help | `npm run verify:supabase -- --help` in `zip/` | Prints usage without requiring credentials | Passed | OK |
| Live Supabase verifier missing-env behavior | `npm run verify:supabase` in `zip/` | Fails clearly before credentials exist | Failed with expected `.env.local` missing message | Expected pending setup |
| Setup doctor after live Supabase verifier | `npm run doctor` in `zip/` | Verifier script is checked and env gaps remain visible | Passed with 3 expected warnings | OK |
| Type check after live Supabase verifier | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after live Supabase verifier | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| HTTP entrypoint before dev restart after live verifier | `curl -I http://localhost:3000/` | Identify server status | Connection failed because dev server was stopped | Expected transient |
| Local dev server restart after live verifier | `npm run dev` in `zip/` | Vite serves app | Running on `http://localhost:3000/` | OK |
| HTTP entrypoint after live verifier | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Playwright CLI availability | `bash ~/.codex/skills/playwright/scripts/playwright_cli.sh --help` | Confirm browser automation tool runs | Passed after approved unsandboxed run due npm cache permissions | OK |
| Browser open smoke | `playwright-cli open http://localhost:3000/` | App renders in browser | Page opened; initial title was old AI Studio title and favicon 404 was observed | Needs cleanup |
| Favicon endpoint | `curl -I http://localhost:3000/favicon.svg` | Favicon asset is served | Returned `HTTP/1.1 200 OK` | OK |
| Browser title smoke | `playwright-cli open http://localhost:3000/` | Page title should be product name | Title is `CoupleSync` | OK |
| Browser console smoke | `playwright-cli console error` | No console errors after favicon fix | 0 errors, 0 warnings | OK |
| To-Do Box tab smoke | `playwright-cli click e343` | Right panel switches to To-Do Box | Flexible and Scheduled sections rendered | OK |
| To-Do creation smoke | Fill `New flexible task...` and click `Add` | Demo task is added | `Smoke test task` appeared in Flexible | OK |
| To-Do schedule smoke | Click the new task's `Today` action | Task moves to today's calendar date and Scheduled list | `Smoke test task` appeared on June 21 and Scheduled | OK |
| Browser smoke screenshot | `playwright-cli screenshot --filename output/playwright/couplesync-smoke.png` | Save visual evidence | Screenshot saved and visually inspected | OK |
| Type check after browser smoke | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after browser smoke | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| Setup doctor after browser smoke | `npm run doctor` in `zip/` | Setup status still reported correctly | Passed with 3 expected warnings | OK |
| HTTP entrypoint after browser smoke | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| External calendar readiness SQL review | `sed -n ... 20260621102000_external_calendar_sync_readiness.sql` | Confirm migration content | Adds sync columns, unique imported-event index, and realtime publication entry | OK |
| Setup doctor after external calendar DB readiness | `npm run doctor` in `zip/` | Second migration is checked and env gaps remain visible | Passed with 3 expected warnings | OK |
| Live verifier after external calendar DB readiness | `npm run verify:supabase` in `zip/` | Fails clearly before credentials exist | Failed with expected `.env.local` missing message | Expected pending setup |
| Type check after external calendar DB readiness | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after external calendar DB readiness | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| HTTP entrypoint after external calendar DB readiness | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Supabase SQL bundle help | `npm run sql:supabase -- --help` in `zip/` | Prints bundle usage | Passed | OK |
| Supabase SQL bundle generation | `npm run sql:supabase` in `zip/` | Generates one SQL file from ordered migrations | Wrote `supabase/setup.sql` from 2 migration files | OK |
| Supabase SQL bundle content search | `rg -n "20260621023000_initial_schema|20260621102000_external_calendar_sync_readiness|events_unique_external_per_couple_source|create table public.profiles" supabase/setup.sql` | Confirm bundle contains both migrations and key objects | Matches found | OK |
| Setup doctor after SQL bundle | `npm run doctor` in `zip/` | SQL bundle command is checked and env gaps remain visible | Passed with 3 expected warnings | OK |
| Type check after SQL bundle | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after SQL bundle | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| HTTP entrypoint after SQL bundle | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| GitHub OAuth helper help | `npm run oauth:github -- --help` in `zip/` | Prints OAuth helper usage | Passed | OK |
| GitHub OAuth helper missing-env behavior | `npm run oauth:github` in `zip/` | Fails clearly until Supabase URL exists | Failed with expected missing Supabase URL message | Expected pending setup |
| GitHub OAuth helper sample output | `npm run oauth:github -- --supabase-url https://abc123def456.supabase.co --app-url http://localhost:3000 --production-url https://couplesync.example.com` | Prints GitHub and Supabase OAuth fields | Printed callback, homepage, provider, and redirect settings | OK |
| Setup doctor after GitHub OAuth helper | `npm run doctor` in `zip/` | OAuth helper command is checked and env gaps remain visible | Passed with 3 expected warnings | OK |
| Type check after GitHub OAuth helper | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after GitHub OAuth helper | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| HTTP entrypoint after GitHub OAuth helper | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Vercel settings helper help | `npm run vercel:settings -- --help` in `zip/` | Prints Vercel helper usage | Passed | OK |
| Vercel settings helper default output | `npm run vercel:settings` in `zip/` | Prints project settings and missing env status | Passed; reported missing local Supabase values | OK |
| Vercel settings helper production URL output | `npm run vercel:settings -- --production-url https://couplesync.example.com --show-values` | Prints deployed URL reminder and env status | Passed; reported deployed URL and missing local env values | OK |
| Setup doctor after Vercel settings helper | `npm run doctor` in `zip/` | Vercel helper command is checked and env gaps remain visible | Passed with 3 expected warnings | OK |
| Type check after Vercel settings helper | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after Vercel settings helper | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| HTTP entrypoint after Vercel settings helper | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Top-nav utility search | `rg -n "onOpenSearch|Search CoupleSync|notificationsOpen|Today</h2>|Search events" zip/src/App.tsx zip/src/components/TopNav.tsx` | Confirm search and notification panel wiring exists | Matches found | OK |
| Type check after search/notifications | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after search/notifications | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| HTTP entrypoint after search/notifications | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Browser search panel smoke | Playwright click Search, fill `Dinner` | Search modal opens and returns a relevant result | `Dinner Date` event result rendered | OK |
| Browser notifications panel smoke | Playwright click Notifications | Today summary panel renders | Calendar, To-Dos, and Habits sections rendered | OK |
| Browser console after search/notifications | `playwright-cli console error` | No console errors | 0 errors, 0 warnings | OK |
| Setup doctor after search/notifications | `npm run doctor` in `zip/` | Setup status still reported correctly | Passed with 3 expected warnings | OK |
| Google Calendar SQL bundle generation | `npm run sql:supabase` in `zip/` | Bundle includes all migrations | Wrote `supabase/setup.sql` from 3 migration files | OK |
| Google Calendar SQL bundle content | `sed -n '635,650p' zip/supabase/setup.sql` | Third migration and indexes are present | `calendar_connections_unique_user_provider` and `events_unique_source_external_for_upsert` present | OK |
| Google Calendar API import smoke | `node -e "import('./api/calendar/google/connect.js')..."` in `zip/` | API modules import without syntax/runtime import errors | `api imports ok` | OK |
| Calendar API doctor | `npm run calendar:doctor` in `zip/` | Files/dependency pass and missing secrets are reported | 0 errors, 6 expected warnings | Expected pending setup |
| Setup doctor after Google Calendar skeleton | `npm run doctor` in `zip/` | New files/scripts are checked and env gaps remain visible | Passed with 3 expected warnings | OK |
| Static Google Calendar wiring search | `rg -n "Google Calendar|calendarConnections|startGoogleCalendarConnect|syncGoogleCalendar|calendar_connections_unique_user_provider|api/calendar/google|CALENDAR_TOKEN_ENCRYPTION_KEY|calendar:doctor" ...` | Confirm frontend, API, docs, env, package, and SQL wiring exists | Matches found | OK |
| Type check after Google Calendar skeleton | `npm run lint` in `zip/` | TypeScript passes | Passed | OK |
| Production build after Google Calendar skeleton | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |
| HTTP entrypoint after Google Calendar skeleton | `curl -I http://localhost:3000/` | Returns 200 | Returned `HTTP/1.1 200 OK` | OK |
| Setup doctor after live Supabase config | `npm run doctor` in `zip/` | Supabase env is present and local setup passes | Passed with 0 warnings | OK |
| Live Supabase verifier before hardening | `npm run verify:supabase` in `zip/` | Identify live schema status | Tables reachable, but REST metadata root returned protected 401 and failed the run | Needed verifier fix |
| Live Supabase verifier after hardening | `npm run verify:supabase` in `zip/` | Live schema/table checks pass | Passed; metadata root protected for anon key, all expected tables reachable | OK |
| Type check after verifier hardening | `npm run lint` in `zip/` | TypeScript passes | Passed after excluding generated output folders | OK |
| Production build after verifier hardening | `npm run build` in `zip/` | Vite build succeeds | Passed with chunk-size warning | OK |

## Error Log
| Timestamp | Error | Attempt | Resolution |
|-----------|-------|---------|------------|
| 2026-06-21 | `git status --short` failed because the folder is not a git repository | 1 | Noted limitation; used file listing/stat checks instead |
| 2026-06-21 | `ImportMeta.env` type missing during TypeScript check | 1 | Added `zip/src/vite-env.d.ts` with Vite client reference |
| 2026-06-21 | In-app browser control failed before navigation with missing sandbox metadata | 1 | Logged the tool issue and continued with code-level verification plus the next local product feature |
| 2026-06-21 | `curl -I http://localhost:3000/` failed because Vite was not running | 1 | Restarted `npm run dev` and confirmed `HTTP/1.1 200 OK` |
| 2026-06-21 | Playwright CLI wrapper could not write to `~/.npm` inside the sandbox | 1 | Reran the exact wrapper command with approved escalation and confirmed CLI availability |
| 2026-06-21 | `npm run verify:supabase` failed on `/rest/v1/` metadata with anon key even though app tables were reachable | 1 | Treated protected REST metadata as OK when table probes succeed |
| 2026-06-21 | `npm run lint` scanned a stale `dist/assets` file while Vite build was rewriting output | 1 | Added `dist`, `output`, `.playwright-cli`, and `node_modules` to `tsconfig.json` excludes |

## 5-Question Reboot Check
| Question | Answer |
|----------|--------|
| Where am I? | Phase 42: Google Calendar Server-Side Skeleton complete; live Supabase setup still pending |
| Where am I going? | Live Supabase setup, Auth/RLS/Realtime verification, Vercel deployment, then real Google Calendar OAuth/sync verification |
| What's the goal? | Turn the static CoupleSync UI into a persistent, realtime Supabase-backed couple calendar app |
| What have I learned? | See `findings.md` |
| What have I done? | Added implementation docs, Supabase migration, Supabase client, Auth UI, workspace UI, data store, and build verification |

## 5-Question Reboot Check Update
| Question | Answer |
|----------|--------|
| Where am I? | Phase 43: live Supabase config is verified; GitHub OAuth/workspace behavior is user-reported working locally |
| Where am I going? | Two-session Realtime verification, then Vercel deployment, then real Google Calendar OAuth/sync verification |
| What's the goal? | Turn the static CoupleSync UI into a persistent, realtime Supabase-backed couple calendar app with deployment and calendar sync |
| What have I learned? | Supabase table endpoints are healthy; `/rest/v1/` metadata can be protected for anon keys without indicating app failure |
| What have I done? | Fixed verifier accuracy, stabilized TypeScript checks, and updated the project progress records |

## Phase 44 PM/Tech Lead Health Check
Date: 2026-06-22

### Summary
- User reports the MVP is live on Vercel at `https://couple-calendar-sigma.vercel.app`, with Supabase real writes, GitHub OAuth, invite codes, role display, drag-to-calendar todos, and two-end Realtime working.
- Confirmed `DESIGN.md` is not present in the workspace; the audit used the original five core requirements plus the current repo docs.
- Applied minimal mobile UI polish: mobile top-nav wrapping, automatic mobile side-panel collapse, overlay-style side drawers, and tighter mobile calendar spacing.
- Local Git is connected to `https://github.com/Observer-1013/Couple-calendar.git`; current polish changes are local-only until committed and pushed.

### Verification
| Check | Command / Tool | Result |
|-------|----------------|--------|
| Type check | `npm run lint` in `zip/` | Passed |
| Production build | `npm run build` in `zip/` | Passed with existing chunk-size warning |
| Setup doctor | `npm run doctor` in `zip/` | Passed; Supabase env present |
| Live Supabase schema | `npm run verify:supabase` in `zip/` | Passed; all expected table endpoints reachable |
| Local mobile render | Playwright at `http://localhost:3001/`, 390x844 | 日/周/月/年 visible, side panels collapsed, no horizontal overflow |
| Mobile drawer behavior | Playwright left/right drawer screenshots | Drawers overlay the calendar without increasing document width |
| Local desktop render | Playwright at `http://localhost:3001/`, 1440x1000 | Three-column layout intact; document width equals viewport |
| Live Vercel HTTP | `curl -I https://couple-calendar-sigma.vercel.app` | Returned 200 from Vercel |
| Live Vercel browser smoke | Playwright at the production URL | Title `CoupleSync`, GitHub login button visible, 0 console errors |
| Release path | `git status --short --branch` and `git remote -v` | Branch tracks `origin/main`; 5 UI files modified locally |

### Screenshots
- Mobile after polish: `zip/output/playwright/mobile-after-polish.png`
- Mobile left drawer: `zip/output/playwright/mobile-left-drawer-after-polish.png`
- Mobile right drawer: `zip/output/playwright/mobile-right-drawer-after-polish.png`
- Desktop after polish: `zip/output/playwright/desktop-after-polish.png`
- Live production auth smoke: `zip/output/playwright/live-mobile-smoke.png`

### Release Note
- The live site currently serves asset files different from the latest local build (`index-DhVCpYPU.js` live vs `index-DJ9XLkbq.js` local build), so the mobile polish is not deployed yet.
- The UI polish commit has now been pushed; the remaining release question is whether the Vercel project is actually connected to the GitHub repo/branch/root and whether the deployment for the latest commit is queued, failed, or missing.

## Phase 44 Release Attempt
Date: 2026-06-22

### Summary
- Created commit `76b9306` (`Polish mobile layout and record health check`) and pushed it to `origin/main`.
- Verified `git ls-remote origin refs/heads/main` and local `HEAD` both point to `76b9306d7dce29a57cd0114319b31f2333ea8acc`.
- Fixed local tracking state with `git fetch origin main` after the initial push succeeded but sandbox permissions blocked updating `.git/refs/remotes/origin/main`.
- Local Git is now clean and aligned with `origin/main`.

### Vercel Status
- After waiting and polling the production URL, `https://couple-calendar-sigma.vercel.app` still served the previous deployment: `last-modified: Sun, 21 Jun 2026 17:02:45 GMT`.
- The live HTML still referenced `/assets/index-DhVCpYPU.js` and `/assets/index-3f7MBCgr.css`, while the latest local production build references `/assets/index-DJ9XLkbq.js` and `/assets/index-DNerL9zV.css`.
- `npx vercel inspect` could not inspect the project because the local Vercel CLI has no login credentials and entered device-login flow.
- The unauthenticated Vercel deployments API returned `missingToken`, so deployment queue/status cannot be inspected without the user's Vercel login/session.

### Next Release Check
- Open Vercel Dashboard for `couple-calendar-sigma` and inspect Deployments after commit `76b9306`.
- If no deployment exists for `76b9306`, reconnect the Vercel project to GitHub repo `Observer-1013/Couple-calendar`, branch `main`, with root directory `zip`.
- If a failed deployment exists, inspect the build log and fix the reported build/root/env issue.

## Phase 44 Vercel Freshness Verifier
Date: 2026-06-22

### Summary
- Added `npm run verify:vercel`, implemented by `scripts/check-vercel-deployment.mjs`.
- The verifier compares `dist/index.html` asset references against the HTML served by a production Vercel URL.
- The script requires no Vercel token and falls back to `curl` when Node fetch cannot reach Vercel from the local environment.
- Added the verifier to `npm run doctor` and documented it in `docs/VERCEL_DEPLOYMENT.md`.

### Verification
| Check | Command | Result |
|-------|---------|--------|
| Vercel freshness verifier | `npm run verify:vercel -- --production-url https://couple-calendar-sigma.vercel.app` | Failed as expected: production assets differ from local build |
| Production HTTP | same command | 200 from Vercel; `last-modified: Sun, 21 Jun 2026 17:02:45 GMT`; `x-vercel-cache: HIT` |
| Local assets | same command | `/assets/index-DJ9XLkbq.js`, `/assets/index-DNerL9zV.css` |
| Production assets | same command | `/assets/index-DhVCpYPU.js`, `/assets/index-3f7MBCgr.css` |
| Doctor | `npm run doctor` | Passed with `npm run verify:vercel` included |
| Type check | `npm run lint` | Passed |

### Current Release Diagnosis
- The latest code is pushed to GitHub, but the production domain still serves the previous Vercel asset bundle.
- The release-chain issue is now reproducible with `npm run verify:vercel -- --production-url https://couple-calendar-sigma.vercel.app`.
- Remaining required evidence is in Vercel Dashboard: whether the latest GitHub commit triggered a deployment, failed a build, or is not connected to this production project.

## Phase 44 Production Verification Complete
Date: 2026-06-22

### Summary
- Changed this repository's local Git author to `Observer-1013 <210874204+Observer-1013@users.noreply.github.com>`.
- Created and pushed empty commit `10b5a17` (`Trigger deploy with Observer-1013 author`) to trigger Vercel with the correct Git author.
- Vercel Dashboard showed commit `10b5a17` as `Ready` and `Production`; previous `LLL664`-authored deployments remained blocked.
- `npm run verify:vercel -- --production-url https://couple-calendar-sigma.vercel.app` now passes.
- Production now serves the same asset bundle as the latest local build: `/assets/index-DJ9XLkbq.js` and `/assets/index-DNerL9zV.css`.
- Playwright mobile smoke opened the production URL at 390x844, saw the `CoupleSync` Auth screen and `Continue with GitHub` button, and reported 0 console errors.

### Evidence
| Check | Evidence | Result |
|-------|----------|--------|
| Git author | `git log -1 --format=...` after `10b5a17` | Author and committer are `Observer-1013` |
| GitHub sync | `git log --oneline --decorate -4` | `10b5a17` is `HEAD`, `origin/main`, and `origin/HEAD` |
| Production freshness | `npm run verify:vercel -- --production-url https://couple-calendar-sigma.vercel.app` | Passed |
| Production HTML headers | verifier output | 200 from Vercel; `last-modified: Sun, 21 Jun 2026 18:34:06 GMT` |
| Production mobile smoke | Playwright snapshot and console | Auth screen rendered; 0 errors, 0 warnings |
| Production screenshot | `zip/output/playwright/live-mobile-after-deploy.png` | Saved |
