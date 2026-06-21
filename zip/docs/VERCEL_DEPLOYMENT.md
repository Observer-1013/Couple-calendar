# Vercel Deployment

This app is a Vite single-page app. Deploy the `zip/` folder as the Vercel project root.

Vercel Functions docs: https://vercel.com/docs/functions

## Project Settings

Print these values locally with:

```bash
npm run vercel:settings
```

- Framework Preset: `Vite`
- Root Directory: `zip`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

The included `vercel.json` adds the SPA rewrite so direct page loads and OAuth redirects can fall back to `index.html`.

## Environment Variables

Add these browser variables in Vercel Project Settings for Production and Preview:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Use the same values from local `.env.local`.

To print the local browser-safe values for copying, run:

```bash
npm run vercel:settings -- --show-values
```

For Google Calendar import, also add these server-only variables:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
CALENDAR_TOKEN_ENCRYPTION_KEY
APP_URL
```

Do not add service-role or Google secret values with a `VITE_` prefix. They are for `/api/calendar/google/*` Vercel Functions only.

Check the calendar API wiring locally with:

```bash
npm run calendar:doctor
```

## Supabase Auth URLs

After the first Vercel deployment, copy the production URL and add it in Supabase:

- Authentication -> URL Configuration -> Site URL
- Authentication -> URL Configuration -> Redirect URLs

Keep the local URL too:

```text
http://localhost:3000
```

Add the deployed URL, for example:

```text
https://your-couplesync-project.vercel.app
```

After deployment, you can print the full reminder with:

```bash
npm run vercel:settings -- --production-url https://your-couplesync-project.vercel.app
```

## Preflight

Before deploying:

```bash
npm run doctor
npm run calendar:doctor
npm run lint
npm run build
```

`npm run doctor` should stop warning about missing Supabase env vars after `.env.local` exists locally. Vercel needs the same two `VITE_` variables in its dashboard.
