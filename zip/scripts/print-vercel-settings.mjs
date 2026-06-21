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
  console.log(`CoupleSync Vercel settings

Usage:
  npm run vercel:settings
  npm run vercel:settings -- --production-url https://YOUR_APP.vercel.app
  npm run vercel:settings -- --show-values --production-url https://YOUR_APP.vercel.app

This prints Vercel project settings, required environment variable names, and Supabase Auth URL updates.
Use --show-values only when you want to copy browser-safe VITE_ values from .env.local.`);
}

function loadEnv() {
  if (!fs.existsSync(envPath)) return {};
  return parse(fs.readFileSync(envPath, 'utf8'));
}

function normalizeUrl(value) {
  return value.trim().replace(/\/+$/g, '');
}

function isLikelyHttpUrl(value) {
  return /^https?:\/\/[^/]+/i.test(value);
}

function describeValue(name, value, showValues) {
  if (!value) return `${name}=<missing locally>`;
  if (showValues) return `${name}=${value}`;
  return `${name}=<present locally; rerun with --show-values to print>`;
}

if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

const env = loadEnv();
const showValues = args.includes('--show-values');
const productionUrl = normalizeUrl(getArg('--production-url') || env.VITE_PRODUCTION_URL || '');

if (productionUrl && !isLikelyHttpUrl(productionUrl)) {
  console.error('Invalid production URL. Expected something like https://your-app.vercel.app');
  process.exit(1);
}

console.log('CoupleSync Vercel settings');
console.log('');
console.log('Vercel Project Settings');
console.log('Framework Preset: Vite');
console.log('Root Directory: zip');
console.log('Build Command: npm run build');
console.log('Output Directory: dist');
console.log('Install Command: npm install');
console.log('');
console.log('Vercel Environment Variables');
console.log(describeValue('VITE_SUPABASE_URL', env.VITE_SUPABASE_URL, showValues));
console.log(describeValue('VITE_SUPABASE_ANON_KEY', env.VITE_SUPABASE_ANON_KEY, showValues));

if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
  console.log('');
  console.log('Local env status: missing Supabase values. Run npm run setup:supabase after creating the Supabase project.');
}

console.log('');
console.log('Supabase Auth URL Configuration After Vercel Deploy');
console.log('Keep this local URL:');
console.log('- http://localhost:3000');

if (productionUrl) {
  console.log('Add this deployed URL:');
  console.log(`- ${productionUrl}`);
} else {
  console.log('After the first Vercel deploy, rerun with:');
  console.log('npm run vercel:settings -- --production-url https://YOUR_APP.vercel.app');
}

console.log('');
console.log('Preflight before deploy: npm run doctor && npm run lint && npm run build');
