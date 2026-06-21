import {
  GOOGLE_CALENDAR_SCOPES,
  encryptJson,
  getAppUrl,
  getGoogleOAuthClient,
  getSupabaseAdmin,
  readOAuthState,
  requireMethod,
} from '../../_googleCalendarShared.js';

function redirect(res, appUrl, params) {
  const url = new URL(appUrl);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  res.statusCode = 302;
  res.setHeader('location', url.toString());
  res.end();
}

export default async function handler(req, res) {
  const appUrl = getAppUrl(req);

  try {
    requireMethod(req, 'GET');
    const query = req.query || {};
    if (query.error) throw new Error(String(query.error));
    if (!query.code || !query.state) throw new Error('Missing Google OAuth callback code or state');

    const state = readOAuthState(query.state);
    const oauthClient = getGoogleOAuthClient(req);
    const { tokens } = await oauthClient.getToken(String(query.code));
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from('calendar_connections').upsert({
      couple_id: state.coupleId,
      user_id: state.userId,
      provider: 'google',
      provider_account_id: null,
      scopes: GOOGLE_CALENDAR_SCOPES,
      token_reference: encryptJson(tokens),
      sync_status: 'idle',
      last_sync_error: null,
    }, {
      onConflict: 'couple_id,user_id,provider',
    });

    if (error) throw new Error(error.message);
    redirect(res, appUrl, { calendar: 'google-connected' });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : 'Google Calendar connection failed';
    redirect(res, appUrl, { calendar_error: message });
  }
}
