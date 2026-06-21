import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

export const GOOGLE_CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

class CalendarApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function requiredEnv(name, fallback) {
  const value = process.env[name] || fallback;
  if (!value) throw new CalendarApiError(500, `Missing server env: ${name}`);
  return value;
}

function getSupabaseUrl() {
  return requiredEnv('SUPABASE_URL', process.env.VITE_SUPABASE_URL);
}

function getServiceRoleKey() {
  return requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
}

function getCryptoKey() {
  const raw = requiredEnv('CALENDAR_TOKEN_ENCRYPTION_KEY');
  const decoded = Buffer.from(raw, 'base64');
  if (decoded.length === 32) return decoded;
  return crypto.createHash('sha256').update(raw).digest();
}

export function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export function sendError(res, caught) {
  const statusCode = caught instanceof CalendarApiError ? caught.statusCode : 500;
  const message = caught instanceof Error ? caught.message : 'Calendar API request failed';
  sendJson(res, statusCode, { error: message });
}

export function requireMethod(req, method) {
  if (req.method !== method) {
    throw new CalendarApiError(405, `Use ${method} for this endpoint`);
  }
}

export function getAppUrl(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const host = req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'http';
  return `${proto}://${host}`;
}

export function getGoogleRedirectUri(req) {
  return process.env.GOOGLE_REDIRECT_URI || `${getAppUrl(req)}/api/calendar/google/callback`;
}

export function getGoogleOAuthClient(req) {
  return new google.auth.OAuth2(
    requiredEnv('GOOGLE_CLIENT_ID'),
    requiredEnv('GOOGLE_CLIENT_SECRET'),
    getGoogleRedirectUri(req),
  );
}

export function getSupabaseAdmin() {
  return createClient(getSupabaseUrl(), getServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new CalendarApiError(401, 'Missing Supabase session bearer token');
  return match[1];
}

export async function getAuthenticatedContext(req) {
  const token = getBearerToken(req);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new CalendarApiError(401, 'Invalid Supabase session');

  const { data: memberRows, error: memberError } = await supabase
    .from('couple_members')
    .select('couple_id, role')
    .eq('user_id', data.user.id)
    .limit(1);

  if (memberError) throw new CalendarApiError(500, memberError.message);
  const member = memberRows?.[0];
  if (!member) throw new CalendarApiError(409, 'Create or join a couple workspace before connecting Google Calendar');

  return { supabase, user: data.user, member };
}

function signStateBody(body) {
  return crypto.createHmac('sha256', getCryptoKey()).update(body).digest('base64url');
}

export function createOAuthState(payload) {
  const body = Buffer.from(JSON.stringify({
    ...payload,
    nonce: crypto.randomUUID(),
    expiresAt: Date.now() + 10 * 60 * 1000,
  })).toString('base64url');
  return `${body}.${signStateBody(body)}`;
}

export function readOAuthState(state) {
  const [body, signature] = String(state || '').split('.');
  if (!body || !signature) throw new CalendarApiError(400, 'Invalid OAuth state');

  const expected = Buffer.from(signStateBody(body));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    throw new CalendarApiError(400, 'Invalid OAuth state signature');
  }

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (!payload.expiresAt || Date.now() > payload.expiresAt) {
    throw new CalendarApiError(400, 'Expired OAuth state');
  }
  return payload;
}

export function encryptJson(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getCryptoKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(value), 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    'v1',
    iv.toString('base64url'),
    tag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join(':');
}

export function decryptJson(value) {
  const [version, ivText, tagText, encryptedText] = String(value || '').split(':');
  if (version !== 'v1' || !ivText || !tagText || !encryptedText) {
    throw new CalendarApiError(500, 'Invalid stored Google Calendar token');
  }

  const decipher = crypto.createDecipheriv('aes-256-gcm', getCryptoKey(), Buffer.from(ivText, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedText, 'base64url')),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString('utf8'));
}
