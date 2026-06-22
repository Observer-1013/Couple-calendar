# Supabase and GitHub Login Setup

This project already contains the local code and SQL needed for Supabase. These steps must be done in your own Supabase and GitHub accounts because they require account ownership and secrets.

Before and after setup, you can run:

```bash
npm run doctor
```

It checks the local Supabase files and reports whether `.env.local` is still missing.

## 1. Create a Supabase Project

1. Go to Supabase and create a new project.
2. Open Project Settings -> API.
3. Copy:
   - Project URL
   - anon public key
4. From this folder, run:

```bash
npm run setup:supabase
```

Paste the Project URL and anon public key when prompted.

You can also pass both values directly:

```bash
npm run setup:supabase -- --url https://YOUR_PROJECT_REF.supabase.co --anon-key YOUR_ANON_PUBLIC_KEY
```

This writes `zip/.env.local` with:

```env
VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_ANON_PUBLIC_KEY"
```

Do not put the service role key in the browser app. Only use it in server-side Vercel environment variables for `/api/calendar/google/*`.

## 2. Run the Database SQL

1. From this folder, generate a single SQL bundle:

```bash
npm run sql:supabase
```

2. In Supabase, open SQL Editor.
3. Open `zip/supabase/setup.sql`, copy the whole file into SQL Editor, and run it once.

The bundle contains these local SQL files in filename order:

   - `zip/supabase/migrations/20260621023000_initial_schema.sql`
   - `zip/supabase/migrations/20260621102000_external_calendar_sync_readiness.sql`
   - `zip/supabase/migrations/20260621113000_google_calendar_oauth_readiness.sql`
   - `zip/supabase/migrations/20260622113000_delete_policy_readiness.sql`
   - `zip/supabase/migrations/20260622124500_profile_weather_location.sql`

If you prefer not to use the bundle, you can still copy and run each migration file one at a time in that same order.

This creates profiles, couples, members, layers, events, habits, todos, inbox threads, RLS policies, and realtime publication setup.
The second migration adds external-calendar deduplication, connection sync status, and realtime updates for calendar connections.
The third migration adds unique keys for safe Google OAuth connection and imported-event upserts.
The later migrations add delete permissions for undo-supported records and weather-location fields on profiles.

After the SQL has run, verify the live project from this folder:

```bash
npm run verify:supabase
```

This checks the Project URL, anon key, Supabase REST endpoint, and expected tables. Some tables may report as protected before login; that is normal when RLS is working.

## 3. Configure GitHub OAuth

After `npm run setup:supabase`, print the exact OAuth values:

```bash
npm run oauth:github
```

If `.env.local` does not exist yet, pass the Supabase Project URL directly:

```bash
npm run oauth:github -- --supabase-url https://YOUR_PROJECT_REF.supabase.co
```

Then:

1. In GitHub, create an OAuth App.
2. Use the printed `Application name`.
3. Use the printed `Homepage URL`.
4. Use the printed `Authorization callback URL`.
5. Copy the GitHub Client ID and Client Secret.

For local development, the values are usually:

```text
Application name:
CoupleSync Local

Homepage URL:
http://localhost:3000

Authorization callback URL:
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

## 4. Enable GitHub in Supabase Auth

1. In Supabase, open Authentication -> Providers.
2. Enable GitHub.
3. Paste the GitHub Client ID and Client Secret.
4. Save.

## 5. Configure Auth URLs

In Supabase Authentication -> URL Configuration:

Site URL:

```text
http://localhost:3000
```

Redirect URLs:

```text
http://localhost:3000
```

When deployed to Vercel, add the Vercel URL here too.

## 6. Restart Local Dev Server

After creating `.env.local`, restart Vite:

```bash
npm run dev
```

The app will then show GitHub login instead of demo mode. After signing in, create a workspace and share the invite code with the second partner.

Run the setup doctor again after restart:

```bash
npm run doctor
```

If the env vars are valid, the remaining checks should no longer warn about demo/mock mode.
