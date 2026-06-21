<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/619dfb09-3ca6-4bf0-bb3c-a604744b25cb

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Optional: configure Supabase for persistent Auth/data:
   `npm run setup:supabase`
4. Optional: generate a single SQL file for the Supabase SQL Editor:
   `npm run sql:supabase`
5. Optional: print exact GitHub OAuth settings:
   `npm run oauth:github`
6. Optional: print Vercel deployment settings:
   `npm run vercel:settings`
7. Optional: check Google Calendar API/server env readiness:
   `npm run calendar:doctor`
8. Optional: verify the live Supabase project after running the SQL migration:
   `npm run verify:supabase`
9. Run the app:
   `npm run dev`
