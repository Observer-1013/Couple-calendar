# Task Plan: CoupleSync Full-Stack Build

## Goal
Turn the existing static CoupleSync UI into a persistent, realtime Supabase-backed couple calendar app while preserving the generated design and using minimal, staged code changes.

## Current Phase
Phase 44

Current update: Phase 44 is underway after the user-reported Vercel deployment, GitHub OAuth, Supabase persistence, invite-code flow, drag-to-calendar todos, and two-end Realtime success. The current focus is PM/Tech Lead health checking, mobile UX polish, and confirming the local-GitHub-Vercel release path.

## Phases

### Phase 1: Requirements & Code Discovery
- [x] Read the current project files under `zip/`
- [x] Identify implemented UI, missing logic, and technical constraints
- [x] Document findings in `findings.md`
- **Status:** complete

### Phase 2: Architecture & Data Model
- [x] Define Supabase tables, relationships, and realtime scope
- [x] Decide frontend state/auth integration approach
- [x] Separate MVP from later Google/Apple calendar sync
- **Status:** complete

### Phase 3: Implementation Roadmap
- [x] Produce a concrete task sequence for development
- [x] Identify first coding milestone
- [x] List required external setup steps for Supabase, Vercel, and calendar APIs
- **Status:** complete

### Phase 4: Delivery
- [x] Summarize current project state
- [x] Provide the recommended next steps in order
- [x] Ask for confirmation before any actual code/database changes
- **Status:** complete

### Phase 5: Implementation Documentation
- [x] Write a durable implementation plan in the app folder
- [x] Record what can be automated locally versus what requires user-owned accounts
- [x] Update progress after the documentation is created
- **Status:** complete

### Phase 6: Supabase Foundation
- [x] Add initial Supabase SQL migration with tables, RLS policies, seed triggers, and realtime publication entries
- [x] Add Supabase browser client setup and environment variables
- [x] Keep the app usable in demo/mock mode when Supabase env vars are missing
- **Status:** complete

### Phase 7: Auth & Couple Workspace
- [x] Add GitHub OAuth login UI through Supabase Auth
- [x] Add profile initialization
- [x] Add create/join couple workspace flow
- [ ] Verify against a real Supabase project with GitHub provider configured
- **Status:** in_progress

### Phase 8: Database-Backed Core Data
- [x] Load events, layers, habit logs, todos, and inbox messages from Supabase
- [x] Persist todo/event/message mutations to Supabase when configured
- [x] Subscribe to realtime database changes for cross-device sync
- [ ] Verify realtime behavior with two authenticated browser sessions
- **Status:** in_progress

### Phase 9: Verification & Handoff
- [x] Run type check and production build
- [x] Document required Supabase dashboard setup steps
- [ ] Leave the next concrete milestone ready after live Supabase credentials exist
- **Status:** in_progress

### Phase 10: Product Interaction Polish
- [x] Replace core `prompt` flows with in-app forms/dialogs
- [x] Add inbox message composer
- [x] Add threaded reply UI and persistence path
- [x] Add custom layer creation UI and persistence path
- [x] Remove browser `alert` placeholders from active UI controls
- **Status:** complete

### Phase 11: Drag-to-Calendar Scheduling
- [x] Add a typed internal drag payload for calendar items
- [x] Make flexible todos draggable from the right panel
- [x] Make inbox messages draggable from the right panel
- [x] Make month-view date cells accept todo/message drops
- [x] Route drops through the existing Supabase/mock persistence functions
- [ ] Verify drag behavior manually in a browser session
- **Status:** in_progress

### Phase 12: Habit Customization
- [x] Add a habit definition type and local defaults
- [x] Load habit definitions from Supabase when configured
- [x] Add a sidebar habit list
- [x] Add sidebar habit creation with color selection
- [x] Persist new habit definitions to Supabase or demo state
- [x] Add direct habit logging from the calendar UI
- **Status:** complete

### Phase 13: Personal My Tasks
- [x] Add a visually separate My Tasks section to the left sidebar
- [x] Filter personal tasks by the current user's couple role
- [x] Support adding personal tasks from the left sidebar
- [x] Support toggling personal task completion from the left sidebar
- [x] Reuse the existing Supabase/mock todo persistence path
- **Status:** complete

### Phase 14: Direct Event Creation
- [x] Add a normal calendar event creation store action
- [x] Add a `New Event` entry in the calendar header
- [x] Add an event creation dialog with title, date, start, and end fields
- [x] Persist new events to Supabase or demo state
- **Status:** complete

### Phase 15: Layer-Aware Events
- [x] Add owner and layer selection to the event creation dialog
- [x] Persist event owner and selected layer to Supabase or demo state
- [x] Filter events by their selected layer when active layers change
- [x] Render events with selected layer colors
- **Status:** complete

### Phase 16: Workspace Invite & Setup Guidance
- [x] Add a Supabase/GitHub setup guide
- [x] Show backend/demo status in the app
- [x] Show workspace name and current role in the sidebar
- [x] Show and copy invite code when a real workspace exists
- **Status:** complete

### Phase 17: Event Editing
- [x] Add a Supabase/mock event update path
- [x] Make rendered calendar events clickable in month/day/week views
- [x] Reuse the event dialog for editing title, date, time, owner, and layer
- [x] Keep event deletion out of scope until a confirmed delete workflow exists
- **Status:** complete

### Phase 18: Setup Doctor
- [x] Add a local setup doctor script
- [x] Check required Supabase files, package scripts, dependency, and env vars
- [x] Document how to run the doctor during Supabase setup
- [x] Verify the current expected warning state when `.env.local` is missing
- **Status:** complete

### Phase 19: Vercel Deployment Readiness
- [x] Add a Vercel SPA rewrite configuration
- [x] Add a deployment guide for Vercel project settings and env vars
- [x] Include Vercel readiness files in the setup doctor
- [x] Verify `vercel.json`, doctor, type check, and production build
- **Status:** complete

### Phase 20: Live-Date Demo Readiness
- [x] Remove the hard-coded October 2023 initial calendar date
- [x] Initialize the calendar on today's date
- [x] Keep demo/mock events, todos, habits, and messages visible by generating them in the current month
- [x] Verify no 2023 demo date remains in `zip/src`
- **Status:** complete

### Phase 21: External Calendar Sync Planning
- [x] Document Google Calendar setup steps from official docs
- [x] Document Apple/iCloud constraints and server-side CalDAV direction
- [x] Record token-storage and implementation order decisions
- [x] Include calendar sync docs in the setup doctor
- **Status:** complete

### Phase 22: Day/Week Drag Scheduling
- [x] Reuse the month-view drag payload for day/week views
- [x] Make day/week header date blocks accept todo/message drops
- [x] Make day/week time columns accept todo/message drops
- [x] Keep drops routed through the same Supabase/mock persistence functions
- **Status:** complete

### Phase 23: All-Day Event Support
- [x] Add all-day event support to the frontend event type
- [x] Load and persist Supabase `events.all_day`
- [x] Add an all-day toggle to the create/edit event dialog
- [x] Render all-day events outside the timed grid in day/week views
- **Status:** complete

### Phase 24: Idempotent Habit Logging
- [x] Prevent duplicate habit logs in demo mode, including legacy mock records without `habitId`
- [x] Use Supabase upsert with `ignoreDuplicates` for habit logs
- [x] Disable already-logged habits in the day-cell habit selector
- [x] Keep cancellation/deletion of habit logs out of scope
- **Status:** complete

### Phase 25: Scheduled Todo Sidebar Sync
- [x] Keep scheduled todos visible in the right To-Do Box
- [x] Split right-side todos into Flexible and Scheduled sections
- [x] Preserve checkbox completion sync for scheduled todos
- [x] Show scheduled date labels in the right-side list
- **Status:** complete

### Phase 26: Todo Unscheduling
- [x] Add a Supabase/mock update path that clears a todo's scheduled date
- [x] Add a right-panel action to move scheduled todos back to Flexible
- [x] Keep the todo row and completion state intact
- [x] Avoid delete/cancel semantics beyond clearing `scheduled_date`
- **Status:** complete

### Phase 27: Runtime Error Visibility
- [x] Expose a store method to clear runtime data errors
- [x] Show store errors in the main authenticated app layout
- [x] Let users dismiss the error banner
- [x] Keep existing Auth and workspace setup error displays intact
- **Status:** complete

### Phase 28: Layer Visibility Merge
- [x] Preserve user-hidden existing layers across Supabase reloads
- [x] Automatically activate newly created default-visible layers after realtime reload
- [x] Map Supabase `is_visible_by_default` into the frontend layer type
- [x] Verify type check, production build, doctor, and local HTTP entrypoint
- **Status:** complete

### Phase 29: Cross-Table Conversion Error Handling
- [x] Review message-to-event conversion writes across `events` and `inbox_messages`
- [x] Surface errors when marking a message as converted fails
- [x] Keep the existing reload path after conversion attempts
- [x] Verify type check, production build, doctor, and local HTTP entrypoint
- **Status:** complete

### Phase 30: Day/Week Scheduled Todo Visibility
- [x] Reuse the month-view scheduled todo checkbox renderer
- [x] Show scheduled todos in day/week header date areas
- [x] Preserve the same `toggleTodo` completion path across all calendar views
- [x] Verify type check, production build, doctor, and local HTTP entrypoint
- **Status:** complete

### Phase 31: Habit Logger Role
- [x] Record habit logs under the current user's couple role
- [x] Use the current user's role for duplicate-log checks
- [x] Pass the current user role into calendar habit logging UI
- [x] Verify type check, production build, doctor, and local HTTP entrypoint
- **Status:** complete

### Phase 32: Habit Log Type Tightening
- [x] Restrict frontend `HabitRecord.user` to actual user roles
- [x] Remove `both` from demo habit log records
- [x] Coerce legacy Supabase `both` habit logs to a concrete role on load
- [x] Verify type check, production build, doctor, and local HTTP entrypoint
- **Status:** complete

### Phase 33: Habit Dot Actor Labels
- [x] Add habit-dot labels that include the habit name and completing partner
- [x] Add accessible labels to month-view habit dots
- [x] Add partner-colored borders to distinguish who completed a habit
- [x] Verify type check, production build, doctor, and local HTTP entrypoint
- **Status:** complete

### Phase 34: Supabase Env Setup Helper
- [x] Add a local script for writing Supabase browser credentials into `.env.local`
- [x] Preserve existing `.env.local` entries while updating Supabase keys
- [x] Add the setup helper to package scripts and doctor checks
- [x] Document the helper in the Supabase setup guide and README
- [x] Verify helper help output, type check, production build, doctor, and local HTTP entrypoint
- **Status:** complete

### Phase 35: Live Supabase Verification Helper
- [x] Add a local live Supabase verifier for post-credential checks
- [x] Check `.env.local`, Supabase REST reachability, and expected table endpoints
- [x] Treat RLS/permission protection before login as an expected protected-table signal
- [x] Add the verifier to package scripts and setup doctor checks
- [x] Document the verifier in the Supabase setup guide and README
- [x] Verify help output, missing-env behavior, type check, production build, doctor, and local HTTP entrypoint
- **Status:** complete

### Phase 36: Browser Smoke Verification
- [x] Use Playwright CLI to open the local app and inspect the rendered accessibility snapshot
- [x] Verify the Month view, sidebars, habit labels, and To-Do Box render in demo mode
- [x] Add a demo task through the right To-Do Box and schedule it to today's calendar cell
- [x] Remove favicon 404 noise by adding a CoupleSync favicon and page title
- [x] Save a smoke screenshot under `output/playwright/couplesync-smoke.png`
- [x] Ignore local Playwright artifacts in `.gitignore`
- [x] Verify type check, production build, doctor, console errors, and local HTTP entrypoint
- **Status:** complete

### Phase 37: External Calendar DB Readiness
- [x] Add a follow-up Supabase migration for external calendar sync readiness
- [x] Add sync status/error fields to `calendar_connections`
- [x] Add a unique external-event index on `couple_id`, `source`, and `external_id`
- [x] Add `calendar_connections` to the realtime publication
- [x] Update setup/calendar-sync docs and verifier checks for the new migration
- [x] Verify doctor, expected missing-env live verifier behavior, type check, production build, and local HTTP entrypoint
- **Status:** complete

### Phase 38: Supabase SQL Bundle
- [x] Add a script that combines Supabase migrations in filename order
- [x] Generate `supabase/setup.sql` for one-shot Supabase SQL Editor setup
- [x] Add the SQL bundle command to package scripts and setup doctor checks
- [x] Document the bundle workflow in Supabase setup docs and README
- [x] Verify bundle contents, doctor, type check, production build, and local HTTP entrypoint
- **Status:** complete

### Phase 39: GitHub OAuth Settings Helper
- [x] Add a script that prints GitHub OAuth App settings from a Supabase Project URL
- [x] Support `.env.local`, `--supabase-url`, `--app-url`, and `--production-url` inputs
- [x] Print matching Supabase Auth Provider and URL Configuration fields
- [x] Add the helper to package scripts and setup doctor checks
- [x] Document the helper in Supabase setup docs and README
- [x] Verify help output, missing-env behavior, sample output, doctor, type check, production build, and local HTTP entrypoint
- **Status:** complete

### Phase 40: Vercel Settings Helper
- [x] Add a script that prints Vercel project settings for this Vite app
- [x] Print required Vercel environment variable names and local presence status
- [x] Support `--production-url` for Supabase Auth URL reminders after deployment
- [x] Support `--show-values` for copying browser-safe local `VITE_` env values when present
- [x] Add the helper to package scripts and setup doctor checks
- [x] Document the helper in Vercel docs and README
- [x] Verify help output, default output, production URL output, doctor, type check, production build, and local HTTP entrypoint
- **Status:** complete

### Phase 41: Search & Notifications Panels
- [x] Make the top-nav Search button open an in-app search panel
- [x] Search events, todos, and inbox messages from the current store state
- [x] Make search results navigate to the relevant event date, todo tab, or inbox tab
- [x] Make the top-nav Notifications button open a today summary panel
- [x] Summarize today's events, scheduled todos, open todos, habit logs, and backend mode
- [x] Verify browser search, notifications, console errors, type check, production build, doctor, and local HTTP entrypoint
- **Status:** complete

### Phase 42: Google Calendar Server-Side Skeleton
- [x] Install `googleapis` for Vercel Node.js API functions
- [x] Add Vercel API functions for Google OAuth connect, callback, and manual read-only sync
- [x] Encrypt provider tokens before storing them in `calendar_connections.token_reference`
- [x] Add a Supabase migration for calendar connection and imported-event upsert keys
- [x] Add left-sidebar Google Calendar connection/sync status controls
- [x] Add `npm run calendar:doctor` for Google Calendar API readiness checks
- [x] Update setup, deployment, calendar sync, and implementation docs
- [x] Regenerate `supabase/setup.sql` with the new migration
- [x] Verify type check, production build, doctor, API imports, calendar doctor, and local HTTP entrypoint
- **Status:** complete

### Phase 43: Live Supabase Verification Cleanup
- [x] Confirm `.env.local` is present and `npm run doctor` passes with no warnings
- [x] Confirm live Supabase table endpoints are reachable with the anon key
- [x] Update the live verifier so protected REST metadata endpoints do not fail otherwise healthy table checks
- [x] Exclude build/output artifacts from TypeScript checks so `npm run lint` is stable after builds
- [x] Verify `npm run verify:supabase`, `npm run doctor`, `npm run lint`, and `npm run build`
- [ ] Verify Realtime with two authenticated browser sessions
- **Status:** in_progress

### Phase 44: PM/Tech Lead Health Check & Mobile Polish
- [x] Audit current implementation against the five MVP requirement groups and available project docs
- [x] Confirm `DESIGN.md` is not present in the workspace and fall back to original UI requirements plus current docs
- [x] Fix mobile top navigation wrapping so 日/周/月/年 remains visible
- [x] Collapse both side panels automatically on mobile-sized screens
- [x] Convert expanded mobile side panels into overlay drawers instead of layout-squeezing columns
- [x] Tighten mobile calendar spacing and month-cell height without changing the desktop layout
- [x] Run local browser checks for mobile, mobile drawer states, and desktop
- [x] Run code quality and setup checks: `npm run lint`, `npm run build`, `npm run doctor`, and `npm run verify:supabase`
- [x] Smoke-test the live Vercel URL `https://couple-calendar-sigma.vercel.app`
- [x] Commit and push the polish changes to GitHub so Vercel can deploy them
- [x] Add `npm run verify:vercel` to compare local build assets against the production URL
- [ ] Verify Vercel production switches to the pushed GitHub commit
- **Status:** in_progress

## Key Questions
1. What exactly exists in the generated React UI today?
2. Is the current project better kept as Vite React or migrated to Next.js?
3. What Supabase schema is needed for users, couples, events, habits, tasks, inbox threads, and layers?
4. Which features should be MVP, and which should be deferred?
5. Which Supabase/Vercel/Google/Apple setup steps require the user to log in manually?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Start with read-only discovery | The user asked for direction and planning; product code should not change before we understand the generated app. |
| Preserve minimal-diff discipline | User explicitly requires no refactors, renames, file moves, public API changes, or deletions unless asked and confirmed. |
| Keep Vite React initially | The app already passes type check and production build; rewriting to Next.js is not required for Supabase/Vercel MVP. |
| Build backend foundation before calendar sync | Google/Apple calendar sync depends on stable auth, users, couples, events, and token storage. |
| Use Supabase Auth instead of a custom users table | Supabase already owns authenticated users in `auth.users`; app-specific display names and couple roles belong in public profile/member tables. |
| Support demo mode until env vars exist | The user has not created/configured the Supabase project yet, so the UI should still run while backend setup is pending. |
| Use RPC for couple creation/joining | RLS can block returning a newly created couple before membership exists; a security-definer RPC creates the couple and membership atomically. |
| Move user input to UI components | Store functions should receive validated form data instead of calling browser `prompt`, so the app can evolve into a real product UI. |
| Use native drag/drop for the first scheduler | It satisfies the current month-view scheduling requirement with minimal changes and no extra dependency while keeping a later library migration possible. |
| Implement habit definitions before habit logging UI | Definitions are the data needed for colored dots and future day-level logging controls. |
| Reuse `todos` for personal tasks with role-specific assignees | The existing table already supports `him`/`her` assignees, so personal lists do not need a separate table. |
| Add direct event creation before external calendar sync | Users need native manual events before Google/Apple import/export becomes useful. |
| Make events layer-aware before richer editing | Layer visibility and color are central to the calendar model, so event creation needs to write layer metadata early. |
| Surface invite code in the app | The second partner cannot join the workspace unless the creator can find and share the invite code. |
| Add event editing before event deletion | Updating event details is needed for daily use; deletion requires the separate confirmation/reference discipline from the project rules. |
| Add a setup doctor before live Supabase verification | The user is not familiar with Supabase setup, so a repeatable local check makes the external-account boundary explicit. |
| Configure Vercel as a Vite SPA | Vercel's Vite guidance supports direct deployment, and SPA rewrites preserve browser fallback behavior for direct URLs and auth redirects. |
| Make demo data relative to the current month | The app should feel like a real calendar before Supabase is connected, while still showing enough sample content for UI checks. |
| Keep external calendar tokens server-side | Google/Apple refresh credentials must not be stored in the Vite browser bundle or browser local storage. |
| Extend native drag/drop before adding a library | Day/week date-column drops can use the existing typed drag payload without adding dependency or changing the data model. |
| Support all-day events before calendar import | External calendars commonly return all-day events, and the database already has the field; the UI should round-trip it now. |
| Make habit logging idempotent instead of adding deletion | Duplicate prevention fixes the immediate data integrity risk without introducing a delete/cancel workflow. |
| Keep scheduled todos visible in the side list | The product requirement says calendar checkbox state must sync back to the sidebar, so scheduled tasks cannot disappear from the right panel. |
| Unschedule todos by clearing `scheduled_date` | Moving a task back to the flexible box is an update, not a deletion, and completes the drag-to-calendar workflow loop. |
| Surface runtime data errors in the app shell | Supabase mutation/load failures must be visible during live setup and production use, not hidden inside store state. |
| Merge new layers without resetting old choices | Realtime reloads should reveal newly created layers while preserving layers the user intentionally hid. |
| Report second-step conversion failures | Message-to-event conversion writes two records; a failed `inbox_messages` update should be visible through the app error banner. |
| Show scheduled todos in every date-oriented calendar view | Users should not lose task visibility when switching from month to day or week views. |
| Store habit logs by actor, not habit definition owner | The product requirement asks who completed a habit; shared habit definitions should still log the actual current user. |
| Keep habit log types actor-only | The frontend type should prevent new code from treating a habit log as owned by `both`. |
| Add actor labels to habit dots | Habit color identifies what was completed; label and border context identifies who completed it. |
| Add a Supabase env helper | Account credentials still require user ownership, but writing validated browser env vars should be repeatable and hard to confuse with service-role keys. |
| Add a live Supabase verifier | Once credentials exist, the project needs a repeatable way to prove the Supabase URL/key and migrated tables are reachable before browser Auth debugging. |
| Smoke-test the app in a browser before live Auth | Browser-level checks catch rendering, title/favicon, and core demo interaction issues that type checks cannot prove. |
| Add external-calendar DB readiness before OAuth code | Imported calendar sync needs deduplication and sync status fields before provider callbacks start writing events. |
| Generate a SQL bundle for dashboard setup | The user is unfamiliar with Supabase; one generated `setup.sql` reduces the chance of running migrations out of order or skipping the second migration. |
| Generate GitHub OAuth settings locally | The OAuth callback URL must match the Supabase project URL exactly; a helper reduces setup mistakes without handling secrets. |
| Generate Vercel settings locally | Deployment requires several dashboard fields and mirrored Supabase env vars; printing them locally reduces manual setup mistakes. |
| Make top-nav utilities functional before live Auth | Search and Today summaries use existing store data, so they improve the product without adding new backend risk before Supabase credentials exist. |
| Put Google Calendar OAuth in Vercel Functions | Provider tokens and client secrets must stay server-side; the browser should only start OAuth and display sync state. |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|

## Notes
- Any deletion requires a second check and explicit user confirmation before execution.
- The user has approved starting implementation and wants progress toward the final full-stack app.
- Supabase project creation, GitHub OAuth app/provider configuration, and Vercel account binding may require the user to log in manually if no authenticated tool access is available.
- Current local verification covers TypeScript, Vite build, setup doctors, API imports, and browser smoke; live Auth/RLS/Realtime verification still needs a Supabase project.
- Top-nav Search now opens an in-app global search for events, todos, and inbox messages.
- Top-nav Notifications now opens a today summary panel for calendar, todos, habits, and backend mode.
- Drag-to-calendar scheduling now works in month, day, and week views.
- Habit customization now covers definition creation and month-view day-level logging.
- Habit logging is now available from month-view day cells through a small habit selector.
- Left-sidebar My Tasks now displays role-specific personal tasks, separate from the right-sidebar shared/flexible task box.
- Calendar header now supports creating normal shared events without going through the inbox.
- New events can now be assigned to schedule/custom layers and inherit layer visibility/color behavior.
- Sidebar now shows demo/Supabase status, workspace name, current role, and invite code when available.
- Existing calendar events can now be opened and edited without adding a delete path.
- `npm run doctor` now reports whether the local Supabase setup files and `.env.local` are ready.
- Vercel deployment guidance and SPA rewrite config are now present under `zip/`.
- Demo mode now opens on the real current date instead of October 2023.
- External calendar sync is now documented with Google and Apple implementation constraints.
- Drag-to-calendar scheduling now works in month, day, and week views.
- Manual and imported event data paths now preserve all-day events.
- Habit logging now prevents duplicate same-day entries.
- Right-side shared todos now show both flexible and scheduled tasks, with checkbox status synced to calendar items.
- Scheduled todos can now be moved back to the flexible list without deleting the task.
- Main app runtime data errors now show in a dismissible banner.
- Newly created default-visible layers are activated after Supabase reload without reopening previously hidden layers.
- Message-to-event conversion now reports errors if the message cannot be marked converted.
- Scheduled todos now appear in month, day, and week calendar views.
- Habit logs now use the current user's role for ownership and duplicate checks.
- Habit log records are now typed as concrete user roles in frontend code.
- Month-view habit dots now expose habit-plus-actor labels and partner-colored borders.
- `npm run setup:supabase` now writes the Supabase Project URL and anon public key into `.env.local` after the user copies them from Supabase.
- `npm run verify:supabase` now checks live Supabase connectivity and expected table endpoints after `.env.local` and the SQL migration are in place.
- Playwright browser smoke now confirms the demo app renders, To-Do Box task creation works, a task can be scheduled to today, and console errors are clear.
- A second Supabase migration now prepares external calendar sync by adding imported-event deduplication, calendar connection sync status, and realtime updates for connection rows.
- `npm run sql:supabase` now generates `supabase/setup.sql`, combining all migrations in filename order for easier Supabase SQL Editor setup.
- `npm run oauth:github` now prints the exact GitHub OAuth App and Supabase Auth URL fields after the Supabase Project URL is known.
- `npm run vercel:settings` now prints Vercel project settings, required env vars, and post-deploy Supabase Auth URL reminders.
- `npm run calendar:doctor` now checks Google Calendar API files, dependency, and server env readiness.
- Google Calendar read-only connect/callback/sync Vercel functions now exist, but real verification still requires Supabase, Vercel server env vars, and Google OAuth credentials.
- Live Supabase env is now configured locally and the schema/table verifier passes.
- GitHub OAuth and workspace UI are user-reported working in the local app.
- Next engineering focus is two-session Realtime verification, then Vercel deployment, then Google Calendar server-env/OAuth verification.
