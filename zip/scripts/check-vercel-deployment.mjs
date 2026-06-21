import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { parse } from 'dotenv';

const root = process.cwd();
const args = process.argv.slice(2);
const envPath = path.join(root, '.env.local');
const distIndexPath = path.join(root, 'dist', 'index.html');
const checks = [];

function getArg(name) {
  const prefix = `${name}=`;
  const inline = args.find(arg => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = args.indexOf(name);
  if (index >= 0 && args[index + 1]) return args[index + 1];
  return '';
}

function printHelp() {
  console.log(`CoupleSync Vercel deployment verification

Usage:
  npm run build
  npm run verify:vercel -- --production-url https://YOUR_APP.vercel.app

This compares the local dist/index.html asset bundle with the HTML served by the production Vercel URL.
It does not require Vercel credentials and does not deploy anything.`);
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

function record(status, label, detail = '') {
  checks.push({ status, label, detail });
}

function extractAssets(html) {
  const assets = new Set();
  for (const match of html.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+)"/g)) {
    assets.add(match[1]);
  }
  return [...assets].sort();
}

function getHeader(headers, name) {
  if (typeof headers.get === 'function') return headers.get(name);
  return headers[name.toLowerCase()] ?? '';
}

function summarizeHeaders(response) {
  const interestingHeaders = ['last-modified', 'etag', 'x-vercel-cache', 'server'];
  return interestingHeaders
    .map(name => {
      const value = getHeader(response.headers, name);
      return value ? `${name}: ${value}` : '';
    })
    .filter(Boolean)
    .join('; ');
}

function parseCurlHeaders(headerBlock) {
  const headers = {};
  const lines = headerBlock.split(/\r?\n/);
  const statusLine = lines.shift() ?? '';
  const statusMatch = statusLine.match(/\s(\d{3})(?:\s|$)/);

  for (const line of lines) {
    const separator = line.indexOf(':');
    if (separator <= 0) continue;
    headers[line.slice(0, separator).trim().toLowerCase()] = line.slice(separator + 1).trim();
  }

  return {
    ok: statusMatch ? Number(statusMatch[1]) >= 200 && Number(statusMatch[1]) < 300 : false,
    status: statusMatch ? Number(statusMatch[1]) : 0,
    headers,
  };
}

function fetchProductionHtmlWithCurl(verificationUrl) {
  const result = spawnSync('curl', [
    '--silent',
    '--show-error',
    '--location',
    '--dump-header',
    '-',
    '--header',
    'Cache-Control: no-cache',
    verificationUrl,
  ], {
    encoding: 'utf8',
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error((result.stderr || `curl exited with status ${result.status}`).trim());
  }

  const parts = result.stdout.split(/\r?\n\r?\n/).filter(Boolean);
  const bodyIndex = parts.findLastIndex(part => /<!doctype html|<html/i.test(part));
  if (bodyIndex < 0) throw new Error('curl response did not contain HTML');

  const headerBlock = parts
    .slice(0, bodyIndex)
    .reverse()
    .find(part => /^HTTP\//i.test(part));
  if (!headerBlock) throw new Error('curl response did not contain HTTP headers');

  const response = parseCurlHeaders(headerBlock);
  return { response, html: parts.slice(bodyIndex).join('\n\n'), transport: 'curl' };
}

async function fetchProductionHtml(productionUrl) {
  const separator = productionUrl.includes('?') ? '&' : '?';
  const verificationUrl = `${productionUrl}${separator}verify=${Date.now()}`;
  try {
    const response = await fetch(verificationUrl, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    const html = await response.text();
    return { response, html, transport: 'fetch' };
  } catch (error) {
    const fallback = fetchProductionHtmlWithCurl(verificationUrl);
    fallback.fetchError = error instanceof Error ? error.message : String(error);
    return fallback;
  }
}

if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

const env = loadEnv();
const productionUrl = normalizeUrl(getArg('--production-url') || env.VITE_PRODUCTION_URL || '');

console.log('CoupleSync Vercel deployment verification');
console.log('');

if (!productionUrl) {
  record('error', 'production URL', 'missing; pass --production-url https://YOUR_APP.vercel.app');
} else if (!isLikelyHttpUrl(productionUrl)) {
  record('error', 'production URL', 'invalid; expected https://YOUR_APP.vercel.app');
} else {
  record('ok', 'production URL', productionUrl);
}

if (!fs.existsSync(distIndexPath)) {
  record('error', 'dist/index.html', 'missing; run npm run build first');
} else {
  record('ok', 'dist/index.html', 'present');
}

if (checks.every(check => check.status === 'ok')) {
  const localHtml = fs.readFileSync(distIndexPath, 'utf8');
  const localAssets = extractAssets(localHtml);
  record(localAssets.length > 0 ? 'ok' : 'error', 'local assets', localAssets.length > 0 ? localAssets.join(', ') : 'no /assets references found');

  try {
    const { response, html, transport, fetchError } = await fetchProductionHtml(productionUrl);
    const liveAssets = extractAssets(html);
    const headers = summarizeHeaders(response);
    const transportDetail = fetchError ? `via ${transport}; fetch fallback reason: ${fetchError}` : `via ${transport}`;

    record(response.ok ? 'ok' : 'error', 'production HTTP', `${response.status}; ${transportDetail}${headers ? `; ${headers}` : ''}`);
    record(liveAssets.length > 0 ? 'ok' : 'error', 'production assets', liveAssets.length > 0 ? liveAssets.join(', ') : 'no /assets references found');

    const localAssetKey = localAssets.join('\n');
    const liveAssetKey = liveAssets.join('\n');
    record(
      localAssetKey === liveAssetKey ? 'ok' : 'error',
      'deployment freshness',
      localAssetKey === liveAssetKey
        ? 'production asset bundle matches local build'
        : 'production asset bundle differs from local build; Vercel has not served the latest build yet',
    );
  } catch (error) {
    record('error', 'production fetch', error instanceof Error ? error.message : String(error));
  }
}

checks.forEach(check => {
  const prefix = check.status === 'ok' ? 'OK' : 'ERROR';
  console.log(`${prefix.padEnd(5)} ${check.label}${check.detail ? ` - ${check.detail}` : ''}`);
});

const errors = checks.filter(check => check.status === 'error').length;
console.log('');

if (errors === 0) {
  console.log('Status: Vercel production appears to match the latest local build.');
} else {
  console.log(`Status: Vercel deployment verification failed (${errors} error${errors === 1 ? '' : 's'}).`);
  console.log('Next: inspect Vercel Dashboard -> Deployments for the latest GitHub commit, project root directory, and build logs.');
  process.exitCode = 1;
}
