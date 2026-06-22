-- Enable member-owned destructive actions from the app UI.
-- This migration only grants delete permissions and policies; it does not delete existing data.

create policy "members can delete non-system layers"
  on public.layers
  for delete
  to authenticated
  using (public.is_couple_member(couple_id) and is_system = false);

create policy "members can delete events"
  on public.events
  for delete
  to authenticated
  using (public.is_couple_member(couple_id));

create policy "members can delete habit definitions"
  on public.habit_definitions
  for delete
  to authenticated
  using (public.is_couple_member(couple_id));

create policy "members can delete habit logs"
  on public.habit_logs
  for delete
  to authenticated
  using (public.is_couple_member(couple_id));

create policy "members can delete todos"
  on public.todos
  for delete
  to authenticated
  using (public.is_couple_member(couple_id));

create policy "members can delete inbox messages"
  on public.inbox_messages
  for delete
  to authenticated
  using (public.is_couple_member(couple_id));

grant delete on public.layers to authenticated;
grant delete on public.events to authenticated;
grant delete on public.habit_definitions to authenticated;
grant delete on public.habit_logs to authenticated;
grant delete on public.todos to authenticated;
grant delete on public.inbox_messages to authenticated;
