-- Profile weather location fields for the right-panel personal status view.
-- Run after the initial schema and delete-policy readiness migrations.

alter table public.profiles
  add column if not exists weather_city text,
  add column if not exists weather_country text,
  add column if not exists weather_latitude double precision,
  add column if not exists weather_longitude double precision,
  add column if not exists weather_updated_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_weather_latitude_range'
  ) then
    alter table public.profiles
      add constraint profiles_weather_latitude_range
      check (weather_latitude is null or (weather_latitude >= -90 and weather_latitude <= 90));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_weather_longitude_range'
  ) then
    alter table public.profiles
      add constraint profiles_weather_longitude_range
      check (weather_longitude is null or (weather_longitude >= -180 and weather_longitude <= 180));
  end if;
end $$;
