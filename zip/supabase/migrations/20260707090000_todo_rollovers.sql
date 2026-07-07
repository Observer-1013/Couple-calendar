-- Todo rollover history for moved unfinished tasks.

create table if not exists public.todo_rollovers (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  todo_id uuid not null references public.todos(id) on delete cascade,
  from_date date not null,
  to_date date not null,
  text text not null,
  assignee_role text not null default 'both' check (assignee_role in ('him', 'her', 'both', 'unassigned')),
  rolled_over_by uuid references auth.users(id) on delete set null,
  rolled_over_at timestamptz not null default now()
);

create unique index if not exists todo_rollovers_unique_todo_from_date
  on public.todo_rollovers(couple_id, todo_id, from_date);

create index if not exists todo_rollovers_couple_from_date_idx
  on public.todo_rollovers(couple_id, from_date);

alter table public.todo_rollovers enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'todo_rollovers'
      and policyname = 'members can view todo rollovers'
  ) then
    create policy "members can view todo rollovers"
      on public.todo_rollovers
      for select
      to authenticated
      using (public.is_couple_member(couple_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'todo_rollovers'
      and policyname = 'members can create todo rollovers'
  ) then
    create policy "members can create todo rollovers"
      on public.todo_rollovers
      for insert
      to authenticated
      with check (public.is_couple_member(couple_id));
  end if;
end $$;

grant select, insert on public.todo_rollovers to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.todo_rollovers;
    exception when duplicate_object then null;
    end;
  end if;
end $$;
