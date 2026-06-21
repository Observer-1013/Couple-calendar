-- Google Calendar OAuth readiness.
-- Run after 20260621102000_external_calendar_sync_readiness.sql.

create unique index if not exists calendar_connections_unique_user_provider
  on public.calendar_connections(couple_id, user_id, provider);

create unique index if not exists events_unique_source_external_for_upsert
  on public.events(couple_id, source, external_id);
