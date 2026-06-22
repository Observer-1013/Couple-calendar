import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { parse } from 'dotenv';

const root = process.cwd();
const strict = process.argv.includes('--strict');
const checks = [];

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function record(status, label, detail = '') {
  checks.push({ status, label, detail });
}

function isPlaceholder(value) {
  if (!value) return true;
  return /YOUR_|MY_|PLACEHOLDER|supabase_anon_key/i.test(value);
}

function loadEnvFile() {
  const envPath = path.join(root, '.env.local');
  if (!fs.existsSync(envPath)) return null;
  return parse(fs.readFileSync(envPath, 'utf8'));
}

function checkFiles() {
  const requiredFiles = [
    'package.json',
    'src/App.tsx',
    'src/lib/supabase.ts',
    'src/lib/useSupabaseSession.ts',
    'src/lib/useCoupleSyncStore.ts',
    'supabase/migrations/20260621023000_initial_schema.sql',
    'supabase/migrations/20260621102000_external_calendar_sync_readiness.sql',
    'supabase/migrations/20260621113000_google_calendar_oauth_readiness.sql',
    'supabase/migrations/20260622113000_delete_policy_readiness.sql',
    'api/_googleCalendarShared.js',
    'api/calendar/google/connect.js',
    'api/calendar/google/callback.js',
    'api/calendar/google/sync.js',
    'docs/CALENDAR_SYNC.md',
    'docs/SUPABASE_SETUP.md',
    'docs/VERCEL_DEPLOYMENT.md',
    'scripts/check-vercel-deployment.mjs',
    '.env.example',
    'vercel.json',
  ];

  requiredFiles.forEach(file => {
    record(exists(file) ? 'ok' : 'error', file, exists(file) ? 'present' : 'missing');
  });
}

function checkPackage() {
  const packageJson = readJson('package.json');
  const dependencies = packageJson.dependencies ?? {};
  const scripts = packageJson.scripts ?? {};

  record(dependencies['@supabase/supabase-js'] ? 'ok' : 'error', '@supabase/supabase-js', dependencies['@supabase/supabase-js'] ?? 'missing');
  record(dependencies.googleapis ? 'ok' : 'error', 'googleapis', dependencies.googleapis ?? 'missing');
  record(scripts.dev ? 'ok' : 'error', 'npm run dev', scripts.dev ?? 'missing');
  record(scripts.build ? 'ok' : 'error', 'npm run build', scripts.build ?? 'missing');
  record(scripts.lint ? 'ok' : 'error', 'npm run lint', scripts.lint ?? 'missing');
  record(scripts['setup:supabase'] ? 'ok' : 'error', 'npm run setup:supabase', scripts['setup:supabase'] ?? 'missing');
  record(scripts['sql:supabase'] ? 'ok' : 'error', 'npm run sql:supabase', scripts['sql:supabase'] ?? 'missing');
  record(scripts['oauth:github'] ? 'ok' : 'error', 'npm run oauth:github', scripts['oauth:github'] ?? 'missing');
  record(scripts['vercel:settings'] ? 'ok' : 'error', 'npm run vercel:settings', scripts['vercel:settings'] ?? 'missing');
  record(scripts['calendar:doctor'] ? 'ok' : 'error', 'npm run calendar:doctor', scripts['calendar:doctor'] ?? 'missing');
  record(scripts['verify:supabase'] ? 'ok' : 'error', 'npm run verify:supabase', scripts['verify:supabase'] ?? 'missing');
  record(scripts['verify:vercel'] ? 'ok' : 'error', 'npm run verify:vercel', scripts['verify:vercel'] ?? 'missing');
}

function checkSupabaseEnv() {
  const env = loadEnvFile();
  if (!env) {
    record('warn', '.env.local', 'missing; app will stay in demo/mock mode');
    record('warn', 'VITE_SUPABASE_URL', 'missing until .env.local is created');
    record('warn', 'VITE_SUPABASE_ANON_KEY', 'missing until .env.local is created');
    return;
  }

  const url = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  const urlLooksValid = Boolean(url && /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) && !isPlaceholder(url));
  const keyLooksValid = Boolean(anonKey && anonKey.length > 80 && !isPlaceholder(anonKey));

  record(urlLooksValid ? 'ok' : 'error', 'VITE_SUPABASE_URL', urlLooksValid ? url : 'missing, placeholder, or not a Supabase project URL');
  record(keyLooksValid ? 'ok' : 'error', 'VITE_SUPABASE_ANON_KEY', keyLooksValid ? 'present' : 'missing, placeholder, or too short');
}

function printReport() {
  console.log('CoupleSync setup doctor');
  console.log('');

  checks.forEach(check => {
    const prefix = check.status === 'ok' ? 'OK' : check.status === 'warn' ? 'WARN' : 'ERROR';
    console.log(`${prefix.padEnd(5)} ${check.label}${check.detail ? ` - ${check.detail}` : ''}`);
  });

  const errors = checks.filter(check => check.status === 'error').length;
  const warnings = checks.filter(check => check.status === 'warn').length;

  console.log('');
  if (errors === 0 && warnings === 0) {
    console.log('Status: local setup checks passed.');
  } else {
    console.log(`Status: setup incomplete (${errors} error${errors === 1 ? '' : 's'}, ${warnings} warning${warnings === 1 ? '' : 's'}).`);
    console.log('');
    console.log('Next required steps:');
    console.log('1. Create a Supabase project and run docs/SUPABASE_SETUP.md.');
    console.log('2. Copy VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY into .env.local.');
    console.log('3. Configure GitHub OAuth in Supabase Auth, then restart npm run dev.');
  }

  if (strict && (errors > 0 || warnings > 0)) process.exitCode = 1;
}

checkFiles();
checkPackage();
checkSupabaseEnv();
printReport();
