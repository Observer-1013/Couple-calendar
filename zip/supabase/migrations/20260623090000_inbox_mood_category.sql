-- Allow mood records in Couple Inbox messages.

alter table public.inbox_messages
  drop constraint if exists inbox_messages_category_check;

alter table public.inbox_messages
  add constraint inbox_messages_category_check
  check (category in ('idea', 'plan', 'love', 'mood'));
