import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { parse } from 'dotenv';

const root = process.cwd();
const envPath = path.join(root, '.env.local');
const args = process.argv.slice(2);

function getArg(name) {
  const prefix = `${name}=`;
  const inline = args.find(arg => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = args.indexOf(name);
  if (index >= 0 && args[index + 1]) return args[index + 1];
  return '';
}

function printHelp() {
  console.log(`CoupleSync GitHub OAuth settings

Usage:
  npm run oauth:github
  npm run oauth:github -- --supabase-url https://PROJECT_REF.supabase.co
  npm run oauth:github -- --supabase-url https://PROJECT_REF.supabase.co --app-url http://localhost:3000

This prints the exact GitHub OAuth App and Supabase Auth URL settings.
It does not read or print GitHub Client Secrets.`);
}

function loadEnv() {
  if (!fs.existsSync(envPath)) return {};
  return parse(fs.readFileSync(envPath, 'utf8'));
}

function normalizeUrl(value) {
  return value.trim().replace(/\/+$/g, '');
}

function isValidSupabaseUrl(value) {
  return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(value);
}

function isLikelyHttpUrl(value) {
  return /^https?:\/\/[^/]+/i.test(value);
}

if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

const env = loadEnv();
const supabaseUrl = normalizeUrl(getArg('--supabase-url') || env.VITE_SUPABASE_URL || '');
const appUrl = normalizeUrl(getArg('--app-url') || env.VITE_APP_URL || 'http://localhost:3000');
const productionUrl = normalizeUrl(getArg('--production-url') || env.VITE_PRODUCTION_URL || '');

if (!isValidSupabaseUrl(supabaseUrl)) {
  console.error('Missing or invalid Supabase URL.');
  console.error('Run npm run setup:supabase first, or pass -- --supabase-url https://PROJECT_REF.supabase.co');
  process.exit(1);
}

if (!isLikelyHttpUrl(appUrl)) {
  console.error('Invalid app URL. Expected something like http://localhost:3000 or https://your-app.vercel.app');
  process.exit(1);
}

if (productionUrl && !isLikelyHttpUrl(productionUrl)) {
  console.error('Invalid production URL. Expected something like https://your-app.vercel.app');
  process.exit(1);
}

const callbackUrl = `${supabaseUrl}/auth/v1/callback`;
const redirectUrls = [appUrl, productionUrl].filter(Boolean);

console.log('CoupleSync GitHub OAuth settings');
console.log('');
console.log('GitHub OAuth App');
console.log(`Application name: CoupleSync Local`);
console.log(`Homepage URL: ${appUrl}`);
console.log(`Authorization callback URL: ${callbackUrl}`);
console.log('');
console.log('Supabase Auth -> Providers -> GitHub');
console.log('Enabled: on');
console.log('Client ID: paste the GitHub OAuth App Client ID');
console.log('Client Secret: paste the GitHub OAuth App Client Secret');
console.log('');
console.log('Supabase Auth -> URL Configuration');
console.log(`Site URL: ${appUrl}`);
console.log('Redirect URLs:');
redirectUrls.forEach(url => console.log(`- ${url}`));
console.log('');
console.log('After saving these settings, restart npm run dev and click Continue with GitHub.');
