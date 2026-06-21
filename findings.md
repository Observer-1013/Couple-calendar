# Findings & Decisions

## Requirements
- User has a generated static CoupleSync UI and wants a concrete plan for turning it into a full-stack app.
- Preserve the existing visual design: React or Next.js, Tailwind CSS, glassmorphism, low-saturation colors, three-column layout, collapsible sidebars.
- Backend target: Supabase PostgreSQL, Supabase Auth, Supabase Realtime.
- Deployment target: Vercel.
- Later integrations: Google Calendar API and Apple/iCloud calendar sync.
- Required product modules: multi-view calendar, layer management, habit dots, personal/shared todos with drag-to-calendar, threaded couple inbox.
- Repository policy: minimal diff; no silent deletion; any deletion requires global reference checks and user confirmation.

## Research Findings
Early bullets in this section record the initial generated prototype state; later bullets record the current implementation state after each phase.
- Project is a Vite React 19 app with Tailwind CSS v4, date-fns, lucide-react, clsx/tailwind-merge, motion, and AI Studio/Gemini-related dependencies.
- The current app is a static/local-state prototype: all product data comes from `src/mockData.ts` and `useState` inside `src/App.tsx`.
- There is no Supabase client, no auth flow, no database schema, no realtime subscription, no routing, no drag-and-drop library, and no calendar API integration yet.
- The UI already includes the main three-column layout, collapsible left/right panels, top calendar view switcher, layer visibility toggles, month/week/day/year views, mock habits, mock events, inbox cards, and flexible todo cards.
- Current date/data are pinned to October 2023 in `src/App.tsx` and `src/mockData.ts`; this is useful for a design demo but must be replaced for production use.
- The right panel simulates inbox reply with `prompt`/`alert`, converts a message into an event with a date prompt, and can assign flexible todos to today's date via a button.
- Calendar month view supports checking scheduled todos; right-side flexible todo checkboxes are read-only and do not currently toggle state.
- The "drag to schedule" requirement is not implemented; current assignment is a Today button only.
- Inbox threads are not implemented; messages are flat records without parent/reply relationships.
- Custom layers and habit customization are not implemented; the create/archive/sidebar buttons show placeholder alerts.
- `npm run lint` passes.
- `npm run build` passes and produced `dist/`.
- Supabase Auth integrates with PostgreSQL and RLS, so the app should model couple-scoped data in public tables tied back to `auth.users`.
- Supabase Realtime can subscribe to Postgres table changes, but tables must be added to the realtime publication.
- Vercel has direct Vite deployment support; Vite env vars exposed to browser code should use the `VITE_` prefix.
- Google Calendar web integration requires enabling the Google Calendar API, configuring OAuth consent, creating a Web application OAuth Client ID, and an API key.
- Apple/iCloud calendar integration is not as straightforward as Google Calendar. Apple documents app-specific passwords for third-party access to iCloud calendars, but this should be handled later and probably server-side instead of inside the browser.
- Added `@supabase/supabase-js` version `^2.108.2`.
- Added a Supabase migration under `zip/supabase/migrations/` with profiles, couples, couple members, layers, events, habit definitions, habit logs, todos, inbox messages, calendar connection placeholders, RLS, default seeding, and realtime publication setup.
- Added GitHub OAuth login UI through Supabase Auth. It will only activate after `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured.
- Added a create/join couple workspace UI. The SQL migration provides RPCs for creating a workspace and joining by invite code.
- Added a Supabase-aware data store that falls back to mock data when Supabase env vars are missing.
- Type check passes after adding `src/vite-env.d.ts`.
- Production build passes. Vite emits a chunk-size warning because adding Supabase increases the main JS bundle above 500 kB; this is a warning, not a build failure.
- Replaced core browser `prompt` flows with in-app forms/dialogs for editing names, adding todos, and converting inbox messages into events.
- Added inbox message composition and threaded replies. Replies use `inbox_messages.parent_id` when Supabase is configured and nested local state in demo mode.
- Added custom layer creation with color selection. New layers write to Supabase `layers` when configured and to local state in demo mode.
- Removed remaining browser `alert`/`prompt` matches from `zip/src`.
- Added native drag-to-calendar scheduling for month view. Flexible todos and inbox messages can now be dragged from the right panel onto a month date cell.
- Dropping a todo calls the existing todo scheduling path, which updates local demo state or Supabase `todos.scheduled_date` when configured.
- Dropping a message calls the existing message-to-event path with default `09:00` to `10:00`, which updates local demo state or Supabase `events` plus `inbox_messages.converted_event_id` when configured.
- Added habit definition loading and creation. The sidebar lists active habits with color dots and can create new habit definitions in demo state or Supabase `habit_definitions`.
- Added month-view habit logging. A plus control on each current-month day opens a habit selector and writes a local `HabitRecord` or Supabase `habit_logs` row.
- Added a unique index to the initial migration to prevent duplicate habit logs for the same couple, habit, date, and owner role.
- Added the left-sidebar My Tasks section. It shows unscheduled tasks assigned to the current user's role, supports adding new personal tasks, and toggles completion using the same todo persistence path as the rest of the app.
- Added direct event creation. The calendar header opens a New Event dialog, and the store persists events to local demo state or Supabase `events`.
- Event creation now supports owner and layer selection. Supabase mode writes `owner_role` and `layer_id`; demo mode stores `user` and `layerId`.
- Calendar event filtering and styling now prefer selected layers. Custom layer visibility can hide/show its events, and layer colors are used when rendering event blocks.
- Added `zip/docs/SUPABASE_SETUP.md` with concrete steps for Supabase project creation, SQL migration, GitHub OAuth, Auth URLs, and `.env.local`.
- Sidebar now surfaces backend status, workspace name, current role, and invite code copy action when a real Supabase workspace exists.
- Added event editing for existing calendar blocks. Month, day, and week event blocks open the event dialog, and updates persist to local demo state or Supabase `events`.
- Event layer select values now use `databaseId || id` so Supabase-loaded events can correctly round-trip their layer assignment.
- Message-to-event scheduling now respects the dialog's owner and layer selections instead of always creating shared default-layer events.
- Added `npm run doctor`, a local setup checker for required Supabase files, package scripts, dependency, and `.env.local` values.
- Current `npm run doctor` output shows code/migration/docs are present and `.env.local`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` are still missing.
- Confirmed from Vercel's Vite docs that Vite projects can be deployed directly and SPA Vite apps can use `vercel.json` rewrites to fall back to `index.html`.
- Added `zip/vercel.json` with a single-page-app rewrite and `zip/docs/VERCEL_DEPLOYMENT.md` with Vercel root, build, output, env var, and Supabase Auth URL steps.
- Replaced the hard-coded October 2023 initial date with today's local date at noon.
- Demo events, todos, habits, and inbox timestamps are now generated in the current month so demo mode remains populated before Supabase is connected.
- Static search found no remaining `2023` date references in `zip/src`.
- Added `zip/docs/CALENDAR_SYNC.md` with Google Calendar setup steps, Apple/iCloud constraints, token-storage rules, and recommended sync implementation order.
- Calendar sync should wait until live Supabase Auth/RLS/Realtime is verified because imported events need real user identity, couple membership, and owner roles.
- Extended drag-to-calendar scheduling beyond month view. Day/week header date blocks and time columns now accept right-panel todo/message drops.
- Day/week drops reuse the existing typed drag payload and the same Supabase/mock persistence functions as month-view drops.
- Added all-day event support across type definitions, Supabase loading, event insert/update, demo data, and the create/edit event dialog.
- Day/week timed grids now keep all-day events in the all-day header area instead of placing them on the hourly axis.
- Habit logging is now idempotent. Demo mode checks existing logs by date, owner, id, slug, or name; Supabase writes use `upsert` with `ignoreDuplicates` on the unique habit-log key.
- The habit selector now disables already-logged habits and labels them as `Logged`.
- Right-side To-Do Box now keeps scheduled todos visible instead of filtering them out after drag/drop.
- Right-side todos are split into `Flexible` and `Scheduled` sections, and scheduled rows show their calendar date while sharing the same completion state as calendar checkboxes.
- Scheduled todos can now be moved back to the flexible list. The store clears local `date` or Supabase `scheduled_date` without deleting the todo.
- Main app runtime data errors now show in a dismissible `Sync issue` banner. Auth and workspace setup screens keep their existing local error displays.
- Layer reloads now preserve hidden existing layers while automatically activating newly seen Supabase layers whose `is_visible_by_default` is true.
- Message-to-event conversion now checks the second Supabase write. If updating `inbox_messages.converted_event_id` fails after event creation, the error is surfaced through the store error banner.
- Scheduled todos now render in day/week header date areas as well as month cells, using the same checkbox toggle path.
- Habit logs now record the current user's couple role instead of the habit definition owner, so shared habits can still answer who completed the habit.
- Habit duplicate checks and the habit selector's `Logged` state now use the same current-user role.
- Frontend `HabitRecord.user` is now restricted to `him | her`. Demo habit logs no longer use `both`, and legacy Supabase `both` habit logs are coerced to a concrete role on load.
- Month-view habit dots now expose a label containing both habit name and completing partner through `title` and `aria-label`.
- Habit dots also use partner-colored borders, so same-color shared habits can still show who completed them.
- Added `npm run setup:supabase`, which writes `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local` interactively or from CLI flags.
- The setup helper preserves existing `.env.local` entries and validates that the URL looks like a Supabase project URL and the key is not placeholder-like.
- `npm run doctor` now verifies that the Supabase setup helper is available.
- Added `npm run verify:supabase`, which loads `.env.local`, checks Supabase REST reachability, and probes the expected table endpoints with the anon public key.
- The live verifier treats permission/RLS responses as evidence that a table exists but is protected before login; missing-table responses are reported as migration failures.
- Without `.env.local`, `npm run verify:supabase` exits with the expected setup error and points back to `docs/SUPABASE_SETUP.md`.
- Playwright browser smoke opened the local demo app at `http://localhost:3000/` and confirmed the page title is `CoupleSync`.
- The browser snapshot confirmed month view, sidebars, layer controls, habit labels such as `vocabulary by Leo`, and the right-side To-Do Box render in demo mode.
- A demo task named `Smoke test task` was added through the To-Do Box, scheduled to today's date, and appeared in the June 21 calendar cell and Scheduled list.
- Browser console errors are now clear during smoke verification. The previous `/favicon.ico` 404 was fixed by adding `public/favicon.svg` and an explicit favicon link.
- Playwright smoke evidence is saved at `zip/output/playwright/couplesync-smoke.png`; generated Playwright artifact folders are ignored by `.gitignore`.
- Added `supabase/migrations/20260621102000_external_calendar_sync_readiness.sql` as a follow-up migration after the initial schema.
- The follow-up migration adds `calendar_connections.sync_status`, `last_synced_at`, and `last_sync_error` for future Google/Apple sync reporting.
- The follow-up migration adds a unique partial index on imported external events: `couple_id + source + external_id` for Google/Apple rows.
- The follow-up migration adds `calendar_connections` to the Supabase realtime publication so future connection status changes can update the UI.
- Supabase setup docs now instruct running SQL files in filename order, and `npm run doctor` checks for both migration files.
- `npm run verify:supabase` now probes `events.source`, `events.external_id`, and the calendar connection sync-status columns when credentials exist.
- Added `npm run sql:supabase`, which generates `supabase/setup.sql` by concatenating `supabase/migrations/*.sql` in filename order.
- The generated SQL bundle currently contains both the initial schema and external calendar readiness migration. Static search confirmed both migration headings and the imported-event unique index are present.
- Supabase setup docs now prefer copying `zip/supabase/setup.sql` into SQL Editor once, while preserving the option to run each migration individually.
- Added `npm run oauth:github`, which prints the GitHub OAuth App homepage/callback settings plus the matching Supabase Auth provider and URL configuration fields.
- The OAuth helper reads `VITE_SUPABASE_URL` from `.env.local` when present, or accepts `--supabase-url` before env setup is complete.
- The OAuth helper does not read or print GitHub Client Secrets; it only prints where the user should paste the GitHub Client ID and Secret in Supabase.
- Added `npm run vercel:settings`, which prints the Vercel Vite project settings, required `VITE_SUPABASE_*` env variable names, and Supabase Auth redirect URL reminders.
- The Vercel helper works before `.env.local` exists by reporting missing local values; with `--show-values`, it can print browser-safe local `VITE_` values for dashboard copying.
- The Vercel deployment docs now reference the helper for project settings, env var copying, and post-deploy Supabase Auth URL updates.
- The top-nav Search button now opens an in-app global search panel instead of being passive.
- Global search covers current events, todos, and inbox messages from the store. Event results can jump to the event date and open the editor; todo results can switch to the To-Do Box; message results can switch to the inbox.
- The top-nav Notifications button now opens a Today summary panel that shows today's calendar items, scheduled/open todo counts, habit-log count, and whether the app is in demo or Supabase mode.
- Browser smoke confirmed searching for `Dinner` returns the demo `Dinner Date` event and that the notifications panel renders the Today summary sections without console errors.
- Installed `googleapis` and added Vercel Node.js API functions under `api/calendar/google/` for read-only Google Calendar connect, OAuth callback, and manual sync.
- Google OAuth state is signed, provider tokens are encrypted before storage, and the server functions use Supabase service-role access only on the server side.
- Added `20260621113000_google_calendar_oauth_readiness.sql`, which creates unique indexes for calendar connection upserts and imported-event upserts.
- The left sidebar now surfaces Google Calendar connection status from `calendar_connections` and exposes Connect/Sync actions when Supabase/workspace state is available.
- Added `npm run calendar:doctor`, which checks Google Calendar API files, `googleapis`, and the server-only env vars needed for deployment.
- Regenerated `supabase/setup.sql`; it now combines all three migration files in filename order.
- Live Supabase env is now configured locally. `npm run doctor` passes with the Supabase Project URL and anon key present.
- The live Supabase verifier now treats a protected REST metadata root as acceptable when actual table endpoints are reachable with the anon key.
- `npm run verify:supabase` now passes against the configured Supabase project and confirms the expected app tables are reachable.
- TypeScript checks now exclude build/output artifacts, avoiding transient `dist/assets` races when lint/build are run close together.
- The user reports GitHub OAuth login, role display, invite code, drag-to-calendar todos, and database persistence are working in the local UI.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Defer code edits until after discovery | Current request is primarily planning and orientation. |
| Keep Vite React for the first implementation milestone | The generated app already builds successfully; migrating to Next.js before core data logic would add avoidable churn. |
| Treat Google/Apple calendar sync as post-MVP | Auth, persistence, couple binding, events, todos, habits, and inbox should exist before external calendar sync is useful. |
| Keep mock fallback in the same store | This lets local development continue before the user creates a Supabase project. |
| Use security-definer RPCs for create/join workspace | This avoids RLS edge cases during initial couple creation and invite-code joins. |
| Make top-nav utilities functional before live Auth | Search and Today summaries use existing store data, so they improve the product without adding new backend risk before Supabase credentials exist. |
| Implement first drag/drop pass with native HTML5 drag events | It avoids adding a library before the app has live backend credentials, and keeps the behavioral surface small. |
| Implement habit customization as definitions first | This satisfies the custom habit name/color requirement and prepares a clean follow-up for day-level logging. |
| Keep personal tasks in `todos` | This avoids duplicate task schemas and uses `assignee_role` to distinguish personal versus shared work. |
| Make manual event creation a first-class flow | This removes the earlier limitation where events could only be created by converting inbox messages. |
| Resolve event display from layer first, owner second | This lets custom layers work without breaking existing his/her/shared schedule defaults. |
| Add setup guidance as a repo document | The user needs account-owner actions for Supabase/GitHub, so the required clicks and URLs should be durable in the project. |
| Add event editing without delete controls | Editing is a normal persistence path; deletion needs an explicit confirmed workflow under the user's no-silent-deletion rule. |
| Keep setup doctor non-failing by default | The current expected state is missing external credentials, so `npm run doctor` should explain the gap without blocking ordinary local work. |
| Add Vercel config without changing the app framework | Vite remains sufficient for this MVP; a rewrite config and deployment doc are enough for SPA deployment readiness. |
| Keep mock data dynamic instead of deleting it | Demo/mock mode is still useful until Supabase exists; making it current is better than removing the sample content. |
| Document calendar sync before coding OAuth | Provider credentials and callback URLs are external-account work; writing the token flow before live Supabase exists would create untestable auth code. |
| Reuse native drag/drop across calendar views | The current requirement is date assignment, so the same payload can cover month/day/week without a new drag library. |
| Round-trip `all_day` before external calendar sync | Google/Apple imports need all-day semantics; ignoring the existing database field would lose event meaning. |
| Prevent duplicate habit logs before adding cancellation | The migration already has a unique index; matching frontend behavior avoids noisy errors without adding deletion semantics. |
| Keep scheduled todos in the right panel | This is required for bidirectional visual sync between calendar checkboxes and the shared todo box. |
| Unscheduling is a non-destructive update | Clearing `scheduled_date` preserves the task and its completion state while returning it to the flexible box. |
| Make store errors visible before live Supabase testing | Real Auth/RLS/Realtime setup will produce actionable errors; hiding them would make debugging unnecessarily opaque. |
| Track known layer ids during reloads | A ref lets the store distinguish new default-visible layers from existing layers the user manually hid. |
| Check cross-table conversion writes separately | Event creation and message marking can fail independently; each failure needs visible error handling. |
| Reuse one todo checkbox renderer in calendar views | Shared rendering keeps completion behavior consistent between month/day/week views. |
| Use the current role for habit log ownership | A shared habit definition is not the actor; `habit_logs.owner_role` should represent the person who logged it. |
| Tighten habit record ownership in TypeScript | Compile-time types should match the product meaning that a habit log is an action by one partner. |
| Label habit dots with actor context | Color alone represents the habit type, so the UI needs a separate accessible signal for which partner completed it. |
| Automate local env writing without owning the account | Supabase project creation still requires user login, but local credential entry can be scripted to reduce setup errors. |
| Verify live Supabase before app-level Auth debugging | A REST/table probe separates wrong URL/key/missing migration problems from browser login and realtime issues. |
| Keep browser smoke as a local verification layer | Type/build checks do not prove the UI renders or core demo interactions work in a real browser. |
| Add external sync durability before provider OAuth | Provider imports need duplicate protection and visible status/errors before user-facing sync controls are enabled. |
| Keep migrations as source and setup SQL as generated convenience | The ordered migration files stay authoritative; `supabase/setup.sql` is a lower-friction copy/paste artifact for the dashboard. |
| Print OAuth settings instead of storing OAuth secrets | GitHub Client Secret remains user-owned; the app only needs deterministic URLs and clear setup fields. |
| Print deployment settings instead of invoking Vercel login | Vercel account binding is user-owned, but the required dashboard configuration can be made deterministic. |
| Put Google Calendar OAuth in Vercel Functions | Provider tokens and Google client secrets must stay server-side; the browser only starts OAuth and displays sync state. |
| Encrypt provider tokens before database storage | `calendar_connections.token_reference` should not contain plaintext OAuth credentials. |
| Treat Supabase REST metadata protection separately from table reachability | A protected `/rest/v1/` metadata response can still mean the project is healthy when table probes succeed with the anon key. |
| Exclude generated output from TypeScript checks | Build artifacts are not source files and can race with Vite output rewriting. |

## Issues Encountered
| Issue | Resolution |
|-------|------------|

## Resources
- Project root: `/Users/lihaoyu/Documents/个人/Couple calendar`
- Generated app directory: `/Users/lihaoyu/Documents/个人/Couple calendar/zip`
- Main app state: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/src/App.tsx`
- UI components: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/src/components/`
- Types: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/src/types.ts`
- Mock data: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/src/mockData.ts`
- Supabase Auth docs: https://supabase.com/docs/guides/auth
- Supabase Realtime Postgres Changes docs: https://supabase.com/docs/guides/realtime/postgres-changes
- Supabase RLS docs: https://supabase.com/docs/guides/database/postgres/row-level-security
- Vercel Vite docs: https://vercel.com/docs/frameworks/frontend/vite
- Google Calendar JavaScript quickstart: https://developers.google.com/workspace/calendar/api/quickstart/js
- Apple app-specific passwords support: https://support.apple.com/en-us/102654
- Implementation plan: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/docs/IMPLEMENTATION_PLAN.md`
- Initial Supabase migration: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/supabase/migrations/20260621023000_initial_schema.sql`
- External calendar readiness migration: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/supabase/migrations/20260621102000_external_calendar_sync_readiness.sql`
- Generated Supabase SQL bundle: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/supabase/setup.sql`
- Supabase client: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/src/lib/supabase.ts`
- Supabase/Auth session hook: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/src/lib/useSupabaseSession.ts`
- Data store: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/src/lib/useCoupleSyncStore.ts`
- Top navigation: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/src/components/TopNav.tsx`
- Drag/drop helper: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/src/lib/calendarDrag.ts`
- Supabase setup guide: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/docs/SUPABASE_SETUP.md`
- Calendar sync guide: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/docs/CALENDAR_SYNC.md`
- Vercel deployment guide: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/docs/VERCEL_DEPLOYMENT.md`
- Vercel SPA config: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/vercel.json`
- Setup doctor: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/scripts/check-setup.mjs`
- Supabase env helper: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/scripts/configure-supabase-env.mjs`
- GitHub OAuth settings helper: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/scripts/print-github-oauth-settings.mjs`
- Vercel settings helper: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/scripts/print-vercel-settings.mjs`
- Google Calendar API doctor: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/scripts/check-calendar-api.mjs`
- Live Supabase verifier: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/scripts/check-supabase-live.mjs`
- Google Calendar API functions: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/api/calendar/google/`
- Browser smoke screenshot: `/Users/lihaoyu/Documents/个人/Couple calendar/zip/output/playwright/couplesync-smoke.png`

## Visual/Browser Findings
- Playwright search smoke verified the Search button opens the `Search CoupleSync` dialog, accepts text input, and returns the expected `Dinner Date` event result in demo mode.
- Playwright notifications smoke verified the Notifications button opens the Today panel with Calendar, To-Dos, and Habits sections.
- Browser console smoke after the search/notifications flow reported 0 errors and 0 warnings.

## Phase 44 Health Check Findings
- Mobile UX risk found and fixed: the generated three-column layout could leave both sidebars expanded on a phone-sized viewport, making the central month calendar feel cramped. The app now collapses both panels on mobile and opens them as overlay drawers.
- Mobile top navigation risk found and fixed: the 日/周/月/年 segmented control could be squeezed out by the header actions. The header now wraps and keeps view switching visible on 390px-wide screens.
- Month view on mobile is now stable and scroll-free, but still dense by nature. It works as a glanceable overview; day/week views remain the better high-frequency mobile interaction surfaces.
- Desktop layout remained intact after the mobile changes. At 1440x1000, the app kept both side panels open, the main calendar width was 844px, and there was no horizontal overflow.
- Code-quality scan found no active app-level `console.log` or `debugger` statements in `zip/src` or `zip/api`.
- `zip/src/mockData.ts` is still intentionally imported by `useCoupleSyncStore` as the no-Supabase demo fallback. It is not the production path when Supabase env/session are present, so it should not be deleted without a separate confirmed cleanup decision.
- `DESIGN.md` was not present in the workspace during this audit. UI conclusions were based on the original five core requirements, generated design direction, and the current implementation docs.
- The production domain `https://couple-calendar-sigma.vercel.app` serves a valid Vercel page with `CoupleSync` title and GitHub login entry, but it does not yet include the latest local mobile polish because those changes have not been committed and pushed.
