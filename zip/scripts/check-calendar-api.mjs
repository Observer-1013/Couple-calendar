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

function loadEnv() {
  const localPath = path.join(root, '.env.local');
  const examplePath = path.join(root, '.env.example');
  return {
    ...(fs.existsSync(examplePath) ? parse(fs.readFileSync(examplePath, 'utf8')) : {}),
    ...(fs.existsSync(localPath) ? parse(fs.readFileSync(localPath, 'utf8')) : {}),
    ...process.env,
  };
}

function isPlaceholder(value) {
  if (!value) return true;
  return /YOUR_|MY_|PLACEHOLDER|SERVICE_ROLE|CLIENT_ID|CLIENT_SECRET|ENCRYPTION_KEY/i.test(value);
}

function record(status, label, detail = '') {
  checks.push({ status, label, detail });
}

function checkFiles() {
  [
    'api/_googleCalendarShared.js',
    'api/calendar/google/connect.js',
    'api/calendar/google/callback.js',
    'api/calendar/google/sync.js',
    'supabase/migrations/20260621113000_google_calendar_oauth_readiness.sql',
  ].forEach(file => {
    record(exists(file) ? 'ok' : 'error', file, exists(file) ? 'present' : 'missing');
  });
}

function checkPackage() {
  const packageJson = readJson('package.json');
  const dependencies = packageJson.dependencies ?? {};
  const scripts = packageJson.scripts ?? {};
  record(dependencies.googleapis ? 'ok' : 'error', 'googleapis dependency', dependencies.googleapis ?? 'missing');
  record(scripts['calendar:doctor'] ? 'ok' : 'error', 'npm run calendar:doctor', scripts['calendar:doctor'] ?? 'missing');
}

function checkEnv() {
  const env = loadEnv();
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const required = [
    ['SUPABASE_URL or VITE_SUPABASE_URL', supabaseUrl],
    ['SUPABASE_SERVICE_ROLE_KEY', env.SUPABASE_SERVICE_ROLE_KEY],
    ['GOOGLE_CLIENT_ID', env.GOOGLE_CLIENT_ID],
    ['GOOGLE_CLIENT_SECRET', env.GOOGLE_CLIENT_SECRET],
    ['CALENDAR_TOKEN_ENCRYPTION_KEY', env.CALENDAR_TOKEN_ENCRYPTION_KEY],
  ];

  required.forEach(([name, value]) => {
    record(!isPlaceholder(value) ? 'ok' : 'warn', name, !isPlaceholder(value) ? 'configured' : 'missing or placeholder');
  });

  const redirectSource = env.GOOGLE_REDIRECT_URI || env.APP_URL || env.VERCEL_URL;
  record(redirectSource && !isPlaceholder(redirectSource) ? 'ok' : 'warn', 'Google OAuth redirect base', redirectSource && !isPlaceholder(redirectSource) ? 'configured' : 'set GOOGLE_REDIRECT_URI or APP_URL before provider setup');
}

function printReport() {
  console.log('CoupleSync Google Calendar API doctor');
  console.log('');

  checks.forEach(check => {
    const prefix = check.status === 'ok' ? 'OK' : check.status === 'warn' ? 'WARN' : 'ERROR';
    console.log(`${prefix.padEnd(5)} ${check.label}${check.detail ? ` - ${check.detail}` : ''}`);
  });

  const errors = checks.filter(check => check.status === 'error').length;
  const warnings = checks.filter(check => check.status === 'warn').length;

  console.log('');
  console.log(`Status: ${errors} error${errors === 1 ? '' : 's'}, ${warnings} warning${warnings === 1 ? '' : 's'}.`);
  if (warnings > 0) {
    console.log('');
    console.log('Expected before deployment: missing Google OAuth credentials, Supabase service role key, or deployed callback URL.');
  }

  if (strict && (errors > 0 || warnings > 0)) process.exitCode = 1;
}

checkFiles();
checkPackage();
checkEnv();
printReport();
