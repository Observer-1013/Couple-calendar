# External Calendar Sync

This app already has database fields for external calendar events:

- `events.source`: `manual`, `google`, or `apple`
- `events.external_id`: the provider event id
- `calendar_connections`: one row per user/provider connection
- `calendar_connections.sync_status`: `idle`, `syncing`, or `error`
- `calendar_connections.last_synced_at` and `last_sync_error`: sync status reporting

The second Supabase migration also adds a unique index for imported external events:

```sql
(couple_id, source, external_id)
```

This lets future import jobs safely upsert Google/Apple events instead of creating duplicates.

A follow-up migration also ensures one calendar connection per couple/user/provider:

```sql
(couple_id, user_id, provider)
```

It also adds a full event unique index for PostgREST upserts:

```sql
(couple_id, source, external_id)
```

The app now includes a read-only Google Calendar connection/import skeleton:

- Frontend status and controls in the left sidebar.
- `api/calendar/google/connect.js` to create the Google OAuth URL.
- `api/calendar/google/callback.js` to exchange the OAuth code and store encrypted tokens.
- `api/calendar/google/sync.js` to import upcoming Google events into `events`.

The endpoints require Vercel server environment variables before they can run against a real account.

## Google Calendar

Official docs:

- JavaScript quickstart: https://developers.google.com/workspace/calendar/api/quickstart/js
- Node.js quickstart: https://developers.google.com/workspace/calendar/api/quickstart/nodejs
- Events list reference: https://developers.google.com/workspace/calendar/api/v3/reference/events/list
- Events insert reference: https://developers.google.com/workspace/calendar/api/v3/reference/events/insert

Google setup steps:

1. Create or open a Google Cloud project.
2. Enable the Google Calendar API.
3. Configure the OAuth consent screen.
4. Create OAuth 2.0 credentials for a Web application.
5. Add local and deployed origins:

```text
http://localhost:3000
https://YOUR_VERCEL_DOMAIN
```

6. Create and restrict an API key for Google Calendar API use.

For the current Vercel API function flow, add this Authorized redirect URI:

```text
https://YOUR_VERCEL_DOMAIN/api/calendar/google/callback
```

For a quick local read-only prototype, Google's JavaScript quickstart uses:

```text
https://www.googleapis.com/auth/calendar.readonly
```

The current implementation uses the read-only scope and keeps provider tokens in server-side API functions. Do not store long-lived refresh tokens in the Vite browser bundle or local storage.

## Vercel API Environment

Set these server-side variables in Vercel Project Settings:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
CALENDAR_TOKEN_ENCRYPTION_KEY
APP_URL
```

`SUPABASE_URL` can be the same value as `VITE_SUPABASE_URL`. `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_SECRET`, and `CALENDAR_TOKEN_ENCRYPTION_KEY` must not be exposed with a `VITE_` prefix.

Before deploying calendar sync, run:

```bash
npm run calendar:doctor
```

## Recommended Production Flow

Use a server-side function for provider auth and sync:

1. User clicks `Connect Google Calendar`.
2. Browser starts OAuth with Google.
3. OAuth callback goes to a server-side function.
4. Server exchanges the code for tokens.
5. Server stores an encrypted token reference in `calendar_connections.token_reference`.
6. Server imports Google events into `events` with:
   - `source = 'google'`
   - `external_id = google_event.id`
   - `owner_role = current user's couple role`
7. Realtime sends imported events to the partner's browser.

This project uses Vercel Functions and the Node `googleapis` package for the first read-only implementation. If this is later moved to Supabase Edge Functions, use the provider's HTTP endpoints or a Deno-compatible OAuth client instead.

## Apple/iCloud Calendar

Official Apple support for third-party app access uses app-specific passwords:

- https://support.apple.com/en-us/102654

Apple Calendar sync is not the same as Google OAuth. For this project, treat Apple/iCloud as a later server-side CalDAV integration:

1. User creates an Apple app-specific password.
2. Server stores only an encrypted token reference.
3. Server syncs through CalDAV.
4. Imported events use `source = 'apple'`.

Do not ask users to paste Apple credentials into the browser app.

## Implementation Order

1. Finish Supabase live setup and Realtime verification.
2. Deploy the Vercel API functions with the Google/Supabase server env vars.
3. Run the read-only Google connect/import proof of concept.
4. Confirm imported events upsert by `couple_id + source + external_id`.
5. Add write-back only after conflict rules are clear.
6. Evaluate Apple/iCloud CalDAV separately.
