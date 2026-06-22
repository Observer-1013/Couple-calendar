export interface ChangelogEntry {
  id: string;
  date: string;
  title: string;
  summary: string;
  items: string[];
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    id: '2026-06-22-settings-undo',
    date: '2026-06-22',
    title: 'Settings, colors, and safer editing',
    summary: 'A cleanup release focused on personalization, daily use, and safer destructive actions.',
    items: [
      'Added Settings for names, invite code, light/dark theme, layer colors, personal schedule colors, and habit edits.',
      'Added delete with Undo for editable events, todos, and inbox messages.',
      'Moved the invite code into Settings so the sidebar stays focused on layers and personal tasks.',
      'Verified live Realtime sync, Vercel production deployment, and Supabase delete policies.',
    ],
  },
  {
    id: '2026-06-21-live-foundation',
    date: '2026-06-21',
    title: 'Live Supabase foundation',
    summary: 'The app moved from static UI toward a real shared workspace backed by Supabase.',
    items: [
      'Connected Supabase Auth, profiles, couple workspace setup, roles, and invite codes.',
      'Persisted events, todos, habits, inbox messages, replies, layers, and drag-to-calendar scheduling.',
      'Added GitHub OAuth setup helpers, Vercel deployment helpers, and production verification scripts.',
      'Prepared the Google Calendar API skeleton for a later real OAuth sync pass.',
    ],
  },
];
