import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline/promises';

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
  console.log(`CoupleSync Supabase env setup

Usage:
  npm run setup:supabase
  npm run setup:supabase -- --url https://PROJECT_REF.supabase.co --anon-key ANON_PUBLIC_KEY

This writes only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.
Do not paste a Supabase service_role key into this browser app.`);
}

function isValidUrl(value) {
  return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(value.trim());
}

function isValidAnonKey(value) {
  const trimmed = value.trim();
  return trimmed.length > 80 && !/service_role|YOUR_|PLACEHOLDER/i.test(trimmed);
}

async function askForMissingValues(initialUrl, initialAnonKey) {
  let url = initialUrl.trim();
  let anonKey = initialAnonKey.trim();

  if (url && anonKey) return { url, anonKey };

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    if (!url) {
      url = (await rl.question('Supabase Project URL: ')).trim();
    }
    if (!anonKey) {
      anonKey = (await rl.question('Supabase anon public key: ')).trim();
    }
  } finally {
    rl.close();
  }

  return { url, anonKey };
}

function updateEnvLines(existing, updates) {
  const lines = existing ? existing.split(/\r?\n/) : [];
  const seen = new Set();
  const updatedLines = lines.map(line => {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=/);
    if (!match || !(match[1] in updates)) return line;

    const key = match[1];
    seen.add(key);
    return `${key}="${updates[key]}"`;
  });

  Object.entries(updates).forEach(([key, value]) => {
    if (!seen.has(key)) updatedLines.push(`${key}="${value}"`);
  });

  return `${updatedLines.join('\n').replace(/\n+$/g, '')}\n`;
}

if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

const initialUrl = getArg('--url');
const initialAnonKey = getArg('--anon-key');
const { url, anonKey } = await askForMissingValues(initialUrl, initialAnonKey);

if (!isValidUrl(url)) {
  console.error('Invalid Supabase Project URL. Expected: https://PROJECT_REF.supabase.co');
  process.exit(1);
}

if (!isValidAnonKey(anonKey)) {
  console.error('Invalid anon public key. It looks missing, too short, placeholder-like, or not safe for browser use.');
  process.exit(1);
}

const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const next = updateEnvLines(existing, {
  VITE_SUPABASE_URL: url,
  VITE_SUPABASE_ANON_KEY: anonKey,
});

fs.writeFileSync(envPath, next);

console.log('.env.local updated with Supabase browser credentials.');
console.log('Next: run npm run doctor, then restart npm run dev.');
