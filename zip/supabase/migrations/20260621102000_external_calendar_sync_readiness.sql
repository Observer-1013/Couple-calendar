-- External calendar sync readiness.
-- Run after 20260621023000_initial_schema.sql.

alter table public.calendar_connections
  add column if not exists sync_status text not null default 'idle'
    check (sync_status in ('idle', 'syncing', 'error')),
  add column if not exists last_synced_at timestamptz,
  add column if not exists last_sync_error text;

create unique index if not exists events_unique_external_per_couple_source
  on public.events(couple_id, source, external_id)
  where source in ('google', 'apple')
    and external_id is not null;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.calendar_connections;
    exception when duplicate_object then null;
    end;
  end if;
end $$;
