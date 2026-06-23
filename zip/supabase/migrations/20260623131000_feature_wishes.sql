-- Shared feature wishlist for future CoupleSync improvements.

create table if not exists public.feature_wishes (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  content text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists feature_wishes_couple_created_at_idx
  on public.feature_wishes(couple_id, created_at);

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'feature_wishes_touch_updated_at'
  ) then
    create trigger feature_wishes_touch_updated_at
      before update on public.feature_wishes
      for each row execute function public.touch_updated_at();
  end if;
end $$;

alter table public.feature_wishes enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'feature_wishes'
      and policyname = 'members can view feature wishes'
  ) then
    create policy "members can view feature wishes"
      on public.feature_wishes
      for select
      to authenticated
      using (public.is_couple_member(couple_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'feature_wishes'
      and policyname = 'members can create feature wishes'
  ) then
    create policy "members can create feature wishes"
      on public.feature_wishes
      for insert
      to authenticated
      with check (public.is_couple_member(couple_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'feature_wishes'
      and policyname = 'members can update feature wishes'
  ) then
    create policy "members can update feature wishes"
      on public.feature_wishes
      for update
      to authenticated
      using (public.is_couple_member(couple_id))
      with check (public.is_couple_member(couple_id));
  end if;
end $$;

grant select, insert, update on public.feature_wishes to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.feature_wishes;
    exception when duplicate_object then null;
    end;
  end if;
end $$;
