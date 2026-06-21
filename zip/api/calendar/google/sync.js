import { google } from 'googleapis';
import {
  decryptJson,
  encryptJson,
  getAuthenticatedContext,
  getGoogleOAuthClient,
  requireMethod,
  sendError,
  sendJson,
} from '../../_googleCalendarShared.js';

function eventDate(value) {
  if (!value) return null;
  return value.date || value.dateTime?.slice(0, 10) || null;
}

function eventTime(value) {
  if (!value?.dateTime) return null;
  return value.dateTime.slice(11, 16);
}

function dateWindow() {
  const start = new Date();
  start.setDate(start.getDate() - 7);
  const end = new Date();
  end.setDate(end.getDate() + 180);
  return {
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
  };
}

export default async function handler(req, res) {
  let context;

  try {
    requireMethod(req, 'POST');
    context = await getAuthenticatedContext(req);
    const { supabase, user, member } = context;

    const { data: connection, error: connectionError } = await supabase
      .from('calendar_connections')
      .select('id, token_reference')
      .eq('couple_id', member.couple_id)
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .maybeSingle();

    if (connectionError) throw new Error(connectionError.message);
    if (!connection?.token_reference) throw new Error('Google Calendar is not connected yet');

    await supabase
      .from('calendar_connections')
      .update({ sync_status: 'syncing', last_sync_error: null })
      .eq('id', connection.id);

    const tokens = decryptJson(connection.token_reference);
    const oauthClient = getGoogleOAuthClient(req);
    oauthClient.setCredentials(tokens);
    oauthClient.on('tokens', async nextTokens => {
      const mergedTokens = { ...tokens, ...nextTokens };
      await supabase
        .from('calendar_connections')
        .update({ token_reference: encryptJson(mergedTokens) })
        .eq('id', connection.id);
    });

    const calendar = google.calendar({ version: 'v3', auth: oauthClient });
    const { timeMin, timeMax } = dateWindow();
    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
    });

    const rows = (data.items ?? [])
      .filter(item => item.id && eventDate(item.start))
      .map(item => ({
        couple_id: member.couple_id,
        title: item.summary || '(No title)',
        event_date: eventDate(item.start),
        start_time: eventTime(item.start),
        end_time: eventTime(item.end),
        all_day: Boolean(item.start?.date),
        owner_role: member.role,
        source: 'google',
        external_id: item.id,
        created_by: user.id,
      }));

    if (rows.length > 0) {
      const { error: upsertError } = await supabase.from('events').upsert(rows, {
        onConflict: 'couple_id,source,external_id',
      });
      if (upsertError) throw new Error(upsertError.message);
    }

    const { error: statusError } = await supabase
      .from('calendar_connections')
      .update({
        sync_status: 'idle',
        last_synced_at: new Date().toISOString(),
        last_sync_error: null,
      })
      .eq('id', connection.id);

    if (statusError) throw new Error(statusError.message);
    sendJson(res, 200, { imported: rows.length });
  } catch (caught) {
    if (context?.supabase && context?.user && context?.member) {
      await context.supabase
        .from('calendar_connections')
        .update({
          sync_status: 'error',
          last_sync_error: caught instanceof Error ? caught.message : 'Google Calendar sync failed',
        })
        .eq('couple_id', context.member.couple_id)
        .eq('user_id', context.user.id)
        .eq('provider', 'google');
    }
    sendError(res, caught);
  }
}
