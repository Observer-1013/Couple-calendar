import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { parse } from 'dotenv';

const root = process.cwd();
const envPath = path.join(root, '.env.local');
const checks = [];

const requiredTables = [
  { name: 'profiles', select: 'id' },
  { name: 'couples', select: 'id' },
  { name: 'couple_members', select: 'couple_id' },
  { name: 'layers', select: 'id' },
  { name: 'events', select: 'id,source,external_id' },
  { name: 'habit_definitions', select: 'id' },
  { name: 'habit_logs', select: 'id' },
  { name: 'todos', select: 'id' },
  { name: 'inbox_messages', select: 'id' },
  { name: 'feature_wishes', select: 'id' },
  { name: 'calendar_connections', select: 'id,sync_status,last_synced_at,last_sync_error' },
];

function record(status, label, detail = '') {
  checks.push({ status, label, detail });
}

function printHelp() {
  console.log(`CoupleSync live Supabase verification

Usage:
  npm run verify:supabase

Run this after:
  1. Creating a Supabase project
  2. Running supabase/migrations/20260621023000_initial_schema.sql
  3. Writing VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local

This uses the anon public key only. It does not require or accept a service_role key.`);
}

function loadEnv() {
  if (!fs.existsSync(envPath)) return null;
  return parse(fs.readFileSync(envPath, 'utf8'));
}

function isValidProjectUrl(value) {
  return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(value ?? '');
}

function isValidAnonKey(value) {
  return Boolean(value && value.length > 80 && !/service_role|YOUR_|PLACEHOLDER/i.test(value));
}

async function readBody(response) {
  const text = await response.text();
  if (!text) return '';
  try {
    return JSON.stringify(JSON.parse(text));
  } catch {
    return text;
  }
}

function tableMissing(body) {
  return /Could not find|PGRST205|relation .* does not exist|does not exist/i.test(body);
}

function tableProtected(body) {
  return /permission denied|not authorized|JWT|row-level security|rls/i.test(body);
}

function restRootProtected(body) {
  return /service_role|Invalid API key/i.test(body);
}

async function checkRestRoot(url, anonKey) {
  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    const body = await readBody(response);

    if (response.ok) {
      record('ok', 'Supabase REST API', `reachable (${response.status})`);
      return;
    }

    if ((response.status === 401 || response.status === 403) && restRootProtected(body)) {
      record('ok', 'Supabase REST API', `reachable; metadata endpoint protected for anon key (${response.status})`);
      return;
    }

    record('error', 'Supabase REST API', `${response.status}: ${body || response.statusText}`);
  } catch (error) {
    record('error', 'Supabase REST API', error instanceof Error ? error.message : String(error));
  }
}

async function checkTable(url, anonKey, table) {
  const endpoint = `${url}/rest/v1/${table.name}?select=${encodeURIComponent(table.select)}&limit=0`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    const body = await readBody(response);

    if (response.ok) {
      record('ok', `table:${table.name}`, 'reachable with anon key');
      return;
    }

    if ((response.status === 401 || response.status === 403) && tableProtected(body)) {
      record('ok', `table:${table.name}`, `exists; protected before login (${response.status})`);
      return;
    }

    if (response.status === 404 || tableMissing(body)) {
      record('error', `table:${table.name}`, 'missing or not exposed; run the migration SQL');
      return;
    }

    record('error', `table:${table.name}`, `${response.status}: ${body || response.statusText}`);
  } catch (error) {
    record('error', `table:${table.name}`, error instanceof Error ? error.message : String(error));
  }
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  printHelp();
  process.exit(0);
}

const env = loadEnv();
if (!env) {
  record('error', '.env.local', 'missing; run npm run setup:supabase first');
} else {
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

  record(isValidProjectUrl(supabaseUrl) ? 'ok' : 'error', 'VITE_SUPABASE_URL', isValidProjectUrl(supabaseUrl) ? supabaseUrl : 'missing, placeholder, or invalid');
  record(isValidAnonKey(supabaseAnonKey) ? 'ok' : 'error', 'VITE_SUPABASE_ANON_KEY', isValidAnonKey(supabaseAnonKey) ? 'present' : 'missing, placeholder, service-role-like, or too short');

  if (isValidProjectUrl(supabaseUrl) && isValidAnonKey(supabaseAnonKey)) {
    await checkRestRoot(supabaseUrl, supabaseAnonKey);
    for (const table of requiredTables) {
      await checkTable(supabaseUrl, supabaseAnonKey, table);
    }
  }
}

console.log('CoupleSync live Supabase verification');
console.log('');

checks.forEach(check => {
  const prefix = check.status === 'ok' ? 'OK' : 'ERROR';
  console.log(`${prefix.padEnd(5)} ${check.label}${check.detail ? ` - ${check.detail}` : ''}`);
});

const errors = checks.filter(check => check.status === 'error').length;
console.log('');

if (errors === 0) {
  console.log('Status: live Supabase connectivity/schema checks passed.');
  console.log('Next: configure GitHub Auth provider, restart npm run dev, then verify login/workspace/realtime in the app.');
} else {
  console.log(`Status: live Supabase verification failed (${errors} error${errors === 1 ? '' : 's'}).`);
  console.log('Next: follow docs/SUPABASE_SETUP.md, then rerun npm run verify:supabase.');
  process.exitCode = 1;
}
