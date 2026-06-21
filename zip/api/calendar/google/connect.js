import {
  GOOGLE_CALENDAR_SCOPES,
  createOAuthState,
  getAuthenticatedContext,
  getGoogleOAuthClient,
  requireMethod,
  sendError,
  sendJson,
} from '../../_googleCalendarShared.js';

export default async function handler(req, res) {
  try {
    requireMethod(req, 'GET');
    const { user, member } = await getAuthenticatedContext(req);
    const oauthClient = getGoogleOAuthClient(req);
    const state = createOAuthState({
      userId: user.id,
      coupleId: member.couple_id,
      role: member.role,
    });
    const authUrl = oauthClient.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: true,
      scope: GOOGLE_CALENDAR_SCOPES,
      state,
    });

    sendJson(res, 200, { authUrl });
  } catch (caught) {
    sendError(res, caught);
  }
}
